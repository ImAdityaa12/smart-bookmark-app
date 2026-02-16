'use client'

import { Bookmark } from '@/types/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

interface RecentBookmarksGridProps {
  bookmarks: Bookmark[]
  onRemove: (id: string, currentState: boolean) => void
}

export function RecentBookmarksGrid({ bookmarks, onRemove }: RecentBookmarksGridProps) {
  const [page, setPage] = useState(0)
  const ITEMS_PER_PAGE = 4

  // ONLY bookmarks marked as quick access
  const allItems = useMemo(() => {
    return bookmarks.filter(b => b.is_quick_access)
  }, [bookmarks])

  if (allItems.length === 0) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-white/50 border border-dashed border-[#E5E7EB] rounded-[24px] text-center"
      >
        <p className="text-[13px] text-[#6B7280]">
          Pin your favorite bookmarks to see them here for quick access.
        </p>
      </motion.div>
    )
  }

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE)
  
  // Ensure page is within bounds after removals
  const currentPage = Math.min(page, Math.max(0, totalPages - 1))
  if (currentPage !== page) setPage(currentPage)

  const displayedItems = allItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const nextPage = () => setPage((p) => (p + 1) % totalPages)
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 ml-1">
        <h3 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Quick Access
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={prevPage}
              className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentPage ? 'bg-[#2563EB] w-3' : 'bg-[#E5E7EB]'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={nextPage}
              className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-x-8 px-1 min-h-[100px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="col-span-4 grid grid-cols-4 gap-x-8"
          >
            {displayedItems.map((bookmark) => {
              const faviconUrl = getFaviconUrl(bookmark.url)
              return (
                <div key={(bookmark as any).clientId || bookmark.id} className="relative group w-16">
                  <motion.a
                    layout
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2.5"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-[22%] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center justify-center border border-[#E5E7EB] group-hover:border-[#2563EB] group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)] transition-all duration-300 overflow-hidden relative p-3.5">
                        {faviconUrl ? (
                          <img 
                            src={faviconUrl} 
                            alt="" 
                            className="w-full h-full object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="text-xl font-bold text-[#2563EB]">
                            {bookmark.title[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemove(bookmark.id, bookmark.is_quick_access);
                        }}
                        className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        title="Remove from Quick Access"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    
                    <span className="text-[11px] font-semibold text-[#374151] truncate w-full text-center group-hover:text-[#2563EB] transition-colors">
                      {bookmark.title}
                    </span>
                  </motion.a>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
