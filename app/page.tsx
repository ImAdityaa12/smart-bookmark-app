'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/BookmarkList'
import { AddBookmarkForm } from '@/components/AddBookmarkForm'
import { SignOutButton } from '@/components/SignOutButton'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      
      setBookmarks(data || [])
      setLoading(false)
    }
    
    checkUser()
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

  const handleBookmarkAdded = useCallback((newBookmark: { url: string; title: string; user_id: string }) => {
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString()
    }
    setBookmarks((current) => [optimisticBookmark, ...current])
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id))
    await supabase.from('bookmarks').delete().eq('id', id)
  }, [supabase])

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
