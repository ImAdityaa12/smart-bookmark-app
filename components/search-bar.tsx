import { Dispatch, SetStateAction } from 'react'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  searching: boolean
  totalCount: number
  hasBookmarks: boolean
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  searching,
  totalCount,
  hasBookmarks
}: SearchBarProps) {
  if (!hasBookmarks && !searchQuery) return null

  return (
    <div className="mb-6 animate-fade-in">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search bookmarks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all duration-200 text-[15px] text-[#111827] placeholder:text-[#6B7280]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && !searching && (
        <p className="text-[13px] text-[#6B7280] mt-2 ml-1">
          {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}
      {searching && (
        <p className="text-[13px] text-[#6B7280] mt-2 ml-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Searching…
        </p>
      )}
    </div>
  )
}
