export function BookmarkSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white border border-[#E5E7EB] rounded-[12px] p-4 flex items-center gap-3 animate-pulse"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F3F4F6]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#F3F4F6] rounded w-3/4" />
            <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
