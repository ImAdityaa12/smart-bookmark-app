'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable, useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { getFoldersWithBookmarksAction, moveBookmarkAction, getCurrentUser } from '@/app/actions'
import { Folder, Bookmark } from '@/types/database.types'
import { Header } from '@/components/header'
import { MoreVertical, ExternalLink, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { User } from '@supabase/supabase-js'

type FolderWithBookmarks = Folder & {
  bookmarks: Bookmark[]
  bookmark_count: number
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderWithBookmarks[]>([])
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      setUser(user)
      if (user) {
        const data = await getFoldersWithBookmarksAction()
        setFolders(data)
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const bookmark = active.data.current?.bookmark as Bookmark
    setActiveBookmark(bookmark)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveBookmark(null)

    if (!over) return

    const bookmarkId = active.id as string
    const fromFolderId = active.data.current?.folderId as string
    const toFolderId = over.id as string

    if (fromFolderId === toFolderId) return

    // Optimistic update
    setFolders(prev => {
      const newFolders = [...prev]
      const fromFolder = newFolders.find(f => f.id === fromFolderId)
      const toFolder = newFolders.find(f => f.id === toFolderId)
      
      if (fromFolder && toFolder) {
        const bookmark = fromFolder.bookmarks.find(b => b.id === bookmarkId)
        if (bookmark) {
          fromFolder.bookmarks = fromFolder.bookmarks.filter(b => b.id !== bookmarkId)
          fromFolder.bookmark_count--
          toFolder.bookmarks = [bookmark, ...toFolder.bookmarks]
          toFolder.bookmark_count++
        }
      }
      return newFolders
    })

    try {
      await moveBookmarkAction(bookmarkId, fromFolderId, toFolderId)
    } catch (error) {
      console.error('Failed to move bookmark:', error)
      // Revert or refetch
      const data = await getFoldersWithBookmarksAction()
      setFolders(data)
    }
  }

  if (loading) {
    return <div className="p-8">Loading folders...</div>
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="px-8 pt-8 pb-4">
        <Header 
          email={user?.email || ''} 
          onAddBookmark={() => {}} // TODO: Implement add modal if needed
        />
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-2xl font-bold text-[#111827]">Folders Kanban</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[14px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 pt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pb-4">
            {folders.map(folder => (
              <KanbanColumn key={folder.id} folder={folder} />
            ))}
          </div>

          <DragOverlay>
            {activeBookmark ? (
              <div className="w-[280px] bg-white rounded-xl p-3 shadow-2xl border border-blue-200 rotate-3 scale-105 pointer-events-none">
                <div className="flex items-center gap-3">
                  {activeBookmark.image_url ? (
                    <img src={activeBookmark.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {activeBookmark.title[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{activeBookmark.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activeBookmark.url}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

function KanbanColumn({ folder }: { folder: FolderWithBookmarks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-[300px] flex flex-col bg-[#F9FAFB] rounded-2xl border transition-colors duration-200",
        isOver ? "bg-blue-50/50 border-blue-200" : "border-[#E5E7EB]"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: folder.color }}
          />
          <h3 className="font-bold text-[#111827] text-sm truncate max-w-[180px]">
            {folder.name}
          </h3>
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {folder.bookmark_count}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 custom-scrollbar">
        {folder.bookmarks.map(bookmark => (
          <KanbanCard key={bookmark.id} bookmark={bookmark} folderId={folder.id} />
        ))}
        {folder.bookmarks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-center p-4">
            <p className="text-xs text-gray-400 font-medium">Drop bookmarks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCard({ bookmark, folderId }: { bookmark: Bookmark; folderId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bookmark.id,
    data: {
      bookmark,
      folderId
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-sm group hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0"
      )}
    >
      <div className="flex items-start gap-3">
        {bookmark.image_url ? (
          <img 
            src={bookmark.image_url} 
            alt="" 
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0" 
            onError={(e) => (e.currentTarget.src = 'https://www.google.com/s2/favicons?domain=' + bookmark.url + '&sz=64')}
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
            {bookmark.title[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
              {bookmark.title}
            </h4>
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[10px] text-gray-500 truncate leading-tight">
            {new URL(bookmark.url).hostname}
          </p>
        </div>
      </div>
    </div>
  )
}
