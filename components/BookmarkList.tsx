'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export function BookmarkList({ initialBookmarks, userId, onOptimisticAdd }: { 
  initialBookmarks: Bookmark[], 
  userId: string,
  onOptimisticAdd?: (callback: (bookmark: Omit<Bookmark, 'id' | 'created_at'>) => void) => void
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()

  const addOptimisticBookmark = (newBookmark: Omit<Bookmark, 'id' | 'created_at'>) => {
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString()
    }
    setBookmarks((current) => [optimisticBookmark, ...current])
  }

  useEffect(() => {
    onOptimisticAdd?.(addOptimisticBookmark)
  }, [])

  const refreshBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setBookmarks(data)
  }

  useEffect(() => {
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => [payload.new as Bookmark, ...current])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) => current.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const handleDelete = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <p className="text-gray-500 text-lg">No bookmarks yet. Add your first one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
              >
                {bookmark.url}
              </a>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(bookmark.id)}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
