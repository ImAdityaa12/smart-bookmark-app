import { useState, useCallback, useEffect } from 'react'
import { Folder } from '@/types/database.types'
import { BookmarkWithClient } from '@/hooks/use-bookmarks'
import { User } from '@supabase/supabase-js'
import {
  getFoldersAction,
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
  addBookmarkToFolderAction,
  removeBookmarkFromFolderAction,
  getBookmarksInFolderAction,
} from '@/app/actions'

export type FolderWithClient = Folder & { clientId: string }

export function useFolders(user: User | null, searchQuery: string = '') {
  const [folders, setFolders] = useState<FolderWithClient[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folderBookmarks, setFolderBookmarks] = useState<BookmarkWithClient[]>([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [folderTotalCount, setFolderTotalCount] = useState(0)
  const [folderCurrentPage, setFolderCurrentPage] = useState(1)
  const [folderTotalPages, setFolderTotalPages] = useState(1)

  const fetchFolders = useCallback(async () => {
    if (!user) return
    try {
      const data = await getFoldersAction()
      setFolders(data.map((f) => ({ ...f, clientId: f.id })))
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchFolders()
  }, [user, fetchFolders])

  const fetchFolderBookmarks = useCallback(async (folderId: string, page = 1, q?: string) => {
    if (folderId.startsWith('temp-folder-')) return
    setFolderLoading(true)
    try {
      const data = await getBookmarksInFolderAction(folderId, page, 10, q)
      setFolderBookmarks(data.bookmarks.map((b) => ({ ...b, clientId: b.id })))
      setFolderTotalCount(data.total)
      setFolderCurrentPage(data.page)
      setFolderTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching folder bookmarks:', error)
    } finally {
      setFolderLoading(false)
    }
  }, [])

  // Refetch when search query changes if a folder is selected
  useEffect(() => {
    if (selectedFolderId) {
      const timer = setTimeout(() => {
        fetchFolderBookmarks(selectedFolderId, 1, searchQuery)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedFolderId, searchQuery, fetchFolderBookmarks])

  const selectFolder = useCallback((id: string | null) => {
    setSelectedFolderId(id)
    setFolderCurrentPage(1)
    if (id) {
      fetchFolderBookmarks(id, 1, searchQuery)
    } else {
      setFolderBookmarks([])
      setFolderTotalCount(0)
      setFolderTotalPages(1)
    }
  }, [fetchFolderBookmarks, searchQuery])

  const changeFolderPage = useCallback((page: number) => {
    if (!selectedFolderId) return
    setFolderCurrentPage(page)
    fetchFolderBookmarks(selectedFolderId, page, searchQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedFolderId, fetchFolderBookmarks, searchQuery])

  const createFolder = useCallback(async (name: string, color: string) => {
    const tempId = 'temp-folder-' + Date.now()
    const optimistic: FolderWithClient = {
      id: tempId,
      clientId: tempId,
      user_id: user?.id ?? '',
      name,
      color,
      created_at: new Date().toISOString(),
      bookmark_count: 0,
    }
    setFolders((prev) => [...prev, optimistic])

    try {
      const real = await createFolderAction(name, color)
      setFolders((prev) =>
        prev.map((f) => (f.clientId === tempId ? { ...real, clientId: tempId } : f))
      )
    } catch (error) {
      console.error('Error creating folder:', error)
      setFolders((prev) => prev.filter((f) => f.clientId !== tempId))
      alert('Failed to create folder: ' + (error as Error).message)
    }
  }, [user])

  const renameFolder = useCallback(async (id: string, name: string, color: string) => {
    if (id.startsWith('temp-folder-')) return

    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name, color } : f)))

    try {
      await renameFolderAction(id, name, color)
    } catch (error) {
      console.error('Error renaming folder:', error)
      fetchFolders()
      alert('Failed to rename folder: ' + (error as Error).message)
    }
  }, [fetchFolders])

  const deleteFolder = useCallback(async (id: string) => {
    if (id.startsWith('temp-folder-')) return
    if (!confirm('Are you sure you want to delete this folder? Bookmarks inside will not be deleted.')) return

    setFolders((prev) => prev.filter((f) => f.id !== id))
    if (selectedFolderId === id) {
      setSelectedFolderId(null)
      setFolderBookmarks([])
      setFolderTotalCount(0)
    }

    try {
      await deleteFolderAction(id)
    } catch (error) {
      console.error('Error deleting folder:', error)
      fetchFolders()
      alert('Failed to delete folder: ' + (error as Error).message)
    }
  }, [selectedFolderId, fetchFolders])

  const addBookmarkToFolder = useCallback(async (bookmarkId: string, folderId: string) => {
    // Optimistic count update
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, bookmark_count: (f.bookmark_count ?? 0) + 1 } : f
      )
    )

    try {
      await addBookmarkToFolderAction(bookmarkId, folderId)
      // If viewing this folder, refresh bookmarks
      if (selectedFolderId === folderId) {
        fetchFolderBookmarks(folderId, folderCurrentPage, searchQuery)
      }
    } catch (error) {
      console.error('Error adding bookmark to folder:', error)
      // Revert optimistic update
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, bookmark_count: Math.max(0, (f.bookmark_count ?? 1) - 1) } : f
        )
      )
      alert('Failed to add bookmark to folder: ' + (error as Error).message)
    }
  }, [selectedFolderId, folderCurrentPage, fetchFolderBookmarks])

  const removeBookmarkFromFolder = useCallback(async (bookmarkId: string, folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, bookmark_count: Math.max(0, (f.bookmark_count ?? 1) - 1) } : f
      )
    )
    if (selectedFolderId === folderId) {
      setFolderBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
      setFolderTotalCount((prev) => Math.max(0, prev - 1))
    }

    try {
      await removeBookmarkFromFolderAction(bookmarkId, folderId)
    } catch (error) {
      console.error('Error removing bookmark from folder:', error)
      if (selectedFolderId === folderId) {
        fetchFolderBookmarks(folderId, folderCurrentPage, searchQuery)
      }
      fetchFolders()
      alert('Failed to remove bookmark from folder: ' + (error as Error).message)
    }
  }, [selectedFolderId, folderCurrentPage, fetchFolderBookmarks, fetchFolders])

  return {
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
  }
}
