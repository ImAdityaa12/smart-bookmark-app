'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/bookmark-list'
import { BookmarkSkeleton } from '@/components/bookmark-skeleton'
import { AddBookmarkForm } from '@/components/add-bookmark-form'
import { SignOutButton } from '@/components/sign-out-button'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from '@/types/database.types'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isSwitchingPage, setIsSwitchingPage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchBookmarks = useCallback(async (page: number, query?: string) => {
    const url = query 
      ? `/api/bookmarks?q=${encodeURIComponent(query)}&page=${page}`
      : `/api/bookmarks?page=${page}`
    
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data.bookmarks)
        setTotalPages(data.totalPages)
        setTotalCount(data.total)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsSwitchingPage(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await fetchBookmarks(1)
      setLoading(false)
    }

    init()
  }, [])

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
        () => {
          fetchBookmarks(currentPage, searchQuery)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, currentPage, searchQuery, fetchBookmarks])

  const handleBookmarkAdded = useCallback((newBookmark: { url: string; title: string }) => {
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      user_id: user?.id ?? '',
      created_at: new Date().toISOString()
    }
    setBookmarks((current) => [optimisticBookmark, ...current].slice(0, 10))
    setTotalCount((prev) => prev + 1)
    setShowAddModal(false)
  }, [user])

  const handleEdit = useCallback(async (id: string, updates: { title: string; url: string }) => {
    setBookmarks((current) =>
      current.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
    await fetch(`/api/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    fetchBookmarks(currentPage, searchQuery)
  }, [currentPage, searchQuery, fetchBookmarks])

  const [searching, setSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialMount = useRef(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !showAddModal && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        setShowAddModal(true)
      }
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAddModal])

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

  const handlePageChange = (newPage: number) => {
    setIsSwitchingPage(true)
    setCurrentPage(newPage)
    fetchBookmarks(newPage, searchQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayedBookmarks = bookmarks

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <p className="text-[13px] text-[#6B7280] font-medium">Loading your bookmarks…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[640px] mx-auto px-5 py-8">

        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#111827]">
                  My Bookmarks
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-[13px] font-bold rounded-xl hover:bg-[#1D4ED8] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Bookmark
              </button>
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Search Bar */}
        {(bookmarks.length > 0 || searchQuery) && (
          <div className="mb-6 animate-fade-in">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bookmarks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all duration-200 text-[15px] text-[#111827] placeholder:text-[#6B7280]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && !searching && (
              <p className="text-[13px] text-[#6B7280] mt-2 ml-1">
                {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            {searching && (
              <p className="text-[13px] text-[#6B7280] mt-2 ml-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching…
              </p>
            )}
          </div>
        )}

        {/* Section Title */}
        {(displayedBookmarks.length > 0 || searchQuery) && (
          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">
              {searchQuery ? 'Search Results' : 'Recently Added'}
            </h3>
            <span className="text-[12px] text-[#6B7280] font-medium">
              {totalCount} total
            </span>
          </div>
        )}

        {/* Bookmark List Container */}
        <div className="min-h-[400px] transition-all duration-300 ease-in-out">
          {searching || isSwitchingPage ? (
            <BookmarkSkeleton />
          ) : (
            <BookmarkList bookmarks={displayedBookmarks} onDelete={handleDelete} onEdit={handleEdit} isSearching={!!searchQuery.trim()} />
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 animate-fade-in">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-white border border-transparent hover:border-[#E5E7EB] rounded-xl disabled:opacity-30 disabled:hover:text-[#6B7280] disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              title="Previous page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show only current, first, last, and neighbors
                if (
                  p === 1 || 
                  p === totalPages || 
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-200 cursor-pointer ${
                        currentPage === p
                          ? 'bg-[#2563EB] text-white shadow-md'
                          : 'text-[#6B7280] hover:bg-white border border-transparent hover:border-[#E5E7EB] hover:text-[#2563EB]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                  return <span key={p} className="text-[#6B7280] px-1">…</span>
                }
                return null
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-white border border-transparent hover:border-[#E5E7EB] rounded-xl disabled:opacity-30 disabled:hover:text-[#6B7280] disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              title="Next page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2.5 px-6 py-4 bg-[#2563EB] text-white rounded-full shadow-[0_12px_40px_rgba(37,99,235,0.4)] hover:bg-[#1D4ED8] hover:shadow-[0_12px_40px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer z-40 group"
        title="Add new bookmark (N)"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/40 animate-ping group-hover:hidden" />
          <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="font-bold text-[15px] tracking-tight">Add Bookmark</span>
        <span className="hidden lg:flex items-center justify-center w-5 h-5 ml-1 bg-white/20 rounded text-[10px] font-bold">N</span>
      </button>

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Add Bookmark</h2>
                  <p className="text-[13px] text-[#6B7280]">Save a new link to your collection</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />
          </div>
        </div>
      )}
    </div>
  )
}
