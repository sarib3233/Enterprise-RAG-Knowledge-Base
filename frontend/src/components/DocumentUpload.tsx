import { useCallback, useRef, useState } from 'react'
import { api } from '../api/client'
import { UploadCloudIcon } from './icons'

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
        role="button"
        aria-label="Upload PDF"
        className={`group relative cursor-pointer overflow-hidden rounded-3xl p-[1px] transition-all duration-300 ${
          dragging ? 'scale-[1.01]' : ''
        }`}
      >
        {/* Gradient border */}
        <div
          className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
            dragging
              ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-100'
              : 'bg-gradient-to-r from-indigo-500/40 via-white/10 to-violet-500/40 opacity-60 group-hover:opacity-100'
          }`}
        />
        <div
          className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl px-8 py-12 transition-colors duration-300 ${
            dragging ? 'bg-indigo-950/80' : 'bg-slate-950/90 group-hover:bg-slate-900/90'
          }`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 ring-1 ring-white/10 transition-transform duration-300 ${
              dragging ? 'scale-110' : 'group-hover:scale-105 group-hover:-translate-y-0.5'
            }`}
          >
            {uploading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            ) : (
              <UploadCloudIcon className="h-7 w-7 text-indigo-300" />
            )}
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-100">
              {uploading ? 'Uploading…' : dragging ? 'Release to upload' : 'Drop a PDF here'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or <span className="font-medium text-indigo-400 group-hover:text-indigo-300">browse files</span> — contracts,
              research papers, 10-K filings · up to 50 MB
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => void upload(e.target.files)}
        />
      </div>
      {error && (
        <p className="animate-fade-up mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
