import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Document } from '../api/types'
import { DocumentList } from '../components/DocumentList'
import { DocumentUpload } from '../components/DocumentUpload'

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
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-slate-500">
          Upload dense PDFs — contracts, papers, filings — then chat with them.
        </p>
      </header>

      <DocumentUpload onUploaded={refresh} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wide text-slate-400 uppercase">
            Documents {loaded && `(${documents.length})`}
          </h2>
          {readyCount > 1 && (
            <Link to="/chat" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
              Chat across all documents →
            </Link>
          )}
        </div>
        <DocumentList documents={documents} onChanged={refresh} />
      </section>
    </div>
  )
}
