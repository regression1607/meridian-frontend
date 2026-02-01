import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Send, Bot, User, Plus, Trash2, MessageSquare, Sparkles, Clock,
  ChevronLeft, MoreVertical, Copy, RefreshCw, Loader2
} from 'lucide-react'
import { aiApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import ReactMarkdown from 'react-markdown'

const QUICK_PROMPTS = [
  { icon: '📊', text: 'How many students are enrolled?', category: 'Students' },
  { icon: '📅', text: "Show today's attendance", category: 'Attendance' },
  { icon: '💰', text: "What's the fee collection this month?", category: 'Fees' },
  { icon: '📆', text: 'List upcoming events', category: 'Events' },
  { icon: '👥', text: 'How many teachers do we have?', category: 'Staff' },
  { icon: '🏫', text: 'Show class information', category: 'Classes' }
]

export default function AIAssistant() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChats = async () => {
    setLoadingChats(true)
    try {
      const res = await aiApi.getChats(20)
      if (res.success) setChats(res.data || [])
    } catch (err) { console.error(err) }
    setLoadingChats(false)
  }

  const loadChat = async (chatId) => {
    try {
      const res = await aiApi.getChatById(chatId)
      if (res.success) {
        setActiveChat(res.data)
        setMessages(res.data.messages.filter(m => m.role !== 'system'))
      }
    } catch (err) { toast.error('Failed to load chat') }
  }

  const startNewChat = () => {
    setActiveChat(null)
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return

    const userMessage = { role: 'user', content: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      let res
      if (activeChat) {
        res = await aiApi.sendMessage(activeChat._id, text.trim())
        if (res.success) {
          setMessages(prev => [...prev, { role: 'assistant', content: res.data.assistantMessage, timestamp: new Date() }])
        }
      } else {
        res = await aiApi.createChat(text.trim())
        if (res.success) {
          setActiveChat(res.data)
          setMessages(res.data.messages.filter(m => m.role !== 'system'))
          loadChats()
        }
      }
    } catch (err) {
      toast.error('Failed to send message')
      setMessages(prev => prev.slice(0, -1))
    }
    setLoading(false)
  }

  const deleteChat = async (chatId, e) => {
    e?.stopPropagation()
    if (!confirm('Delete this chat?')) return
    try {
      await aiApi.deleteChat(chatId)
      setChats(prev => prev.filter(c => c._id !== chatId))
      if (activeChat?._id === chatId) startNewChat()
      toast.success('Chat deleted')
    } catch (err) { toast.error('Failed to delete') }
  }

  const clearAllHistory = async () => {
    if (!confirm('Clear all chat history?')) return
    try {
      await aiApi.clearHistory()
      setChats([])
      startNewChat()
      toast.success('History cleared')
    } catch (err) { toast.error('Failed to clear') }
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50 rounded-xl overflow-hidden border">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r flex flex-col"
          >
            <div className="p-4 border-b">
              <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <Plus className="w-4 h-4" />New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : chats.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No chat history</p>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => loadChat(chat._id)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        activeChat?._id === chat._id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{chat.title}</span>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {chats.length > 0 && (
              <div className="p-2 border-t">
                <button onClick={clearAllHistory} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                  <Trash2 className="w-4 h-4" />Clear History
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <ChevronLeft className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-xs text-gray-500">Powered by Meridian EMS</p>
              </div>
            </div>
          </div>
          <button onClick={startNewChat} className="p-2 hover:bg-gray-100 rounded-lg" title="New Chat">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                I can help you with student information, attendance, fees, events, and more.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="flex items-center gap-2 p-3 bg-white border rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                  >
                    <span className="text-xl">{prompt.icon}</span>
                    <span className="text-sm text-gray-700">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`group relative max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white border shadow-sm rounded-bl-md'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 order-2">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your school..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              AI responses are based on your school's data. Always verify critical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
