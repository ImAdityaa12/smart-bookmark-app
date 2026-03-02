'use client'

import { getCurrentUser } from '@/app/actions'
import { BookmarkList, BookmarkDragOverlay } from '@/components/bookmark-list'
import { BookmarkSkeleton } from '@/components/bookmark-skeleton'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { RecentBookmarksGrid } from '@/components/recent-bookmarks-grid'
import { PaginationControls } from '@/components/pagination-controls'
import { FloatingActionButton } from '@/components/floating-action-button'
import { BookmarkModal } from '@/components/bookmark-modal'
import { FolderSection } from '@/components/folder-section'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { useFolders } from '@/hooks/use-folders'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeDragBookmarkId, setActiveDragBookmarkId] = useState<string | null>(null)
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

  const {
    folders,
    selectedFolderId,
    folderBookmarks,
    folderLoading,
    folderTotalCount,
    folderCurrentPage,
    folderTotalPages,
    fetchFolders,
    selectFolder,
    changeFolderPage,
    createFolder,
    renameFolder,
    deleteFolder,
    addBookmarkToFolder,
    removeBookmarkFromFolder,
  } = useFolders(user, searchQuery)

  const handleDeleteBookmark = useCallback(async (id: string) => {
    await deleteBookmark(id)
    fetchFolders()
  }, [deleteBookmark, fetchFolders])

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

  const handleDragStart = (event: DragStartEvent) => {
    const bookmarkId = event.active.data.current?.bookmarkId as string | undefined
    if (bookmarkId) setActiveDragBookmarkId(bookmarkId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragBookmarkId(null)
    const { active, over } = event
    if (!over) return

    const bookmarkId = active.data.current?.bookmarkId as string | undefined
    const folderId = over.id as string

    if (bookmarkId && folderId && !folderId.startsWith('temp-folder-') && folders.some((f) => f.id === folderId)) {
      addBookmarkToFolder(bookmarkId, folderId)
    }
  }

  // Determine which bookmark list to display
  const displayBookmarks = selectedFolderId ? folderBookmarks : bookmarks
  const displayLoading = selectedFolderId ? folderLoading : (searching || isSwitchingPage)
  const displayTotalCount = selectedFolderId ? folderTotalCount : totalCount
  const displayCurrentPage = selectedFolderId ? folderCurrentPage : currentPage
  const displayTotalPages = selectedFolderId ? folderTotalPages : totalPages
  const displayChangePage = selectedFolderId ? changeFolderPage : changePage

  const activeDragBookmark = activeDragBookmarkId
    ? (bookmarks.find((b) => b.id === activeDragBookmarkId) ?? folderBookmarks.find((b) => b.id === activeDragBookmarkId) ?? null)
    : null

  const handleRemoveFromFolder = useCallback((bookmarkId: string) => {
    if (selectedFolderId) {
      removeBookmarkFromFolder(bookmarkId, selectedFolderId)
    }
  }, [selectedFolderId, removeBookmarkFromFolder])

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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="max-w-[640px] mx-auto px-5 py-8">
          <Header
            email={user.email ?? ''}
            onAddBookmark={() => setShowAddModal(true)}
          />

          {!searchQuery && !searching && !isSwitchingPage && !selectedFolderId && (
            <RecentBookmarksGrid
              bookmarks={quickAccessBookmarks}
              onRemove={toggleQuickAccess}
            />
          )}

          <FolderSection
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={selectFolder}
            onCreateFolder={createFolder}
            onRenameFolder={(id, name, color) => renameFolder(id, name, color)}
            onDeleteFolder={deleteFolder}
          />

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searching={searching}
            totalCount={displayTotalCount}
            hasBookmarks={displayBookmarks.length > 0 || isSwitchingPage}
          />

          {(displayBookmarks.length > 0 || searchQuery || selectedFolderId) && (
            <div className="flex items-center justify-between mb-3 mt-6">
              <h3 className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">
                {selectedFolderId
                  ? folders.find((f) => f.id === selectedFolderId)?.name ?? 'Folder'
                  : searchQuery
                  ? 'Search Results'
                  : 'Recently Added'}
              </h3>
              <span className="text-[12px] text-[#6B7280] font-medium">
                {displayTotalCount} total
              </span>
            </div>
          )}

          <div>
            {displayLoading ? (
              <BookmarkSkeleton />
            ) : (
              <BookmarkList
                bookmarks={displayBookmarks}
                onDelete={handleDeleteBookmark}
                onEdit={editBookmark}
                onToggleQuickAccess={toggleQuickAccess}
                isSearching={!!searchQuery.trim()}
                onRemoveFromFolder={handleRemoveFromFolder}
                isInFolder={!!selectedFolderId}
              />
            )}
          </div>

          <PaginationControls
            currentPage={displayCurrentPage}
            totalPages={displayTotalPages}
            onPageChange={displayChangePage}
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

      <DragOverlay>
        {activeDragBookmark ? (
          <BookmarkDragOverlay bookmark={activeDragBookmark} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
