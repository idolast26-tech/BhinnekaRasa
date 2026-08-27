import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChefHat,
  MessageCircle,
  Clock,
  CheckCheck,
  Coffee,
  Utensils,
  MapPin,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  time: Date
  isBot: boolean
  isError?: boolean
}
import API_BASE_URL from '../config/api'

export default function ChatPage() {
  // Kita kelola state messages secara lokal agar alur AI lebih terkontrol
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Halo! Saya Chef AI 🍜. Ada yang ingin kamu tanyakan seputar kuliner khas Medan? (Soto Medan, Bika Ambon, dll)',
      time: new Date(),
      isBot: true
    }
  ])

  
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isTyping) return

    const userText = inputText.trim()
    setInputText('')
    setIsTyping(true)

    const newUserMsg = {
      id: Date.now().toString(),
      text: userText,
      time: new Date(),
      isBot: false
    }
    setMessages(prev => [...prev, newUserMsg])

    try {
      // Format history untuk dikirim ke backend
      const chatHistory = messages.concat(newUserMsg).map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text
      }))

      // PANGGIL BACKEND SENDIRI (Bukan Groq langsung)
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: data.response,
          time: new Date(),
          isBot: true
        }])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan saat menghubungi server AI.',
        time: new Date(),
        isBot: true,
        isError: true
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const quickActions = [
    { icon: Utensils, text: 'Rekomendasi makanan khas Medan', color: 'from-amber-400 to-orange-500' },
    { icon: MapPin, text: 'Tempat makan terbaik di Medan', color: 'from-blue-400 to-cyan-500' },
    { icon: ChefHat, text: 'Resep Bika Ambon', color: 'from-emerald-400 to-teal-500' },
    { icon: Coffee, text: 'Minuman khas Medan', color: 'from-purple-400 to-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 flex flex-col relative">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251, 146, 60, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

        <div className="relative z-10 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-white">Chat Kuliner</h1>
                <div className="flex items-center gap-2 text-sm text-slate-300 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Powered by Groq AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 1 && !isTyping && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="relative mb-8">
                <div className="w-28 h-28 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-white transform rotate-3 hover:rotate-6 transition-transform duration-500">
                  <ChefHat className="w-14 h-14 text-amber-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-4xl font-bold font-serif text-slate-800 mb-3">Selamat Datang!</h3>
              <p className="text-slate-600 max-w-lg mx-auto mb-10 leading-relaxed text-lg">
                Tanyakan apa saja tentang kuliner Medan, resep, atau rekomendasi restoran
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(action.text)
                      inputRef.current?.focus()
                    }}
                    className="group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-100 hover:border-amber-200 text-left overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                    <div className="relative flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-amber-700 transition-colors">
                        {action.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {message.isBot && (
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${message.isError
                    ? 'bg-gradient-to-br from-red-400 to-red-600'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500'
                    }`}>
                    {message.isError ? <AlertCircle className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                </div>
              )}

              <div className={`max-w-[80%] md:max-w-[70%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                <div
                  className={`relative p-4 md:p-5 shadow-lg transition-all duration-300 ${message.isBot
                    ? message.isError
                      ? 'bg-red-50 text-red-800 rounded-2xl rounded-tl-sm border border-red-200'
                      : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl rounded-tr-sm'
                    }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>

                  <div className={`flex items-center gap-2 mt-2 text-xs ${message.isBot ? (message.isError ? 'text-red-500' : 'text-slate-500') : 'text-white/70'
                    }`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(message.time)}</span>
                    {!message.isBot && <CheckCheck className="w-3 h-3 ml-1" />}
                    {message.isBot && !message.isError && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!message.isBot && (
                <div className="flex-shrink-0 order-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-lg border border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md border-t-2 border-amber-100 shadow-2xl">
        <form onSubmit={handleSend} className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative flex gap-3 bg-white rounded-2xl shadow-xl border-2 border-slate-200 focus-within:border-amber-400 transition-all overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isTyping ? "Chef AI sedang memasak jawaban..." : "Ketik pesan tentang kuliner..."}
                disabled={isTyping}
                className="flex-1 px-6 py-4 text-base outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className={`m-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${inputText.trim() && !isTyping
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {isTyping ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{isTyping ? 'Menunggu...' : 'Kirim'}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">
            Tekan Enter untuk mengirim • AI dapat membuat kesalahan, verifikasi info penting.
          </p>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  )
}