'use client'

import { Bookmark } from '@/types/database.types'
import { motion } from 'framer-motion'

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}

interface RecentBookmarksGridProps {
  bookmarks: Bookmark[]
}

export function RecentBookmarksGrid({ bookmarks }: RecentBookmarksGridProps) {
  if (bookmarks.length === 0) return null

  // Take the 4 most recent bookmarks
  const recent = bookmarks.slice(0, 4)

  return (
    <div className="mb-8">
      <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-4 ml-1">
        Quick Access
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {recent.map((bookmark) => {
          const faviconUrl = getFaviconUrl(bookmark.url)
          return (
            <motion.a
              key={bookmark.id}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[22%] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-center border border-[#E5E7EB] group-hover:border-[#2563EB] group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)] transition-all duration-300 overflow-hidden relative">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="text-xl font-bold text-[#2563EB]">
                    {bookmark.title[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[11px] sm:text-[12px] font-semibold text-[#374151] truncate w-full text-center group-hover:text-[#2563EB]">
                {bookmark.title}
              </span>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
