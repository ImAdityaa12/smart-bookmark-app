import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Bookmarks</h1>
          <p className="text-gray-600">Save and organize your favorite links</p>
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  )
}
