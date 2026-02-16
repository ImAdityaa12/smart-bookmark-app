'use client'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export function BookmarkList({ bookmarks, onDelete }: {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
}) {
  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <p className="text-gray-500 text-lg">No bookmarks yet. Add your first one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
              >
                {bookmark.url}
              </a>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
