import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Chat } from './pages/Chat'
import { Library } from './pages/Library'

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:documentId" element={<Chat />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
