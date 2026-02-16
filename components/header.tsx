import { SignOutButton } from '@/components/sign-out-button'

interface HeaderProps {
  email: string
  onAddBookmark: () => void
}

export function Header({ email, onAddBookmark }: HeaderProps) {
  return (
    <header className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">
              My Bookmarks
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddBookmark}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-[13px] font-bold rounded-xl hover:bg-[#1D4ED8] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Bookmark
          </button>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
