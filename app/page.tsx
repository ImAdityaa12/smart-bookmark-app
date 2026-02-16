'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/bookmark-list'
import { AddBookmarkForm } from '@/components/add-bookmark-form'
import { SignOutButton } from '@/components/sign-out-button'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from '@/types/database.types'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
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

      const res = await fetch('/api/bookmarks')
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data)
      }
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark
            setBookmarks((current) => {
              const alreadyExists = current.some((b) => b.id === newBookmark.id)
              if (alreadyExists) return current
              const tempIndex = current.findIndex(
                (b) => b.id.startsWith('temp-') && b.title === newBookmark.title && b.url === newBookmark.url
              )
              if (tempIndex !== -1) {
                const updated = [...current]
                updated[tempIndex] = newBookmark
                return updated
              }
              return [newBookmark, ...current]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) => current.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bookmark
            setBookmarks((current) =>
              current.map((b) => (b.id === updated.id ? updated : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleBookmarkAdded = useCallback((newBookmark: { url: string; title: string }) => {
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      user_id: user?.id ?? '',
      created_at: new Date().toISOString()
    }
    setBookmarks((current) => [optimisticBookmark, ...current])
  }, [user])

  const handleDelete = useCallback(async (id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id))
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
              <p className="text-gray-600 mt-1">Welcome, {user.email}</p>
            </div>
            <SignOutButton />
          </div>
          <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />
        </div>
        <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} />
      </div>
    </div>
  )
}
