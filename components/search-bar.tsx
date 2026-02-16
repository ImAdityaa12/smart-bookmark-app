import { Dispatch, SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  searching: boolean
  totalCount: number
  hasBookmarks: boolean
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  searching,
  totalCount,
  hasBookmarks
}: SearchBarProps) {
  if (!hasBookmarks && !searchQuery) return null

  return (
    <div className="mb-6 animate-fade-in">
      <div className="relative group">
        <motion.div 
          animate={searching ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 1 }}
          transition={searching ? { repeat: Infinity, duration: 1.5 } : {}}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#2563EB] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </motion.div>
        <input
          type="text"
          placeholder="Search bookmarks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] outline-none transition-all duration-300 text-[15px] text-[#111827] placeholder:text-[#9CA3AF]"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="h-6 mt-2 ml-1">
        <AnimatePresence mode="wait">
          {searching ? (
            <motion.p 
              key="searching"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[13px] text-[#2563EB] font-medium flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
              </span>
              Finding magic...
            </motion.p>
          ) : searchQuery && (
            <motion.p 
              key="results"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[13px] text-[#6B7280] font-medium"
            >
              Found <span className="text-[#111827]">{totalCount}</span> bookmark{totalCount !== 1 ? 's' : ''}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
