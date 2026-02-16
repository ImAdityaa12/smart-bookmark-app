'use client'

import { getCurrentUser } from '@/app/actions'
import { BookmarkList } from '@/components/bookmark-list'
import { BookmarkSkeleton } from '@/components/bookmark-skeleton'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { RecentBookmarksGrid } from '@/components/recent-bookmarks-grid'
import { PaginationControls } from '@/components/pagination-controls'
import { FloatingActionButton } from '@/components/floating-action-button'
import { BookmarkModal } from '@/components/bookmark-modal'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    init()
  }, [router])

  const {
    bookmarks,
    quickAccessBookmarks,
    loading,
    searchQuery,
    setSearchQuery,
    searching,
    totalCount,
    currentPage,
    totalPages,
    isSwitchingPage,
    createBookmark,
    editBookmark,
    deleteBookmark,
    toggleQuickAccess,
    changePage
  } = useBookmarks(user)

  const handleBookmarkAdded = useCallback((newBookmark: { url: string; title: string; is_quick_access: boolean }) => {
    createBookmark(newBookmark)
    setShowAddModal(false)
  }, [createBookmark])

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
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.1, 1], 
              opacity: 1,
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 rounded-[24px] bg-[#2563EB] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] mb-8"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-[#111827] mb-2">Smart Bookmarks</h2>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[14px] text-[#6B7280] font-medium">Setting up your collection</span>
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
                className="text-[#2563EB]"
              >
                ...
              </motion.span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-1 bg-[#E5E7EB] rounded-full mt-8 overflow-hidden relative w-48"
          >
            <motion.div 
              animate={{ 
                x: ["-100%", "100%"]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-[#2563EB] w-1/2"
            />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <Header 
          email={user.email ?? ''} 
          onAddBookmark={() => setShowAddModal(true)} 
        />

        {!searchQuery && !searching && !isSwitchingPage && (
          <RecentBookmarksGrid 
            bookmarks={quickAccessBookmarks} 
            onRemove={toggleQuickAccess} 
          />
        )}

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
              onToggleQuickAccess={toggleQuickAccess}
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
