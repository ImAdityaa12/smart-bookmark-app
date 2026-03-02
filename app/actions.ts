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

export async function createBookmarkAction(formData: { title: string; url: string; image_url?: string; is_quick_access: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { title, url, image_url, is_quick_access } = formData

  if (!title || !url) {
    throw new Error('Title and URL are required')
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ title, url, image_url, user_id: user.id, is_quick_access: !!is_quick_access }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return data
}

export async function updateBookmarkAction(id: string, updates: { title?: string; url?: string; image_url?: string; is_quick_access?: boolean }) {
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

export async function getFoldersAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('folders')
    .select('*, bookmark_folders(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map((f: { id: string; user_id: string; name: string; color: string; created_at: string; bookmark_folders: { count: number }[] }) => ({
    id: f.id,
    user_id: f.user_id,
    name: f.name,
    color: f.color,
    created_at: f.created_at,
    bookmark_count: f.bookmark_folders?.[0]?.count ?? 0,
  }))
}

export async function createFolderAction(name: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('folders')
    .insert([{ name, color, user_id: user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return { ...data, bookmark_count: 0 }
}

export async function renameFolderAction(id: string, name: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('folders')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return data
}

export async function deleteFolderAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return { success: true }
}

export async function addBookmarkToFolderAction(bookmarkId: string, folderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('bookmark_folders')
    .upsert([{ bookmark_id: bookmarkId, folder_id: folderId }], { onConflict: 'bookmark_id,folder_id' })

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function removeBookmarkFromFolderAction(bookmarkId: string, folderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('bookmark_folders')
    .delete()
    .eq('bookmark_id', bookmarkId)
    .eq('folder_id', folderId)

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function getBookmarksInFolderAction(folderId: string, page = 1, limit = 10, q?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('bookmarks')
    .select('*, bookmark_folders!inner(folder_id)', { count: 'exact' })
    .eq('bookmark_folders.folder_id', folderId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    const sanitized = q.replace(/[%_,()]/g, '')
    if (sanitized) {
      query = query.or(`title.ilike.%${sanitized}%,url.ilike.%${sanitized}%`)
    }
  }

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    bookmarks: (data || []).map((b: { id: string; user_id: string; title: string; url: string; image_url?: string | null; is_quick_access: boolean; created_at: string }) => ({
      id: b.id,
      user_id: b.user_id,
      title: b.title,
      url: b.url,
      image_url: b.image_url,
      is_quick_access: b.is_quick_access,
      created_at: b.created_at,
    })),
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getFoldersWithBookmarksAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get folders
  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (foldersError) throw new Error(foldersError.message)

  // Get all bookmark-folder associations for these folders
  const { data: associations, error: assocError } = await supabase
    .from('bookmark_folders')
    .select('bookmark_id, folder_id, bookmarks(*)')
    .in('folder_id', folders.map(f => f.id))

  if (assocError) throw new Error(assocError.message)

  // Group bookmarks by folder
  const foldersWithBookmarks = folders.map(folder => {
    const folderBookmarks = associations
      .filter(a => a.folder_id === folder.id)
      .map(a => a.bookmarks)
      .filter(Boolean) as unknown as Bookmark[]

    return {
      ...folder,
      bookmarks: folderBookmarks,
      bookmark_count: folderBookmarks.length
    }
  })

  return foldersWithBookmarks
}

export async function moveBookmarkAction(bookmarkId: string, fromFolderId: string | null, toFolderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  if (fromFolderId) {
    const { error: deleteError } = await supabase
      .from('bookmark_folders')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .eq('folder_id', fromFolderId)
    
    if (deleteError) throw new Error(deleteError.message)
  }

  const { error: insertError } = await supabase
    .from('bookmark_folders')
    .upsert([{ bookmark_id: bookmarkId, folder_id: toFolderId }], { onConflict: 'bookmark_id,folder_id' })

  if (insertError) throw new Error(insertError.message)

  revalidatePath('/folders')
  return { success: true }
}
