import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Document } from '../api/types'
import { ChatWindow } from '../components/ChatWindow'

export function Chat() {
  const { documentId } = useParams<{ documentId: string }>()
  const [document, setDocument] = useState<Document | null>(null)

  useEffect(() => {
    if (documentId) void api.getDocument(documentId).then(setDocument)
    else setDocument(null)
  }, [documentId])

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6">
      <header className="flex items-center gap-3 border-b border-slate-800 py-4">
        <Link
          to="/"
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
        >
          ← Library
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-medium">
            {documentId ? (document?.title ?? '…') : 'All documents'}
          </h1>
          {document?.page_count != null && (
            <p className="text-xs text-slate-500">
              {document.page_count} pages · {document.chunk_count} chunks indexed
            </p>
          )}
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
