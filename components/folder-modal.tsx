'use client'

import { useState, useEffect, useRef } from 'react'

const PRESET_COLORS = [
  '#2563EB', // blue
  '#7C3AED', // purple
  '#DC2626', // red
  '#EA580C', // orange
  '#16A34A', // green
  '#0891B2', // cyan
]

interface FolderModalProps {
  mode: 'create' | 'rename'
  initialName?: string
  initialColor?: string
  onSubmit: (name: string, color: string) => void
  onClose: () => void
}

export function FolderModal({ mode, initialName = '', initialColor = '#2563EB', onSubmit, onClose }: FolderModalProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), color)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-[17px] font-bold text-[#111827] mb-5">
          {mode === 'create' ? 'New Folder' : 'Rename Folder'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Folder Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Reading List…"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all text-[15px] text-[#111827]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all duration-150 cursor-pointer"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                  title={c}
                />
              ))}
              <label
                className="w-8 h-8 rounded-full border-2 border-dashed border-[#D1D5DB] flex items-center justify-center cursor-pointer hover:border-[#9CA3AF] transition-colors overflow-hidden"
                title="Custom color"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute w-0 h-0"
                />
                <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 text-[14px] font-semibold bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {mode === 'create' ? 'Create Folder' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[14px] font-semibold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
