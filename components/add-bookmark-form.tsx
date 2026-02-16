'use client'

import { useState } from 'react'

export function AddBookmarkForm({ onBookmarkAdded }: {
  onBookmarkAdded: (bookmark: { url: string; title: string; is_quick_access: boolean }) => void
}) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isQuickAccess, setIsQuickAccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) return

    setLoading(true)
    onBookmarkAdded({ url, title, is_quick_access: isQuickAccess })
    
    // Reset form
    setUrl('')
    setTitle('')
    setIsQuickAccess(false)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5 ml-1">
            Title
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="e.g. My Favorite Recipe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white outline-none transition-all duration-200 text-[15px] text-[#111827] placeholder:text-[#9CA3AF]"
              required
              autoFocus
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#6B7280] mb-1.5 ml-1">
            URL
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white outline-none transition-all duration-200 text-[15px] text-[#111827] placeholder:text-[#9CA3AF]"
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-1">
          <label className="relative flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={isQuickAccess}
              onChange={(e) => setIsQuickAccess(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md peer-checked:bg-[#2563EB] peer-checked:border-[#2563EB] transition-all duration-200" />
            <svg 
              className="absolute left-1 top-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={4}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="ml-2 text-[14px] font-medium text-[#374151] group-hover:text-[#111827] transition-colors">
              Add to Quick Access
            </span>
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563EB] text-white text-[15px] font-bold rounded-xl hover:bg-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 cursor-pointer"
      >
        <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Bookmark
      </button>
    </form>
  )
}
