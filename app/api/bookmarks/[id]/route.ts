import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { title, url, is_quick_access } = await request.json()

  console.log(`[API PATCH] Attempting update: id=${id}, user_id=${user.id}`)

  if (title === undefined && url === undefined && is_quick_access === undefined) {
    return NextResponse.json({ error: 'Title, URL, or Quick Access state is required' }, { status: 400 })
  }

  const updateData: Record<string, any> = {}
  if (title !== undefined) updateData.title = title
  if (url !== undefined) updateData.url = url
  if (is_quick_access !== undefined) updateData.is_quick_access = is_quick_access

  const { data, error } = await supabase
    .from('bookmarks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
