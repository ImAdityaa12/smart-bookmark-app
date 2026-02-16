import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-5">
      <div className="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-8 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2563EB] shadow-sm mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2">
            Smart Bookmarks
          </h1>
          <p className="text-[15px] text-[#6B7280]">Save and organize your favorite links</p>
        </div>

        <GoogleSignInButton />

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">Secure login</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <p className="text-center text-[12px] text-[#6B7280] mt-4">
          Your bookmarks are private and encrypted
        </p>
      </div>
    </div>
  )
}
