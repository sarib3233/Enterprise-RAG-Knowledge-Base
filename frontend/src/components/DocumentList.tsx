import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Document, DocumentStatus } from '../api/types'

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  processing: 'bg-sky-500/15 text-sky-400',
  ready: 'bg-emerald-500/15 text-emerald-400',
  failed: 'bg-red-500/15 text-red-400',
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {(status === 'pending' || status === 'processing') && (
        <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
      )}
      {status}
    </span>
  )
}

interface Props {
  documents: Document[]
  onChanged: () => void
}

export function DocumentList({ documents, onChanged }: Props) {
  if (documents.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No documents yet. Upload a PDF to get started.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="truncate font-medium text-slate-100">{doc.title}</p>
              <StatusBadge status={doc.status} />
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">
              {doc.filename}
              {doc.page_count != null && ` · ${doc.page_count} pages`}
              {doc.chunk_count != null && ` · ${doc.chunk_count} chunks`}
            </p>
            {doc.status === 'failed' && doc.error && (
              <p className="mt-1 text-xs text-red-400">{doc.error}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {doc.status === 'ready' && (
              <Link
                to={`/chat/${doc.id}`}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Chat
              </Link>
            )}
            <button
              onClick={() => {
                void api.deleteDocument(doc.id).then(onChanged)
              }}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
              title="Delete document"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
