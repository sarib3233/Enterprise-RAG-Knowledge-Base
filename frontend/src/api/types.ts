export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface Document {
  id: string
  filename: string
  title: string
  status: DocumentStatus
  page_count: number | null
  chunk_count: number | null
  error: string | null
  created_at: string
}

export interface Source {
  chunk_id: string
  document_id: string
  document_title: string
  page_number: number
  chunk_index: number
  score: number
  text: string
}

export interface Conversation {
  id: string
  document_id: string | null
  title: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  sources: Source[] | null
  created_at: string
}

export interface ChatStreamHandlers {
  onConversation: (conversationId: string) => void
  onSources: (sources: Source[]) => void
  onToken: (text: string) => void
  onDone: () => void
  onError: (detail: string) => void
}
