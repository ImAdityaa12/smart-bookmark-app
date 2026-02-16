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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-80 h-80 bg-purple-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl" />

      <div className="w-full max-w-md p-10 glass-strong rounded-3xl shadow-2xl shadow-indigo-200/50 border border-white/40 animate-scale-in relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-300/50 mb-6 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Smart Bookmarks
          </h1>
          <p className="text-gray-500 text-lg">Save and organize your favorite links</p>
        </div>

        <GoogleSignInButton />

        <div className="mt-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">Secure login</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your bookmarks are private and encrypted
        </p>
      </div>
    </div>
  )
}
