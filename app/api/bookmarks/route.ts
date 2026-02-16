import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    bookmarks: data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, url } = await request.json()

  if (!title || !url) {
    return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ title, url, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
