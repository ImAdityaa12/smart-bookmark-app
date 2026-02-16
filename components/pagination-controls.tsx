interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex items-center justify-center gap-2 animate-fade-in">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-white border border-transparent hover:border-[#E5E7EB] rounded-xl disabled:opacity-30 disabled:hover:text-[#6B7280] disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
        title="Previous page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show only current, first, last, and neighbors
          if (
            p === 1 || 
            p === totalPages || 
            (p >= currentPage - 1 && p <= currentPage + 1)
          ) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-200 cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'text-[#6B7280] hover:bg-white border border-transparent hover:border-[#E5E7EB] hover:text-[#2563EB]'
                }`}
              >
                {p}
              </button>
            )
          }
          if (p === currentPage - 2 || p === currentPage + 2) {
            return <span key={p} className="text-[#6B7280] px-1">…</span>
          }
          return null
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-white border border-transparent hover:border-[#E5E7EB] rounded-xl disabled:opacity-30 disabled:hover:text-[#6B7280] disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
        title="Next page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
