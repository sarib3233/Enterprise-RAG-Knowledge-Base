import { useCallback, useRef, useState } from 'react'
import { api } from '../api/client'

interface Props {
  onUploaded: () => void
}

export function DocumentUpload({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setError(null)
      setUploading(true)
      try {
        for (const file of Array.from(files)) {
          await api.uploadDocument(file)
        }
        onUploaded()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [onUploaded],
  )

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void upload(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors ${
          dragging
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15 text-2xl">
          {uploading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          ) : (
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V6m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
          )}
        </div>
        <p className="text-sm font-medium text-slate-200">
          {uploading ? 'Uploading…' : 'Drop a PDF here or click to browse'}
        </p>
        <p className="text-xs text-slate-500">Contracts, research papers, 10-K filings — up to 50 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => void upload(e.target.files)}
        />
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
