'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Folder, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { name: 'Homepage', href: '/', icon: Home },
  { name: 'Folders', href: '/folders', icon: Folder },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#111827] tracking-tight">Smart Marks</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-blue-50 text-[#2563EB]" 
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[#2563EB]" : "text-[#9CA3AF] group-hover:text-[#4B5563]"
                  )} />
                  <span className="font-semibold text-[14px]">{item.name}</span>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-200 opacity-0 group-hover:opacity-100",
                  isActive ? "text-[#2563EB]" : "text-[#9CA3AF]",
                  isActive && "opacity-100"
                )} />
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[#F3F4F6]">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-[12px] font-medium text-[#6B7280] mb-1">Storage Usage</p>
          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#2563EB] w-[45%] rounded-full" />
          </div>
          <p className="text-[11px] text-[#9CA3AF]">45% of 1000 bookmarks</p>
        </div>
      </div>
    </div>
  )
}
