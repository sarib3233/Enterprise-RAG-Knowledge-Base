import { useEffect, useRef, useState } from 'react'
import { streamChat } from '../api/client'
import type { Source } from '../api/types'
import { SourceCard } from './SourceCard'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  streaming?: boolean
}

interface Props {
  documentId?: string
  documentTitle?: string
  initialMessages?: ChatMessage[]
}

export function ChatWindow({ documentId, documentTitle, initialMessages = [] }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const question = input.trim()
    if (!question || busy) return
    setInput('')
    setBusy(true)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', streaming: true },
    ])

    const updateAssistant = (updater: (m: ChatMessage) => ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = updater(next[next.length - 1])
        return next
      })
    }

    try {
      await streamChat(
        question,
        { conversationId: conversationIdRef.current, documentId },
        {
          onConversation: (id) => {
            conversationIdRef.current = id
          },
          onSources: (sources) => updateAssistant((m) => ({ ...m, sources })),
          onToken: (text) => updateAssistant((m) => ({ ...m, content: m.content + text })),
          onDone: () => updateAssistant((m) => ({ ...m, streaming: false })),
          onError: (detail) =>
            updateAssistant((m) => ({
              ...m,
              streaming: false,
              content: m.content || `Something went wrong: ${detail}`,
            })),
        },
      )
    } catch (e) {
      updateAssistant((m) => ({
        ...m,
        streaming: false,
        content: m.content || `Request failed: ${e instanceof Error ? e.message : String(e)}`,
      }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-medium text-slate-300">
              Ask anything about {documentTitle ? `"${documentTitle}"` : 'your documents'}
            </p>
            <p className="max-w-md text-sm text-slate-500">
              Answers are grounded in the uploaded text and cite the exact pages they came from.
            </p>
          </div>
        )}
        {messages.map((message, i) =>
          message.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] space-y-3">
                <div className="rounded-2xl rounded-bl-sm border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                  {message.content}
                  {message.streaming && (
                    <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-indigo-400 align-text-bottom" />
                  )}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Sources</p>
                    {message.sources.map((source, j) => (
                      <SourceCard key={source.chunk_id} source={source} index={j} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="flex gap-2 border-t border-slate-800 pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the document…"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
