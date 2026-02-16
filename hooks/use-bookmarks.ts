import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bookmark } from '@/types/database.types'

// Local extension of Bookmark type to include clientId
export type BookmarkWithClient = Bookmark & { clientId: string }

export function useBookmarks(user: any) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isSwitchingPage, setIsSwitchingPage] = useState(false)
  
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialMount = useRef(true)
  const pendingInserts = useRef<Set<string>>(new Set())
  const pendingDeletes = useRef<Set<string>>(new Set())
  const processedIds = useRef<Set<string>>(new Set())

  const fetchBookmarks = useCallback(async (page: number, query?: string) => {
    const url = query 
      ? `/api/bookmarks?q=${encodeURIComponent(query)}&page=${page}`
      : `/api/bookmarks?page=${page}`
    
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        // Map bookmarks to have a stable clientId for React keys
        const bookmarksWithIds = (data.bookmarks || []).map((b: Bookmark) => ({
          ...b,
          clientId: b.id
        }))
        setBookmarks(bookmarksWithIds)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsSwitchingPage(false)
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchBookmarks(1)
    }
  }, [user, fetchBookmarks])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark
            
            // If we already handled this ID (via API response), ignore realtime
            if (processedIds.current.has(newBookmark.id)) {
              return
            }
            
            setBookmarks((current) => {
              if (current.some(b => b.id === newBookmark.id)) return current

              // Check if it's our own insert (pending by URL/Title)
              const normalize = (url: string) => url.toLowerCase().replace(/\/$/, '')
              const pendingKey = `${newBookmark.title}|${newBookmark.url}`
              
              if (pendingInserts.current.has(pendingKey)) {
                // Let API response handle it to avoid flickering
                return current
              }

              // Truly external insert (from another tab/device)
              if (currentPage === 1 && !searchQuery) {
                setTotalCount(prev => prev + 1)
                return [{ ...newBookmark, clientId: newBookmark.id }, ...current]
              }
              return current
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            if (pendingDeletes.current.has(deletedId)) {
              pendingDeletes.current.delete(deletedId)
              return
            }
            setBookmarks((current) => current.filter(b => b.id !== deletedId))
            setTotalCount(prev => Math.max(0, prev - 1))
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bookmark
            setBookmarks((current) =>
              current.map(b => (b.id === updated.id ? { ...updated, clientId: b.clientId } : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, currentPage, searchQuery, fetchBookmarks])

  // Search logic
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = searchQuery.trim()
    
    if (!q) {
      setSearching(false)
      setIsSwitchingPage(true) 
      setCurrentPage(1)
      fetchBookmarks(1)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      setCurrentPage(1)
      await fetchBookmarks(1, q)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, fetchBookmarks])

  const createBookmark = useCallback(async (newBookmark: { url: string; title: string; is_quick_access: boolean }) => {
    const tempId = 'temp-' + Date.now()
    const optimisticBookmark: BookmarkWithClient = {
      ...newBookmark,
      id: tempId,
      clientId: tempId, // Stable key
      user_id: user?.id ?? '',
      created_at: new Date().toISOString()
    }
    
    // 1. Add optimistic
    setBookmarks((current) => [optimisticBookmark, ...current])
    setTotalCount((prev) => prev + 1)
    pendingInserts.current.add(`${newBookmark.title}|${newBookmark.url}`)

    try {
      // 2. Call API
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookmark),
      })

      if (res.ok) {
        const realBookmark = await res.json()
        
        // 3. Mark as processed to ignore subsequent realtime signals for this ID
        processedIds.current.add(realBookmark.id)
        
        // 4. Clean up pending inserts
        pendingInserts.current.delete(`${newBookmark.title}|${newBookmark.url}`)

        // 5. IMMEDIATELY swap temp data for real data in state but KEEP clientId stable
        setBookmarks((current) => 
          current.map(b => b.clientId === tempId ? { ...realBookmark, clientId: tempId } : b)
        )
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
    } catch (error) {
      console.error('[useBookmarks] Create failed:', error)
      pendingInserts.current.delete(`${newBookmark.title}|${newBookmark.url}`)
      setBookmarks((current) => current.filter(b => b.clientId !== tempId))
      setTotalCount((prev) => Math.max(0, prev - 1))
      alert('Failed to add bookmark: ' + (error as Error).message)
    }
  }, [user])

  const editBookmark = useCallback(async (id: string, updates: { title: string; url: string }) => {
    setBookmarks((current) =>
      current.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
    await fetch(`/api/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  }, [])

  const deleteBookmark = useCallback(async (id: string) => {
    if (id.startsWith('temp-')) return
    
    pendingDeletes.current.add(id)
    setBookmarks((current) => current.filter((b) => b.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
  }, [])

  const toggleQuickAccess = useCallback(async (id: string, currentState: boolean) => {
    if (id.startsWith('temp-')) return
    
    const newState = !currentState
    setBookmarks((current) =>
      current.map((b) => (b.id === id ? { ...b, is_quick_access: newState } : b))
    )
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_quick_access: newState }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[useBookmarks] Failed to toggle quick access:', err)
      setBookmarks((current) =>
        current.map((b) => (b.id === id ? { ...b, is_quick_access: currentState } : b))
      )
      alert('Failed to save Quick Access state: ' + (err.error || 'Unknown error'))
    }
  }, [])

  const changePage = (newPage: number) => {
    setIsSwitchingPage(true)
    setCurrentPage(newPage)
    fetchBookmarks(newPage, searchQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    bookmarks,
    loading,
    searchQuery,
    setSearchQuery,
    searching,
    currentPage,
    totalPages,
    totalCount,
    isSwitchingPage,
    createBookmark,
    editBookmark,
    deleteBookmark,
    toggleQuickAccess,
    changePage
  }
}
