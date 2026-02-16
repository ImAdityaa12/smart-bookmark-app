'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="group flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 cursor-pointer"
    >
      <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
      </svg>
      Sign Out
    </button>
  )
}
