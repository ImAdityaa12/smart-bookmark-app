interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 flex items-center gap-2.5 px-6 py-4 bg-[#2563EB] text-white rounded-full shadow-[0_12px_40px_rgba(37,99,235,0.4)] hover:bg-[#1D4ED8] hover:shadow-[0_12px_40px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer z-40 group"
      title="Add new bookmark (N)"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white/40 animate-ping group-hover:hidden" />
        <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <span className="font-bold text-[15px] tracking-tight">Add Bookmark</span>
      <span className="hidden lg:flex items-center justify-center w-5 h-5 ml-1 bg-white/20 rounded text-[10px] font-bold">N</span>
    </button>
  )
}
