import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { LogIn, User, Star, Trophy, Settings, LogOut, ChevronRight, Loader2, Award, BookOpen, AlertCircle } from 'lucide-react'

import API_BASE_URL from '../config/api'

const FOOD_COLORS: Record<string, string> = {
  'Kari Bihun Medan': 'from-red-500 to-orange-600',
  'Soto Medan': 'from-amber-400 to-yellow-500',
  'Bolu Meranti': 'from-pink-400 to-rose-500',
  'Bika Ambon': 'from-purple-400 to-indigo-500',
  'Cicongfan': 'from-teal-400 to-emerald-500',
  'MIX': 'from-blue-400 via-purple-400 to-pink-400',
  'ES CAMPUR MEDAN / RUJAK KOLAM': 'from-blue-400 via-purple-400 to-pink-400',
}

interface QuizResult {
  id: number
  quiz_type: string
  food_result: string
  total_score: number
  score_kb: number
  score_sm: number
  score_bm: number
  score_ba: number
  score_cf: number
  created_at: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { favorites } = useApp()

  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchQuizResults()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchQuizResults = async () => {
    try {
      setError(null)
      const res = await fetch(`${API_BASE_URL}/quiz-results/user/${user?.id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setQuizResults(data.data)
      } else {
        setQuizResults([])
      }
    } catch (err: any) {
      console.error('Error fetching quiz results:', err)
      setError('Gagal memuat hasil kuis. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const personalityResult = quizResults.find(r => r.quiz_type === 'personality')
  const mainResults = quizResults.filter(r => r.quiz_type === 'main')
  const mainQuizResult = mainResults[0] // hasil terbaru
  const bestMainScore = mainResults.reduce((max, r) => Math.max(max, r.total_score || 0), 0)
  const completedQuizzes = quizResults.length

  // --- TAMPILAN JIKA BELUM LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <LogIn className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang!</h1>
        <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
          Silakan masuk atau daftar untuk melihat profil, menyimpan makanan favorit, dan melacak skor kuis Anda.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate('/login')}
            className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20">
            Masuk Sekarang
          </button>
          <button onClick={() => navigate('/register')}
            className="w-full bg-white text-amber-600 border-2 border-amber-600 py-3.5 rounded-xl font-bold hover:bg-amber-50 transition">
            Daftar Akun Baru
          </button>
        </div>
      </div>
    )
  }

  // --- TAMPILAN JIKA SUDAH LOGIN ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 shadow-xl text-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-amber-500 to-orange-600"></div>
          <div className="relative z-10 mt-8">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-amber-600 shadow-md border-4 border-amber-100">
              {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{user?.username || user?.name || 'Pengguna'}</h1>
            <p className="text-amber-600 text-sm font-medium">{user?.email || 'Pecinta Kuliner Medan'}</p>
          </div>
        </div>

        {/* Stats Grid — hanya 3 kartu, tidak duplikat */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={<Star className="w-6 h-6 text-amber-600" />} value={favorites.length} label="Favorit" />
          <StatCard icon={<Trophy className="w-6 h-6 text-orange-600" />} value={completedQuizzes} label="Kuis Selesai" />
          <StatCard icon={<Award className="w-6 h-6 text-rose-600" />} value={bestMainScore} label="Skor Tertinggi" />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchQuizResults} className="px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-xs font-semibold">
              Coba Lagi
            </button>
          </div>
        )}

        {/* 1. Personality Quiz Result Card */}
        <div className="bg-white rounded-3xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Hasil Personality Quiz
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            ) : personalityResult ? (
              <div>
                <div className={`bg-gradient-to-r ${FOOD_COLORS[personalityResult.food_result] || FOOD_COLORS['MIX']} rounded-2xl p-5 text-white mb-5 shadow-lg`}>
                  <h3 className="text-xl font-bold mb-1">{personalityResult.food_result}</h3>
                  <p className="text-white/90 text-sm">
                    Diselesaikan pada {formatDate(personalityResult.created_at)}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">Detail Skor:</h4>
                  {[
                    { label: 'Kari Bihun', score: personalityResult.score_kb || 0 },
                    { label: 'Soto Medan', score: personalityResult.score_sm || 0 },
                    { label: 'Bolu Meranti', score: personalityResult.score_bm || 0 },
                    { label: 'Bika Ambon', score: personalityResult.score_ba || 0 },
                    { label: 'Cicongfan', score: personalityResult.score_cf || 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-24">{item.label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${FOOD_COLORS[personalityResult.food_result] || FOOD_COLORS['MIX']} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, (item.score / 70) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8 text-right">{item.score}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/quiz/personality')}
                  className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  Ulangi Quiz
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Belum mengerjakan Personality Quiz</p>
                <p className="text-sm text-gray-500 mb-5">Temukan karakter kuliner kamu sekarang!</p>
                <button onClick={() => navigate('/quiz/personality')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
                  <Star className="w-5 h-5" />
                  Mulai Quiz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Main Quiz (Kuis Pengetahuan) Result Card */}
        <div className="bg-white rounded-3xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Hasil Kuis Pengetahuan
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : mainQuizResult ? (
              <div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white mb-5 shadow-lg text-center">
                  <h3 className="text-4xl font-bold mb-1">{mainQuizResult.total_score} <span className="text-xl font-normal opacity-80">/ 100</span></h3>
                  <p className="text-white/90 text-sm">
                    Hasil sesi terakhir • {formatDate(mainQuizResult.created_at)}
                  </p>
                  <p className="text-sm mt-3 font-medium bg-white/20 inline-block px-4 py-1 rounded-full">
                    {mainQuizResult.total_score >= 70 ? 'Luar Biasa! Kamu Ahli Kuliner!' : 'Terus Belajar Tentang Kuliner Medan!'}
                  </p>
                  {mainResults.length > 1 && (
                    <p className="text-xs mt-2 opacity-80">
                      Total {mainResults.length} sesi pernah dimainkan • Skor tertinggi: {bestMainScore}
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-5">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">Detail Skor Per Kuliner (sesi terakhir):</h4>
                  {[
                    { label: 'Soto Medan', score: mainQuizResult.score_kb || 0 },
                    { label: 'Ci Cong Fan', score: mainQuizResult.score_sm || 0 },
                    { label: 'Bika Ambon', score: mainQuizResult.score_bm || 0 },
                    { label: 'Kari Bihun', score: mainQuizResult.score_ba || 0 },
                    { label: 'Bolu Meranti', score: mainQuizResult.score_cf || 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-24">{item.label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (item.score / 100) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8 text-right">{item.score}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/quiz/main')}
                  className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Ulangi Kuis Pengetahuan
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Belum mengerjakan Kuis Pengetahuan</p>
                <p className="text-sm text-gray-500 mb-5">Uji wawasanmu tentang kuliner Medan sekarang!</p>
                <button onClick={() => navigate('/quiz/main')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
                  <BookOpen className="w-5 h-5" />
                  Mulai Kuis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pengaturan</h2>
          <div className="space-y-2">
            <MenuItem icon={<Settings className="w-5 h-5 text-gray-500" />} label="Pengaturan Akun" onClick={() => navigate('/settings')} />
            <MenuItem icon={<User className="w-5 h-5 text-gray-500" />} label="Tentang Aplikasi" onClick={() => navigate('/about')} />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition shadow-sm border border-red-100">
          <LogOut className="w-5 h-5" />
          Keluar dari Akun
        </button>

      </div>
    </div>
  )
}

// --- Helper Components ---
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg text-center flex flex-col items-center justify-center">
      <div className="mb-2 p-2 bg-gray-50 rounded-full">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
    </div>
  )
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full p-4 text-left rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-between group">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-700 group-hover:text-amber-700 transition-colors">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
    </button>
  )
}