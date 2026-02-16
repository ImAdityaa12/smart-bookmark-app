'use client'

import { Bookmark } from '@/types/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname
    // Using a higher resolution favicon service or clearbit for better icons
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

interface RecentBookmarksGridProps {
  bookmarks: Bookmark[]
}

export function RecentBookmarksGrid({ bookmarks }: RecentBookmarksGridProps) {
  const [page, setPage] = useState(0)
  const ITEMS_PER_PAGE = 4

  // ONLY bookmarks marked as quick access
  const allItems = useMemo(() => {
    return bookmarks.filter(b => b.is_quick_access)
  }, [bookmarks])

  if (allItems.length === 0) {
    return (
      <div className="mb-8 p-6 bg-white/50 border border-dashed border-[#E5E7EB] rounded-[24px] text-center">
        <p className="text-[13px] text-[#6B7280]">
          Pin your favorite bookmarks to see them here for quick access.
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE)
  const displayedItems = allItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const nextPage = () => setPage((p) => (p + 1) % totalPages)
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 ml-1">
        <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider">
          Quick Access
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={prevPage}
              className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[11px] font-bold text-[#9CA3AF]">
              {page + 1} / {totalPages}
            </span>
            <button 
              onClick={nextPage}
              className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {displayedItems.map((bookmark) => {
            const faviconUrl = getFaviconUrl(bookmark.url)
            return (
              <motion.a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-full aspect-square bg-white rounded-[22%] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-center border border-[#E5E7EB] group-hover:border-[#2563EB] group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)] transition-all duration-300 overflow-hidden relative p-3">
                  {faviconUrl ? (
                    <img 
                      src={faviconUrl} 
                      alt="" 
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="text-2xl font-bold text-[#2563EB]">
                      {bookmark.title[0].toUpperCase()}
                    </div>
                  )}
                  {bookmark.is_quick_access && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] sm:text-[12px] font-semibold text-[#374151] truncate w-full text-center group-hover:text-[#2563EB]">
                  {bookmark.title}
                </span>
              </motion.a>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
