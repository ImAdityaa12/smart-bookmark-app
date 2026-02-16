'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-[13px] font-bold text-[#6B7280] mb-1.5 ml-1 uppercase tracking-wider">
            Title
          </label>
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#2563EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </motion.div>
            <input
              type="text"
              placeholder="e.g. My Favorite Recipe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] focus:bg-white outline-none transition-all duration-300 text-[15px] text-[#111827] placeholder:text-[#9CA3AF]"
              required
              autoFocus
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-[13px] font-bold text-[#6B7280] mb-1.5 ml-1 uppercase tracking-wider">
            URL
          </label>
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.2, rotate: -5 }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#2563EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </motion.div>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F3F4F6] border border-transparent rounded-xl focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] focus:bg-white outline-none transition-all duration-300 text-[15px] text-[#111827] placeholder:text-[#9CA3AF]"
              required
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 ml-1"
        >
          <label className="relative flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={isQuickAccess}
              onChange={(e) => setIsQuickAccess(e.target.checked)}
              className="peer sr-only"
            />
            <motion.div 
              whileTap={{ scale: 0.8 }}
              className="w-5 h-5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md peer-checked:bg-[#2563EB] peer-checked:border-[#2563EB] transition-all duration-200 flex items-center justify-center"
            >
              <AnimatePresence>
                {isQuickAccess && (
                  <motion.svg 
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="w-3.5 h-3.5 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="ml-2.5 text-[14px] font-semibold text-[#4B5563] group-hover:text-[#111827] transition-colors select-none">
              Pin to Quick Access
            </span>
          </label>
        </motion.div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ y: -2, shadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)" }}
        whileTap={{ scale: 0.98, y: 0 }}
        className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#2563EB] text-white text-[15px] font-bold rounded-xl hover:bg-[#1D4ED8] transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 90 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        <span>{loading ? 'Adding Link...' : 'Add Bookmark'}</span>
      </motion.button>
    </form>
  )
}
