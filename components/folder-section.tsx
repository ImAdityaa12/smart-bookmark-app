'use client'

import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { FolderWithClient } from '@/hooks/use-folders'
import { FolderModal } from './folder-modal'

function FolderChip({
  folder,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  folder: FolderWithClient
  isSelected: boolean
  onSelect: () => void
  onRename: (name: string, color: string) => void
  onDelete: () => void
}) {
  const isTemp = folder.id.startsWith('temp-folder-')
  const { isOver, setNodeRef } = useDroppable({ id: folder.id, disabled: isTemp })
  const [menuOpen, setMenuOpen] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', () => setMenuOpen(false), true)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', () => setMenuOpen(false), true)
    }
  }, [menuOpen])

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + window.scrollY + 8,
      left: Math.min(rect.left + window.scrollX, window.innerWidth - 160)
    })
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="flex-shrink-0">
      <div
        ref={setNodeRef}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-150 select-none ${
          isTemp ? 'opacity-50 cursor-default' : 'cursor-pointer'
        } ${
          isSelected
            ? 'text-white border-transparent shadow-sm'
            : isOver
            ? 'border-transparent shadow-md scale-105'
            : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:shadow-sm'
        }`}
        style={
          isSelected
            ? { backgroundColor: folder.color }
            : isOver
            ? { backgroundColor: folder.color + '22', borderColor: folder.color }
            : {}
        }
        onClick={() => !isTemp && onSelect()}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : folder.color }}
        />
        <span className="max-w-[120px] truncate">{folder.name}</span>
        {typeof folder.bookmark_count === 'number' && (
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              isSelected ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            {folder.bookmark_count}
          </span>
        )}

        {!isTemp && (
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className={`ml-1 p-1 -mr-1 rounded-full transition-colors cursor-pointer relative z-10 ${
              isSelected ? 'hover:bg-white/20' : 'hover:bg-[#F3F4F6]'
            }`}
            title="Folder options"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        )}
      </div>

      {/* Context menu - Using fixed to avoid overflow/clipping issues */}
      {!isTemp && menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-white border border-[#E5E7EB] rounded-xl shadow-xl py-1 min-w-[140px]"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            onClick={() => { setMenuOpen(false); setShowRename(true) }}
          >
            <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            Rename
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => { setMenuOpen(false); onDelete() }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {!isTemp && showRename && (
        <FolderModal
          mode="rename"
          initialName={folder.name}
          initialColor={folder.color}
          onSubmit={(name, color) => onRename(name, color)}
          onClose={() => setShowRename(false)}
        />
      )}
    </div>
  )
}

interface FolderSectionProps {
  folders: FolderWithClient[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string, color: string) => void
  onRenameFolder: (id: string, name: string, color: string) => void
  onDeleteFolder: (id: string) => void
}

export function FolderSection({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSectionProps) {
  const [showCreate, setShowCreate] = useState(false)

  if (folders.length === 0 && !showCreate) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-[#D1D5DB] text-[13px] text-[#9CA3AF] hover:border-[#6B7280] hover:text-[#6B7280] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Folder
        </button>
        {showCreate && (
          <FolderModal
            mode="create"
            onSubmit={onCreateFolder}
            onClose={() => setShowCreate(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        <button
          onClick={() => onSelectFolder(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-150 flex-shrink-0 ${
            selectedFolderId === null
              ? 'bg-[#111827] text-white border-transparent'
              : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]'
          }`}
        >
          All
        </button>

        {folders.map((folder) => (
          <FolderChip
            key={folder.clientId}
            folder={folder}
            isSelected={selectedFolderId === folder.id}
            onSelect={() => onSelectFolder(selectedFolderId === folder.id ? null : folder.id)}
            onRename={(name, color) => onRenameFolder(folder.id, name, color)}
            onDelete={() => onDeleteFolder(folder.id)}
          />
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="flex-shrink-0 w-7 h-7 rounded-full border border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] hover:border-[#6B7280] hover:text-[#6B7280] transition-colors cursor-pointer"
          title="New folder"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {showCreate && (
        <FolderModal
          mode="create"
          onSubmit={onCreateFolder}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
