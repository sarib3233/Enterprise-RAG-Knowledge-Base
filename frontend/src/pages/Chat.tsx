import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Document } from '../api/types'
import { ChatWindow } from '../components/ChatWindow'
import { ArrowLeftIcon, FileTextIcon } from '../components/icons'

export function Chat() {
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<Document | null>(null)

  useEffect(() => {
    if (documentId) void api.getDocument(documentId).then(setDocument)
    else setDocument(null)
  }, [documentId])

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6">
      <header className="animate-fade-in flex items-center gap-3 border-b border-white/8 py-4">
        <Link
          to="/"
          className="glass flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:border-white/20 hover:text-white"
          aria-label="Back to library"
        >
          <ArrowLeftIcon className="h-4.5 w-4.5" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-white/10">
          <FileTextIcon className="h-4.5 w-4.5 text-indigo-300" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-semibold capitalize">
            {documentId ? (document?.title ?? '…') : 'All documents'}
          </h1>
          <p className="text-xs text-slate-500">
            {document?.page_count != null
              ? `${document.page_count} pages · ${document.chunk_count} chunks indexed`
              : 'Grounded answers with page-level citations'}
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <ChatWindow
          key={documentId ?? 'all'}
          documentId={documentId}
          documentTitle={document?.title}
        />
      </div>
    </div>
  )
}
