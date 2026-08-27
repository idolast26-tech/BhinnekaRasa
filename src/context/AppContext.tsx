/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  time: Date;
}

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedFood: number | null;
  setSelectedFood: (id: number | null) => void;
  quizScore: Record<number, number>;
  saveQuizScore: (quizId: number, score: number) => void;
  favorites: number[];
  addToFavorites: (foodId: number) => void;
  chatMessages: ChatMessage[];
  sendMessage: (text: string) => void;
  isBotTyping: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Keyword -> possible bot replies. First matching keyword wins; a random
// reply from that topic's pool is picked so answers still feel a bit varied.
const TOPIC_RESPONSES: { keywords: string[]; replies: string[] }[] = [
  {
    keywords: ['soto'],
    replies: [
      'Soto Medan itu hasil akulturasi Tionghoa dan Indonesia, lho! Mau lihat sejarah lengkapnya di menu Dapur Akulturasi?',
      'Soto Medan biasanya disajikan dengan kuah santan yang gurih dan kerupuk. Sudah pernah coba?',
      'Kata "soto" sendiri berasal dari dialek Tionghoa yang berarti jeroan berkuah rempah. Menarik, kan?'
    ]
  },
  {
    keywords: ['ci cong fan', 'cicongfan', 'cicong'],
    replies: [
      'Ci Cong Fan adalah kue beras kukus khas Tionghoa-Medan, biasanya diisi ebi atau udang. Kamu bisa cek resepnya di halaman Dapur Akulturasi.',
      'Aslinya isian Ci Cong Fan itu babi panggang merah, tapi di Medan dilokalkan jadi ebi, udang segar, sampai versi polos dengan saus khas Medan.'
    ]
  },
  {
    keywords: ['bika ambon'],
    replies: [
      'Bika Ambon lahir dari perpaduan resep Bingka Melayu dan teknik fermentasi Tionghoa. Jalan Mojopahit terkenal jadi sentranya!',
      'Uniknya, Bika Ambon justru "lahir" di Medan, bukan di Ambon. Namanya sering bikin orang salah kira asalnya, lho.'
    ]
  },
  {
    keywords: ['kari bihun'],
    replies: [
      'Kari Bihun Medan memadukan bihun dari budaya Tionghoa dan kari kaya rempah dari India, lalu berbaur lagi dengan cita rasa Melayu.',
      'Kari Bihun berkembang saat Medan jadi pusat perdagangan akhir abad ke-19 — tiga budaya bertemu dalam satu mangkuk.'
    ]
  },
  {
    keywords: ['bolu meranti'],
    replies: [
      'Bolu Meranti terkenal dengan teknik bolu gulung ala Belanda yang dimodifikasi masyarakat Tionghoa-Medan sejak 1970-an.',
      'Nyonya Ai Ling adalah sosok penting di balik Bolu Meranti, menyesuaikan teksturnya jadi lebih padat dan lembut sesuai selera lokal.'
    ]
  },
  {
    keywords: ['durian'],
    replies: [
      'Medan terkenal dengan durian yang tebal dan legit! Sayangnya belum ada di menu Dapur Akulturasi, tapi cocok jadi penutup setelah kuliner berat.',
      'Kalau soal durian, coba tanyakan langsung ke rekomendasi tempat makan lokal ya — banyak kedai durian legendaris di Medan.'
    ]
  },
  {
    keywords: ['minuman', 'teh', 'kopi', 'es'],
    replies: [
      'Untuk sekarang Dapur Akulturasi fokus ke makanan berat, tapi teh manis dan kopi susu sering jadi teman pas makan soto atau bika ambon.',
      'Belum ada data minuman khusus di sini, tapi kamu bisa cek rekomendasi tempat makan — biasanya mereka juga jual minuman khas.'
    ]
  },
  {
    keywords: ['halal', 'babi', 'vegetarian', 'vegan', 'alergi'],
    replies: [
      'Beberapa hidangan seperti Ci Cong Fan aslinya memakai babi, tapi versi Medan umumnya sudah dilokalkan pakai ebi atau udang. Tetap disarankan cek langsung ke tempat makan untuk kepastian bahan.',
      'Untuk info halal atau alergi bahan tertentu, paling aman tanyakan langsung ke restoran yang direkomendasikan di tiap hidangan.'
    ]
  },
  {
    keywords: ['pedas', 'asin', 'manis', 'gurih', 'rasa'],
    replies: [
      'Soal rasa, Soto Medan cenderung gurih santan, Bika Ambon manis lembut, dan Kari Bihun lebih kaya rempah dengan sedikit pedas.',
      'Setiap hidangan punya karakter rasa beda karena percampuran budayanya — coba jelajahi satu-satu di Dapur Akulturasi!'
    ]
  },
  {
    keywords: ['oleh-oleh', 'oleh oleh', 'buah tangan'],
    replies: [
      'Bika Ambon dan Bolu Meranti adalah pilihan oleh-oleh paling populer dari Medan!',
      'Kalau mau bawa oleh-oleh, cek rekomendasi tempat di kartu Bika Ambon atau Bolu Meranti — biasanya toko-tokonya legendaris.'
    ]
  },
  {
    keywords: ['kuis', 'quiz', 'personality'],
    replies: [
      'Yuk coba fitur Personality Kuis untuk tahu makanan Medan yang paling cocok sama seleramu!',
      'Kuis kepribadian rasa bisa bantu kamu nemuin hidangan favorit berdasarkan gaya makanmu. Sudah dicoba belum?'
    ]
  },
  {
    keywords: ['favorit', 'simpan', 'bookmark'],
    replies: [
      'Kamu bisa menekan ikon hati di setiap hidangan untuk menyimpannya ke daftar favorit.',
      'Semua hidangan yang kamu simpan di favorit bisa diakses lagi kapan saja lewat menu Profil.'
    ]
  },
  {
    keywords: ['resep', 'bahan', 'masak', 'cara buat', 'cara membuat'],
    replies: [
      'Detail bahan dan cara membuatnya ada di halaman tiap hidangan pada menu Dapur Akulturasi.',
      'Buka salah satu kartu hidangan, lalu lihat bagian "Bahan-bahan Utama" — semua bahan pokoknya sudah dirangkum di sana.'
    ]
  },
  {
    keywords: ['rekomendasi', 'tempat', 'restoran', 'dimana', 'di mana', 'kedai', 'warung'],
    replies: [
      'Kamu bisa cek rekomendasi tempat makan terbaik di setiap kartu hidangan, lengkap dengan jam buka dan kisaran harga.',
      'Coba buka menu Peta Kuliner untuk lihat lokasi tempat makan terdekat sekaligus rutenya.'
    ]
  },
  {
    keywords: ['harga', 'berapa', 'murah', 'mahal'],
    replies: [
      'Kisaran harga tiap tempat makan sudah tercantum di kartu rekomendasi masing-masing hidangan ya.',
      'Harganya bervariasi tergantung tempat, tapi umumnya kuliner Medan ramah di kantong kok.'
    ]
  },
  {
    keywords: ['jam buka', 'jam operasional', 'buka jam berapa', 'tutup jam berapa'],
    replies: [
      'Jam operasional tiap tempat makan bisa kamu lihat langsung di kartu rekomendasi pada setiap hidangan.'
    ]
  },
  {
    keywords: ['apa itu', 'siapa kamu', 'kamu siapa', 'kamu bisa apa', 'fitur apa'],
    replies: [
      'Aku asisten chat di Bhinneka Rasa, bisa bantu jawab soal sejarah, bahan, rekomendasi tempat, sampai fitur kuis di aplikasi ini.',
      'Aku bagian dari Dapur Akulturasi — tanya saja soal hidangan, resep, atau tempat makan khas Medan!'
    ]
  },
  {
    keywords: ['bantuan', 'help', 'bingung', 'cara pakai', 'panduan'],
    replies: [
      'Kamu bisa jelajahi menu Menu untuk daftar hidangan, Peta Kuliner untuk lokasi, atau Dapur Akulturasi untuk cerita di balik tiap makanan. Ada yang mau ditanyakan lebih spesifik?',
      'Tenang, tinggal ketik nama makanan atau topik yang kamu penasaran, nanti aku bantu carikan infonya.'
    ]
  },
  {
    keywords: ['halo', 'hai', 'hi', 'hello', 'pagi', 'siang', 'malam'],
    replies: [
      'Halo juga! Ada yang ingin kamu tahu tentang kuliner khas Medan?',
      'Hai! Selamat datang lagi di Bhinneka Rasa. Mau mulai dari mana hari ini?'
    ]
  },
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you'],
    replies: [
      'Sama-sama! Senang bisa membantu menjelajahi kuliner Medan bersamamu.',
      'Dengan senang hati! Kalau ada pertanyaan lain seputar kuliner Medan, tanya saja lagi ya.'
    ]
  },
  {
    keywords: ['dadah', 'bye', 'sampai jumpa', 'daa', 'pamit'],
    replies: [
      'Sampai jumpa! Jangan lupa mampir lagi ke Dapur Akulturasi ya.',
      'Dadah! Semoga terinspirasi buat coba kuliner Medan hari ini.'
    ]
  },
  {
    keywords: ['bagus', 'keren', 'mantap', 'oke banget', 'suka aplikasi'],
    replies: [
      'Terima kasih! Senang kalau kamu suka menjelajahi Bhinneka Rasa.',
      'Wah, makasih banyak! Masih banyak cerita kuliner Medan lain yang bisa kamu temukan di sini.'
    ]
  }
]

const FALLBACK_RESPONSES = [
  'Menarik! Ada yang bisa saya bantu seputar kuliner Medan?',
  'Kuliner Medan sangat beragam, kamu pasti akan suka menjelajahinya!',
  'Coba lihat menu Dapur Akulturasi untuk cerita di balik tiap hidangan.',
  'Boleh cerita lebih detail? Aku bisa bantu carikan info soal hidangan, resep, atau tempat makan.',
  'Hmm, aku belum yakin maksudnya. Coba tanya soal hidangan tertentu seperti Soto Medan, Bika Ambon, atau Kari Bihun?',
  'Kamu bisa tanya soal sejarah hidangan, bahan, harga, rekomendasi tempat, atau bahkan fitur kuis di aplikasi ini.'
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateBotReply(userText: string): string {
  const normalized = userText.toLowerCase()
  const topic = TOPIC_RESPONSES.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  )
  return topic ? pickRandom(topic.replies) : pickRandom(FALLBACK_RESPONSES)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedFood, setSelectedFood] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState<Record<number, number>>({})
  const [favorites, setFavorites] = useState<number[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, text: 'Halo! Selamat datang di Bhinneka Rasa. Ada yang ingin kamu tanyakan seputar kuliner Medan?', isBot: true, time: new Date() }
  ])
  const [isBotTyping, setIsBotTyping] = useState(false)

  const addToFavorites = (foodId: number) => {
    setFavorites(prev =>
      prev.includes(foodId)
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    )
  }

  const saveQuizScore = (quizId: number, score: number) => {
    setQuizScore(prev => ({ ...prev, [quizId]: score }))
  }

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      isBot: false,
      time: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])
    setIsBotTyping(true)

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: Date.now() + 1,
        text: generateBotReply(trimmed),
        isBot: true,
        time: new Date()
      }
      setChatMessages(prev => [...prev, botResponse])
      setIsBotTyping(false)
    }, 900)
  }

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      selectedFood,
      setSelectedFood,
      quizScore,
      saveQuizScore,
      favorites,
      addToFavorites,
      chatMessages,
      sendMessage,
      isBotTyping
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}