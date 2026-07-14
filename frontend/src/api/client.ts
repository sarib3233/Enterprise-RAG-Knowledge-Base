import type { ChatStreamHandlers, Conversation, Document, Message } from './types'

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail ?? detail
    } catch {
      // non-JSON error body
    }
    throw new Error(detail)
  }
  return response.json() as Promise<T>
}

export const api = {
  listDocuments: () => fetch('/api/documents').then((r) => json<Document[]>(r)),

  getDocument: (id: string) => fetch(`/api/documents/${id}`).then((r) => json<Document>(r)),

  uploadDocument: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetch('/api/documents', { method: 'POST', body: form }).then((r) => json<Document>(r))
  },

  deleteDocument: async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete document')
  },

  listConversations: () => fetch('/api/conversations').then((r) => json<Conversation[]>(r)),

  getMessages: (conversationId: string) =>
    fetch(`/api/conversations/${conversationId}/messages`).then((r) => json<Message[]>(r)),
}

/**
 * POST the chat request and parse the SSE stream from the response body.
 * (EventSource only supports GET, so we parse the stream manually.)
 */
export async function streamChat(
  message: string,
  options: { conversationId?: string; documentId?: string },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_id: options.conversationId ?? null,
      document_id: options.documentId ?? null,
    }),
    signal,
  })

  if (!response.ok || !response.body) {
    let detail = response.statusText
    try {
      detail = (await response.json()).detail ?? detail
    } catch {
      // non-JSON error body
    }
    handlers.onError(detail || 'Chat request failed')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const dispatch = (eventName: string, data: string) => {
    switch (eventName) {
      case 'conversation':
        handlers.onConversation(JSON.parse(data).conversation_id)
        break
      case 'sources':
        handlers.onSources(JSON.parse(data))
        break
      case 'token':
        handlers.onToken(JSON.parse(data).text)
        break
      case 'done':
        handlers.onDone()
        break
      case 'error':
        handlers.onError(JSON.parse(data).detail)
        break
    }
  }

  // Events are separated by a blank line; servers may use \n or \r\n endings.
  const boundaryRe = /\r?\n\r?\n/

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary: RegExpExecArray | null
    while ((boundary = boundaryRe.exec(buffer)) !== null) {
      const rawEvent = buffer.slice(0, boundary.index)
      buffer = buffer.slice(boundary.index + boundary[0].length)

      let eventName = 'message'
      const dataLines: string[] = []
      for (const line of rawEvent.split(/\r?\n/)) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim()
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
      }
      if (dataLines.length > 0) dispatch(eventName, dataLines.join('\n'))
    }
  }
}
