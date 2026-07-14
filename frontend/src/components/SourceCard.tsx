import { useState } from 'react'
import type { Source } from '../api/types'

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-left transition-colors hover:border-slate-600"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-indigo-400">
          [{index + 1}] {source.document_title} · p.{source.page_number}
        </span>
        <span className="shrink-0 text-slate-500">{(source.score * 100).toFixed(0)}% match</span>
      </div>
      <p className={`mt-1 text-xs leading-relaxed text-slate-400 ${expanded ? '' : 'line-clamp-2'}`}>
        {source.text}
      </p>
    </button>
  )
}
