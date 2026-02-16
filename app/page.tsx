'use client'

import { createClient } from '@/utils/supabase/client'
import { BookmarkList } from '@/components/bookmark-list'
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

  const handleEdit = useCallback(async (id: string, updates: { title: string; url: string }) => {
    setBookmarks((current) =>
      current.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
    setSearchResults((current) =>
      current?.map((b) => (b.id === id ? { ...b, ...updates } : b)) ?? null
    )
    await fetch(`/api/bookmarks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id))
    setSearchResults((current) => current?.filter((b) => b.id !== id) ?? null)
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
  }, [])

  const [searchResults, setSearchResults] = useState<Bookmark[] | null>(null)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = searchQuery.trim()
    if (!q) {
      abortRef.current?.abort()
      setSearchResults(null)
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      try {
        const res = await fetch(`/api/bookmarks?q=${encodeURIComponent(q)}`, {
          signal: abortRef.current.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
        }
        setSearching(false)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearching(false)
        }
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const displayedBookmarks = searchResults !== null ? searchResults : bookmarks

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
            <SignOutButton />
          </div>
        </header>

        {/* Search Bar */}
        {bookmarks.length > 0 && (
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
            {searchQuery && !searching && searchResults !== null && (
              <p className="text-[13px] text-[#6B7280] mt-2 ml-1">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
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

        {/* Add Bookmark Section */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">Add Bookmark</h2>
            {bookmarks.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#2563EB]/10 text-[#2563EB] rounded-full">
                {bookmarks.length}
              </span>
            )}
          </div>
          <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />
        </div>

        {/* Section Title */}
        {displayedBookmarks.length > 0 && (
          <h3 className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide mb-3 mt-6">
            {searchQuery ? 'Search Results' : 'Recently Added'}
          </h3>
        )}

        {/* Bookmark List */}
        <BookmarkList bookmarks={displayedBookmarks} onDelete={handleDelete} onEdit={handleEdit} isSearching={!!searchQuery.trim()} />
      </div>
    </div>
  )
}
