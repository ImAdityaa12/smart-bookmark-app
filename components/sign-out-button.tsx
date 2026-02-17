'use client'

import { signOutAction } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutAction()
      router.push('/login')
    } catch (error) {
      console.error('Sign out failed:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'var(--color-red-50)' }}
      whileTap={{ scale: 0.98 }}
      disabled={isSigningOut}
      onClick={handleSignOut}
      className="group relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:text-red-600 hover:border-red-200 transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {isSigningOut ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-red-600">Signing out...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            className="flex items-center gap-2"
          >
            <svg 
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <span>Sign Out</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
