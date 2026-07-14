import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Document } from '../api/types'
import { DocumentList } from '../components/DocumentList'
import { DocumentUpload } from '../components/DocumentUpload'
import { BookOpenIcon } from '../components/icons'

const POLL_INTERVAL_MS = 2500

export function Library() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    void api
      .listDocuments()
      .then(setDocuments)
      .finally(() => setLoaded(true))
  }, [])

  useEffect(refresh, [refresh])

  // Poll while any document is still being ingested.
  const hasActive = documents.some((d) => d.status === 'pending' || d.status === 'processing')
  useEffect(() => {
    if (!hasActive) return
    const timer = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [hasActive, refresh])

  const readyCount = documents.filter((d) => d.status === 'ready').length

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header className="animate-fade-up space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Chat with your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            documents
          </span>
        </h1>
        <p className="mx-auto max-w-lg text-[15px] text-pretty text-slate-400">
          Upload dense PDFs and get instant, accurate answers — grounded in the text and cited down to
          the page.
        </p>
      </header>

      <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
        <DocumentUpload onUploaded={refresh} />
      </div>

      <section className="animate-fade-up space-y-4" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-400">
            <BookOpenIcon className="h-4.5 w-4.5" />
            LIBRARY
            {loaded && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-white/10">
                {documents.length}
              </span>
            )}
          </h2>
          {readyCount > 1 && (
            <Link
              to="/chat"
              className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Chat across all documents →
            </Link>
          )}
        </div>
        {loaded && <DocumentList documents={documents} onChanged={refresh} />}
      </section>
    </div>
  )
}
