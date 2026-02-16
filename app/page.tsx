'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/BookmarkList'
import { AddBookmarkForm } from '@/components/AddBookmarkForm'
import { SignOutButton } from '@/components/SignOutButton'
import { useEffect, useState } from 'react'
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

  const handleBookmarkAdded = (newBookmark: { url: string; title: string; user_id: string }) => {
    // Add optimistically with temporary ID
    const optimisticBookmark: Bookmark = {
      ...newBookmark,
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString()
    }
    setBookmarks((current) => [optimisticBookmark, ...current])
  }

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
        <BookmarkList initialBookmarks={bookmarks} userId={user.id} />
      </div>
    </div>
  )
}
