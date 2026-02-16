'use client'

import { useState } from 'react'
import { Bookmark } from '@/types/database.types'

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

function getRelativeTime(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function BookmarkList({ bookmarks, onDelete, onEdit, isSearching }: {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
  onEdit: (id: string, updates: { title: string; url: string }) => void
  isSearching?: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const startEditing = (bookmark: Bookmark) => {
    setEditingId(bookmark.id)
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle('')
    setEditUrl('')
  }

  const saveEdit = () => {
    if (!editingId || !editTitle.trim() || !editUrl.trim()) return
    onEdit(editingId, { title: editTitle.trim(), url: editUrl.trim() })
    setEditingId(null)
    setEditTitle('')
    setEditUrl('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEditing()
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-16 text-center animate-fade-in">
        {isSearching ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F3F4F6] mb-4">
              <svg className="w-8 h-8 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-[#111827] mb-1">No results found</h3>
            <p className="text-[14px] text-[#6B7280] max-w-xs mx-auto">
              Try a different search term or clear the search to see all bookmarks.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F3F4F6] mb-4">
              <svg className="w-8 h-8 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-[#111827] mb-1">No bookmarks yet</h3>
            <p className="text-[14px] text-[#6B7280] max-w-xs mx-auto">
              Start saving your favorite links by adding your first bookmark above.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((bookmark, index) => {
        const faviconUrl = getFaviconUrl(bookmark.url)
        const isOptimistic = bookmark.id.startsWith('temp-')
        const isEditing = editingId === bookmark.id
        const staggerClass = index < 8 ? `stagger-${index + 1}` : 'stagger-8'

        return (
          <div
            key={bookmark.id}
            className={`group bg-white border rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px transition-all duration-200 animate-fade-in opacity-0 ${staggerClass} ${
              isOptimistic ? 'bookmark-optimistic border-[#E5E7EB]' : ''
            } ${isEditing ? 'border-[#2563EB] ring-2 ring-[#2563EB]/10' : 'border-[#E5E7EB]'}`}
          >
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all duration-200 text-[15px] font-semibold text-[#111827]"
                    placeholder="Bookmark title"
                    autoFocus
                  />
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all duration-200 text-[13px] text-[#6B7280]"
                    placeholder="https://example.com"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors duration-200 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#6B7280] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors duration-200 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <span className="text-[11px] text-[#6B7280] ml-auto hidden sm:block">
                      Enter to save · Esc to cancel
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors duration-200">
                    {bookmark.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#6B7280] hover:text-[#2563EB] transition-colors duration-200 truncate max-w-xs"
                    >
                      {getDomainFromUrl(bookmark.url)}
                    </a>
                    <span className="text-[#E5E7EB]">·</span>
                    <span className="text-[12px] text-[#6B7280] flex-shrink-0">
                      {getRelativeTime(bookmark.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#2563EB]/5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Open link"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                  {!isOptimistic && (
                    <button
                      onClick={() => startEditing(bookmark)}
                      className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#2563EB]/5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Edit bookmark"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(bookmark.id)}
                    className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete bookmark"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
