'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getBookmarks(page = 1, limit = 10, q?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('bookmarks')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    const sanitized = q.replace(/[%_,()]/g, '')
    if (sanitized) {
      query = query.or(`title.ilike.%${sanitized}%,url.ilike.%${sanitized}%`)
    }
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  return {
    bookmarks: data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getQuickAccessBookmarks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('is_quick_access', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createBookmarkAction(formData: { title: string; url: string; is_quick_access: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { title, url, is_quick_access } = formData

  if (!title || !url) {
    throw new Error('Title and URL are required')
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ title, url, user_id: user.id, is_quick_access: !!is_quick_access }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return data
}

export async function updateBookmarkAction(id: string, updates: { title?: string; url?: string; is_quick_access?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Bookmark not found')
  }

  revalidatePath('/')
  return data
}

export async function deleteBookmarkAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data.url
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}
