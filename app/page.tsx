'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/bookmark-list'
import { BookmarkSkeleton } from '@/components/bookmark-skeleton'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { PaginationControls } from '@/components/pagination-controls'
import { FloatingActionButton } from '@/components/floating-action-button'
import { BookmarkModal } from '@/components/bookmark-modal'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBookmarks } from '@/hooks/use-bookmarks'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    init()
  }, [])

  const {
    bookmarks,
    loading,
    searchQuery,
    setSearchQuery,
    searching,
    totalCount,
    currentPage,
    totalPages,
    isSwitchingPage,
    addOptimisticBookmark,
    editBookmark,
    deleteBookmark,
    changePage
  } = useBookmarks(user)

  const handleBookmarkAdded = useCallback((newBookmark: { url: string; title: string }) => {
    addOptimisticBookmark(newBookmark)
    setShowAddModal(false)
  }, [addOptimisticBookmark])

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

  if (!user || loading) {
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

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <Header 
          email={user.email} 
          onAddBookmark={() => setShowAddModal(true)} 
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searching={searching}
          totalCount={totalCount}
          hasBookmarks={bookmarks.length > 0 || isSwitchingPage}
        />

        {(bookmarks.length > 0 || searchQuery) && (
          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">
              {searchQuery ? 'Search Results' : 'Recently Added'}
            </h3>
            <span className="text-[12px] text-[#6B7280] font-medium">
              {totalCount} total
            </span>
          </div>
        )}

        <div>
          {searching || isSwitchingPage ? (
            <BookmarkSkeleton />
          ) : (
            <BookmarkList 
              bookmarks={bookmarks} 
              onDelete={deleteBookmark} 
              onEdit={editBookmark} 
              isSearching={!!searchQuery.trim()} 
            />
          )}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>

      <FloatingActionButton onClick={() => setShowAddModal(true)} />

      {showAddModal && (
        <BookmarkModal 
          onClose={() => setShowAddModal(false)} 
          onBookmarkAdded={handleBookmarkAdded} 
        />
      )}
    </div>
  )
}
