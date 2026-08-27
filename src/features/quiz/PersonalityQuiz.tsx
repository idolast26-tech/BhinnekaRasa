import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginModal from '../../components/LoginModal'
import { Star, Trophy, Award, Loader2, ChevronLeft } from 'lucide-react'

import API_BASE_URL from '../../config/api'

const FOOD_NAMES: Record<string, string> = {
  'KB': 'Kari Bihun Medan',
  'SM': 'Soto Medan',
  'BM': 'Bolu Meranti',
  'BA': 'Bika Ambon',
  'CF': 'Cicongfan'
}

const FOOD_DESCRIPTIONS: Record<string, { title: string; subtitle: string; description: string; color: string }> = {
  'Kari Bihun Medan': {
    title: 'KARI BIHUN MEDAN',
    subtitle: 'Si Garang, Bertenaga, & Pantang Mengalah!',
    description: 'Kuah karinya kental, rempahnya nendang, sekali hirup langsung gasss! Kau ini tipe orang yang tegas, gak suka berbelit-belit, dan punya jiwa pemimpin. Kalau ada kawanmu diganggu orang, kau lah yang paling depan pasang badan. Mantap kali!',
    color: 'from-red-500 to-orange-600'
  },
  'Soto Medan': {
    title: 'SOTO MEDAN',
    subtitle: 'Si Hangat, Adem, & Penyejuk Suasana',
    description: 'Kayak kuah santan hangat Soto Medan campur perkedel, kehadiranmu itu selalu bikin tenang. Kau ramah, gak suka cari ribut, dan jadi tempat curhat favorit anak-anak. Kalau kau gak ikut nongkrong, rasanya ada yang kurang pas!',
    color: 'from-amber-400 to-yellow-500'
  },
  'Bolu Meranti': {
    title: 'BOLU MERANTI',
    subtitle: 'Si Ikonik, Rapi, & Bintang Utama',
    description: 'Siapa sih yang gak kenal kau? Mau ke mana pun pergi, nama kau selalu dibawanya. Karismamu tinggi, pinter jaga penampilan, dan manisnya gak bikin enek. Kau selalu berhasil jadi pusat perhatian di mana pun kau berdiri!',
    color: 'from-pink-400 to-rose-500'
  },
  'Bika Ambon': {
    title: 'BIKA AMBON',
    subtitle: 'Si Unik, Perfeksionis, & Aesthetic',
    description: 'Punya tekstur berserat yang khas dan butuh proses rapi pas dibuat, kau ini tipe yang berkelas dan gak suka ikut-ikutan tren pasaran. Punya standar tinggi, cara mikirmu otentik, dan hasil kerjamu selalu bikin orang bilang: "Wih, paten kali bah!"',
    color: 'from-purple-400 to-indigo-500'
  },
  'Cicongfan': {
    title: 'CICONGFAN',
    subtitle: 'Si Santai, Adaptif, & Gak Bikin Pusing',
    description: 'Mau disiram kuah asam manis atau ditabur bawang goreng, Cicongfan tetep enak. Sama kayak kau yang super fleksibel! Masuk ke circle mana aja kau bisa, gak gampang stress, dan prinsip hidupmu simpel: "Dibawa santai aja lek, yang penting beres!"',
    color: 'from-teal-400 to-emerald-500'
  },
  'MIX': {
    title: 'ES CAMPUR MEDAN / RUJAK KOLAM',
    subtitle: 'Si All-in-One, Multi-Talent, & Unpredictable!',
    description: 'Wih, jawabanmu seimbang banget dari A sampai E! Kamu gak bisa dikotak-kotakkan cuma jadi satu jenis makanan. Kamu punya ketegasan Kari Bihun, kehangatan Soto Medan, pesona Bolu Meranti, keunikan Bika Ambon, dan kesantaian Cicongfan. Kamu itu tipe orang yang super fleksibel dan multi-talented—bisa menyesuaikan diri sama situasi apa pun. Pokoknya kamu itu rame, komplit, dan selalu bikin suasana jadi makin seger!',
    color: 'from-blue-400 via-purple-400 to-pink-400'
  }
}

interface Option {
  id: number
  option_text: string
  option_letter: string
  food_target: string
}

interface Question {
  id: number
  question_text: string
  options: Option[]
}

// Fallback data jika API backend tidak tersedia
const LOCAL_QUESTIONS: Question[] = [
  {
    id: 1,
    question_text: 'Apa yang paling menggambarkan caramu memulai pagi hari?',
    options: [
      { id: 1, option_text: 'Langsung gas, gak perlu pemanasan!', option_letter: 'A', food_target: 'KB' },
      { id: 2, option_text: 'Santai sambil ngopi, baru mulai', option_letter: 'B', food_target: 'SM' },
      { id: 3, option_text: 'Rapi dulu baru keluar rumah', option_letter: 'C', food_target: 'BM' },
      { id: 4, option_text: 'Punya ritual unik yang gak bisa diganggu', option_letter: 'D', food_target: 'BA' },
      { id: 5, option_text: 'Fleksibel, tergantung mood', option_letter: 'E', food_target: 'CF' }
    ]
  },
  {
    id: 2,
    question_text: 'Bagaimana caramu menghadapi masalah besar?',
    options: [
      { id: 6, option_text: 'Langsung terjun, pikir belakangan', option_letter: 'A', food_target: 'KB' },
      { id: 7, option_text: 'Tenang, cari solusi bareng teman', option_letter: 'B', food_target: 'SM' },
      { id: 8, option_text: 'Buat rencana detail dulu', option_letter: 'C', food_target: 'BM' },
      { id: 9, option_text: 'Analisis dari sudut pandang berbeda', option_letter: 'D', food_target: 'BA' },
      { id: 10, option_text: 'Dibawa santai, pasti ada jalan', option_letter: 'E', food_target: 'CF' }
    ]
  },
  {
    id: 3,
    question_text: 'Pilih suasana nongkrong yang paling kamu suka!',
    options: [
      { id: 11, option_text: 'Warung pinggir jalan yang ramai', option_letter: 'A', food_target: 'KB' },
      { id: 12, option_text: 'Rumah teman sambil masak bareng', option_letter: 'B', food_target: 'SM' },
      { id: 13, option_text: 'Restoran estetik buat foto-foto', option_letter: 'C', food_target: 'BM' },
      { id: 14, option_text: 'Kafe unik yang jarang orang tahu', option_letter: 'D', food_target: 'BA' },
      { id: 15, option_text: 'Di mana saja yang penting bareng', option_letter: 'E', food_target: 'CF' }
    ]
  },
  {
    id: 4,
    question_text: 'Teman-temanmu biasanya datang ke kamu untuk?',
    options: [
      { id: 16, option_text: 'Minta dibelain kalau ada masalah', option_letter: 'A', food_target: 'KB' },
      { id: 17, option_text: 'Curhat dan cari ketenangan', option_letter: 'B', food_target: 'SM' },
      { id: 18, option_text: 'Minta saran tampilan atau event', option_letter: 'C', food_target: 'BM' },
      { id: 19, option_text: 'Diskusi ide-ide kreatif yang out of the box', option_letter: 'D', food_target: 'BA' },
      { id: 20, option_text: 'Teman jalan ke mana aja', option_letter: 'E', food_target: 'CF' }
    ]
  },
  {
    id: 5,
    question_text: 'Kalau liburan, kamu pilih yang mana?',
    options: [
      { id: 21, option_text: 'Petualangan ekstrem, naik gunung atau arung jeram', option_letter: 'A', food_target: 'KB' },
      { id: 22, option_text: 'Kampung halaman, ketemu keluarga besar', option_letter: 'B', food_target: 'SM' },
      { id: 23, option_text: 'Kota mode atau destinasi wisata populer', option_letter: 'C', food_target: 'BM' },
      { id: 24, option_text: 'Tempat tersembunyi yang belum banyak dikunjungi', option_letter: 'D', food_target: 'BA' },
      { id: 25, option_text: 'Spontan aja, lihat nanti mau ke mana', option_letter: 'E', food_target: 'CF' }
    ]
  }
]

export default function PersonalityQuiz() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowLoginModal(false)
  }, [isAuthenticated])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz?type=personality`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const validQuestions = data.data.filter((q: Question) => Array.isArray(q.options) && q.options.length > 0)
          if (validQuestions.length > 0) {
            setQuestions(validQuestions)
            return
          }
        }
        // Fallback ke data lokal jika API tidak tersedia atau kosong
        setQuestions(LOCAL_QUESTIONS)
      } catch (error) {
        console.error('Error fetching quiz, using local data:', error)
        setQuestions(LOCAL_QUESTIONS)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleAnswer = (foodTarget: string) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(foodTarget)
    
    setTimeout(() => {
      const newAnswers = [...answers, foodTarget]
      setAnswers(newAnswers)
      setSelectedAnswer(null)
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        calculateResult(newAnswers)
      }
    }, 300)
  }

  const calculateResult = (finalAnswers: string[]) => {
    const foodScores = { KB: 0, SM: 0, BM: 0, BA: 0, CF: 0 }
    finalAnswers.forEach(target => {
      if (foodScores[target] !== undefined) foodScores[target] += 10
    })

    const maxScore = Math.max(...Object.values(foodScores))
    const topFoods = Object.entries(foodScores).filter(([_, score]) => score === maxScore)

    let foodResult = ''
    if (topFoods.length > 1) {
      foodResult = 'MIX'
    } else {
      foodResult = FOOD_NAMES[topFoods[0][0]]
    }

    const resultData = { food: foodResult, ...FOOD_DESCRIPTIONS[foodResult], scores: foodScores }
    setResult(resultData)
    setShowResult(true)
    
    if (user) saveToDatabase(foodResult, foodScores)
  }

  const saveToDatabase = async (foodResult: string, foodScores: any) => {
    try {
      setIsSubmitting(true)
      await fetch(`${API_BASE_URL}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          quiz_type: 'personality',
          food_result: foodResult,
          total_score: 0,
          score_kb: foodScores.KB,
          score_sm: foodScores.SM,
          score_bm: foodScores.BM,
          score_ba: foodScores.BA,
          score_cf: foodScores.CF
        })
      })
      console.log('✅ Personality quiz result saved')
    } catch (error) {
      console.error('Error saving quiz result:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          <p className="text-amber-800 font-medium">Memuat pertanyaan quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Pertanyaan quiz tidak ditemukan.</div>
  }

  if (showResult && result) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className={`bg-gradient-to-r ${result.color} p-8 text-white text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
              <Trophy className="w-16 h-16 mx-auto mb-4 relative z-10" />
              <h2 className="text-3xl font-bold mb-2 relative z-10">{result.title}</h2>
              <p className="text-white/90 font-medium relative z-10">{result.subtitle}</p>
            </div>

            <div className="p-8">
              <p className="text-gray-700 leading-relaxed text-lg mb-8">{result.description}</p>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" /> Detail Skor Kamu:
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.scores).map(([key, value]: [string, number]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 w-32">{FOOD_NAMES[key]}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className={`bg-gradient-to-r ${result.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${(value / 70) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setCurrentQuestion(0); setAnswers([]); setShowResult(false); setResult(null) }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Ulangi Quiz
                </button>
                <button onClick={() => navigate('/')} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
      </>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
            <ChevronLeft className="w-5 h-5" /> Kembali
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 font-medium">Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
                <span className="text-sm text-amber-600 font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" /> Personality Quiz
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">{question.question_text}</h2>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.food_target)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-300 font-medium relative overflow-hidden group
                    ${selectedAnswer === option.food_target ? 'border-amber-500 bg-amber-50 scale-[1.02]' : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/50'}
                    ${selectedAnswer !== null && selectedAnswer !== option.food_target ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${selectedAnswer === option.food_target ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-amber-100'}`}>
                      {option.option_letter}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{option.option_text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">Pilih jawaban yang paling menggambarkan dirimu</p>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
    </>
  )
}