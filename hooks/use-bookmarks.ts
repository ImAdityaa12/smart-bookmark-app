import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bookmark } from '@/types/database.types'

export function useBookmarks(user: any) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
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

  const fetchBookmarks = useCallback(async (page: number, query?: string) => {
    console.log(`[useBookmarks] fetchBookmarks: page=${page}, query=${query}`)
    const url = query 
      ? `/api/bookmarks?q=${encodeURIComponent(query)}&page=${page}`
      : `/api/bookmarks?page=${page}`
    
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        console.log(`[useBookmarks] fetchBookmarks success: ${data.bookmarks?.length} items`)
        setBookmarks(data.bookmarks || [])
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.total || 0)
      }
    } catch (error) {
      console.error('[useBookmarks] fetchBookmarks error:', error)
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
          console.log('[useBookmarks] Realtime event:', payload.eventType, payload.new)
          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark
            const pendingKey = `${newBookmark.title}|${newBookmark.url}`
            
            if (pendingInserts.current.has(pendingKey)) {
              console.log('[useBookmarks] Matching pending insert found:', pendingKey)
              pendingInserts.current.delete(pendingKey)
              setBookmarks((current) => {
                const tempIndex = current.findIndex(b => b.id.startsWith('temp-') && b.url === newBookmark.url)
                if (tempIndex !== -1) {
                  console.log('[useBookmarks] Replacing temp bookmark content at index:', tempIndex)
                  const updated = [...current]
                  // Preserve temp ID to prevent React remount flicker
                  updated[tempIndex] = { ...newBookmark, id: updated[tempIndex].id }
                  return updated
                }
                return current
              })
              return
            }

            setBookmarks((current) => {
              const alreadyExists = current.some(b => b.id === newBookmark.id)
              if (alreadyExists) return current
              if (currentPage === 1 && !searchQuery) {
                return [newBookmark, ...current].slice(0, 10)
              }
              return current
            })
            setTotalCount(prev => prev + 1)
          } else if (payload.eventType === 'DELETE') {
            console.log('[useBookmarks] Realtime DELETE:', payload.old.id)
            setBookmarks((current) => current.filter(b => b.id !== payload.old.id))
            setTotalCount(prev => Math.max(0, prev - 1))
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useBookmarks] Realtime UPDATE:', payload.new.id)
            const updated = payload.new as Bookmark
            setBookmarks((current) =>
              current.map(b => (b.id === updated.id ? updated : b))
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
      // Only switch page if we were searching before (optimization)
      // But here we just reset to page 1
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

  const addOptimisticBookmark = useCallback((newBookmark: { url: string; title: string }) => {
    console.log('[useBookmarks] addOptimisticBookmark:', newBookmark)
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      user_id: user?.id ?? '',
      created_at: new Date().toISOString()
    }
    pendingInserts.current.add(`${newBookmark.title}|${newBookmark.url}`)
    setBookmarks((current) => [optimisticBookmark, ...current])
    setTotalCount((prev) => prev + 1)
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
    setBookmarks((current) => current.filter((b) => b.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    fetchBookmarks(currentPage, searchQuery)
  }, [currentPage, searchQuery, fetchBookmarks])

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
    addOptimisticBookmark,
    editBookmark,
    deleteBookmark,
    changePage
  }
}
