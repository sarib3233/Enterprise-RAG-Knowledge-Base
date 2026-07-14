import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { SparklesIcon } from './components/icons'
import { Chat } from './pages/Chat'
import { Library } from './pages/Library'

function Header() {
  return (
    <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/60 transition-transform group-hover:scale-105">
            <SparklesIcon className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Docu<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Mind</span>
          </span>
        </Link>
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-400 sm:block">
          Enterprise RAG Knowledge Base
        </span>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-backdrop" />
      <div className="flex h-full flex-col">
        <Header />
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:documentId" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
