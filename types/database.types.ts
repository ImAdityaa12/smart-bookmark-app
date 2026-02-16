export type Bookmark = {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
