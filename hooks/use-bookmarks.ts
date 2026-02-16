import { useState, useCallback, useEffect, useRef } from 'react'
import { Bookmark } from '@/types/database.types'
import { 
  getBookmarks, 
  getQuickAccessBookmarks, 
  createBookmarkAction, 
  updateBookmarkAction, 
  deleteBookmarkAction 
} from '@/app/actions'

// Local extension of Bookmark type to include clientId
export type BookmarkWithClient = Bookmark & { clientId: string }

export function useBookmarks(user: any) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithClient[]>([])
  const [quickAccessBookmarks, setQuickAccessBookmarks] = useState<BookmarkWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isSwitchingPage, setIsSwitchingPage] = useState(false)
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialMount = useRef(true)

  const fetchQuickAccess = useCallback(async () => {
    try {
      const data = await getQuickAccessBookmarks()
      setQuickAccessBookmarks(data.map(b => ({ ...b, clientId: b.id })))
    } catch (error) {
      console.error('Error fetching quick access bookmarks:', error)
    }
  }, [])

  const fetchBookmarks = useCallback(async (page: number, query?: string) => {
    try {
      const data = await getBookmarks(page, 10, query)
      const bookmarksWithIds = (data.bookmarks || []).map((b: Bookmark) => ({
        ...b,
        clientId: b.id
      }))
      setBookmarks(bookmarksWithIds)
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || 0)
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
      fetchQuickAccess()
    }
  }, [user, fetchBookmarks, fetchQuickAccess])

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
    if (newBookmark.is_quick_access) {
      setQuickAccessBookmarks(current => [optimisticBookmark, ...current])
    }
    
    setTotalCount((prev) => prev + 1)

    try {
      // 2. Call Server Action
      const realBookmark = await createBookmarkAction(newBookmark)
      
      // 3. IMMEDIATELY swap temp data for real data in state but KEEP clientId stable
      const finalized = { ...realBookmark, clientId: tempId }
      setBookmarks((current) => 
        current.map(b => b.clientId === tempId ? finalized : b)
      )
      setQuickAccessBookmarks(current => 
        current.map(b => b.clientId === tempId ? finalized : b)
      )
    } catch (error) {
      console.error('[useBookmarks] Create failed:', error)
      setBookmarks((current) => current.filter(b => b.clientId !== tempId))
      setQuickAccessBookmarks(current => current.filter(b => b.clientId !== tempId))
      setTotalCount((prev) => Math.max(0, prev - 1))
      alert('Failed to add bookmark: ' + (error as Error).message)
    }
  }, [user])

  const editBookmark = useCallback(async (id: string, updates: { title: string; url: string }) => {
    const updateFn = (current: BookmarkWithClient[]) => 
      current.map((b) => (b.id === id ? { ...b, ...updates } : b))
    
    setBookmarks(updateFn)
    setQuickAccessBookmarks(updateFn)

    try {
      await updateBookmarkAction(id, updates)
    } catch (error) {
      console.error('Error editing bookmark:', error)
      fetchBookmarks(currentPage, searchQuery)
      fetchQuickAccess()
    }
  }, [currentPage, searchQuery, fetchBookmarks, fetchQuickAccess])

  const deleteBookmark = useCallback(async (id: string) => {
    if (id.startsWith('temp-')) return
    
    setBookmarks((current) => current.filter((b) => b.id !== id))
    setQuickAccessBookmarks((current) => current.filter((b) => b.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    
    try {
      await deleteBookmarkAction(id)
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      fetchBookmarks(currentPage, searchQuery)
      fetchQuickAccess()
    }
  }, [currentPage, searchQuery, fetchBookmarks, fetchQuickAccess])

  const toggleQuickAccess = useCallback(async (id: string, currentState: boolean) => {
    if (id.startsWith('temp-')) return
    
    const newState = !currentState

    const updateFn = (current: BookmarkWithClient[]) => {
      const exists = current.some(b => b.id === id)
      if (newState) {
        if (exists) return current.map(b => b.id === id ? { ...b, is_quick_access: true } : b)
        return current
      } else {
        return current.map(b => b.id === id ? { ...b, is_quick_access: false } : b)
      }
    }

    setBookmarks(updateFn)
    
    // Special handling for Quick Access list
    setQuickAccessBookmarks(current => {
      if (newState) {
        // Find from main list to add to quick access
        const item = bookmarks.find(b => b.id === id)
        if (item) return [{ ...item, is_quick_access: true }, ...current]
        return current
      } else {
        return current.filter(b => b.id !== id)
      }
    })

    try {
      await updateBookmarkAction(id, { is_quick_access: newState })
    } catch (error) {
      console.error('[useBookmarks] Failed to toggle quick access:', error)
      fetchQuickAccess()
      fetchBookmarks(currentPage, searchQuery)
      alert('Failed to save Quick Access state: ' + (error as Error).message)
    }
  }, [bookmarks, currentPage, searchQuery, fetchQuickAccess, fetchBookmarks])

  const changePage = (newPage: number) => {
    setIsSwitchingPage(true)
    setCurrentPage(newPage)
    fetchBookmarks(newPage, searchQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    bookmarks,
    quickAccessBookmarks,
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
