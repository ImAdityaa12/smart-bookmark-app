import { AddBookmarkForm } from '@/components/add-bookmark-form'

interface BookmarkModalProps {
  onClose: () => void
  onBookmarkAdded: (bookmark: { url: string; title: string }) => void
}

export function BookmarkModal({ onClose, onBookmarkAdded }: BookmarkModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Add Bookmark</h2>
              <p className="text-[13px] text-[#6B7280]">Save a new link to your collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <AddBookmarkForm onBookmarkAdded={onBookmarkAdded} />
      </div>
    </div>
  )
}
