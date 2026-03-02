export type Bookmark = {
  id: string
  user_id: string
  title: string
  url: string
  image_url?: string | null
  is_quick_access: boolean
  created_at: string
}

export type Folder = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  bookmark_count?: number
}

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at'>>
      }
      folders: {
        Row: Folder
        Insert: Omit<Folder, 'id' | 'created_at' | 'bookmark_count'>
        Update: Partial<Omit<Folder, 'id' | 'user_id' | 'created_at' | 'bookmark_count'>>
      }
    }
  }
}
