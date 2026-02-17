import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Supabase client should not be used in the browser for security reasons. Use Server Actions instead.'
    )
  }

  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  )
}
