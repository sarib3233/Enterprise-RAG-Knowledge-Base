import { useState } from 'react'
import type { Source } from '../api/types'
import { PageIcon } from './icons'

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const match = Math.max(0, Math.min(1, source.score))

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="glass w-full rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 hover:border-indigo-400/30 hover:bg-white/[0.05]"
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-[11px] font-bold text-indigo-300 ring-1 ring-indigo-400/30">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-300 capitalize">
          {source.document_title}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
          <PageIcon className="h-3.5 w-3.5" />
          p.{source.page_number}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
              style={{ width: `${Math.round(match * 100)}%` }}
            />
          </span>
          <span className="w-7 text-right font-mono text-[10px] text-slate-500">
            {Math.round(match * 100)}%
          </span>
        </span>
      </div>
      <p
        className={`mt-1.5 pl-8 text-xs leading-relaxed text-slate-400 transition-colors ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {source.text}
      </p>
    </button>
  )
}
