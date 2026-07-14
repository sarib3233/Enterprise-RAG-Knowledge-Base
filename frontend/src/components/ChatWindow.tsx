import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { streamChat } from '../api/client'
import type { Source } from '../api/types'
import { SendIcon, SparklesIcon } from './icons'
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

const SUGGESTIONS = [
  'Summarize this document in five bullet points',
  'What are the key figures and dates?',
  'What risks or caveats are mentioned?',
]

function AssistantAvatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-950/50 ring-1 ring-white/15">
      <SparklesIcon className="h-4 w-4 text-white" />
    </span>
  )
}

export function ChatWindow({ documentId, documentTitle, initialMessages = [] }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const question = (text ?? input).trim()
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
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 py-6">
        {messages.length === 0 && (
          <div className="animate-fade-in flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-white/10">
              <SparklesIcon className="h-8 w-8 text-indigo-300" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">
                Ask anything about {documentTitle ? <span className="capitalize">“{documentTitle}”</span> : 'your documents'}
              </p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-pretty text-slate-500">
                Answers are grounded in the uploaded text and cite the exact pages they came from.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => void send(suggestion)}
                  className="glass rounded-full px-4 py-2 text-sm text-slate-300 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) =>
          message.role === 'user' ? (
            <div key={i} className="animate-fade-up flex justify-end">
              <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-4.5 py-3 text-sm leading-relaxed text-white shadow-lg shadow-indigo-950/40">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={i} className="animate-fade-up flex gap-3">
              <AssistantAvatar />
              <div className="min-w-0 max-w-[85%] space-y-3">
                <div className="glass rounded-3xl rounded-tl-lg px-4.5 py-3">
                  {message.content ? (
                    <div className="prose-chat">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 py-1" aria-label="Assistant is thinking">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  )}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="pl-1 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
                      Sources
                    </p>
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
        className="pb-6"
      >
        <div className="glass flex items-center gap-2 rounded-2xl p-2 transition-colors focus-within:border-indigo-400/40">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document…"
            autoFocus
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/50 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
            ) : (
              <SendIcon className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Answers are generated from your documents and may require verification for critical use.
        </p>
      </form>
    </div>
  )
}
