import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Document, DocumentStatus } from '../api/types'
import { AlertIcon, ChatBubbleIcon, CircleCheckIcon, FileTextIcon, TrashIcon } from './icons'

const STATUS_CONFIG: Record<DocumentStatus, { style: string; label: string; pulse?: boolean }> = {
  pending: { style: 'bg-amber-400/10 text-amber-300 ring-amber-400/25', label: 'Queued', pulse: true },
  processing: { style: 'bg-sky-400/10 text-sky-300 ring-sky-400/25', label: 'Indexing', pulse: true },
  ready: { style: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25', label: 'Ready' },
  failed: { style: 'bg-red-400/10 text-red-300 ring-red-400/25', label: 'Failed' },
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${config.style}`}
    >
      {config.pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {status === 'ready' && <CircleCheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />}
      {status === 'failed' && <AlertIcon className="h-3.5 w-3.5" strokeWidth={2.2} />}
      {config.label}
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
      <div className="glass animate-fade-in flex flex-col items-center gap-3 rounded-3xl py-14 text-center">
        <FileTextIcon className="h-10 w-10 text-slate-600" />
        <div>
          <p className="font-medium text-slate-300">Your library is empty</p>
          <p className="mt-1 text-sm text-slate-500">Upload a PDF above to build your knowledge base.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {documents.map((doc, i) => (
        <li
          key={doc.id}
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          className="group glass animate-fade-up flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 ring-1 ring-white/10">
            <FileTextIcon className="h-5.5 w-5.5 text-indigo-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="truncate font-medium text-slate-100 capitalize">{doc.title}</p>
              <StatusBadge status={doc.status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {doc.filename}
              {doc.page_count != null && <> · {doc.page_count} pages</>}
              {doc.chunk_count != null && <> · {doc.chunk_count} chunks indexed</>}
            </p>
            {doc.status === 'failed' && doc.error && (
              <p className="mt-1 truncate text-xs text-red-400">{doc.error}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {doc.status === 'ready' && (
              <Link
                to={`/chat/${doc.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-950/50 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-900/50"
              >
                <ChatBubbleIcon className="h-4 w-4" />
                Chat
              </Link>
            )}
            <button
              onClick={() => {
                void api.deleteDocument(doc.id).then(onChanged)
              }}
              className="rounded-xl p-2 text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 focus:opacity-100"
              title="Delete document"
              aria-label={`Delete ${doc.title}`}
            >
              <TrashIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
