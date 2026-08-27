import { useState, useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import FoodCard from '../components/FoodCard'
import SectionHeader from '../components/SectionHeader'
import LoginModal from '../components/LoginModal' // <-- Import Modal
import type { Food } from '../types/food'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChefHat, ArrowRight, Sparkles, TrendingUp, Award, Flame, Star, UtensilsCrossed, Brain, BookOpen } from 'lucide-react'

import API_BASE_URL from '../config/api'

async function fetchDishes(): Promise<Food[]> {
  const response = await fetch(`${API_BASE_URL}/dishes`)
  if (!response.ok) {
    throw new Error('Failed to fetch dishes')
  }
  const result = await response.json()
  if (!result.success) {
    throw new Error('API returned success: false')
  }
  return result.data as Food[]
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    fetchDishes()
      .then(setFoods)
      .catch((e: unknown) => console.error('Error fetching dishes:', e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const popularFoods = foods.filter(f => f.isPopular)

  // Handler untuk tombol quiz
  const handlePersonalityQuizClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    } else {
      navigate('/quiz/personality')
    }
  }

  const handleMainQuizClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    } else {
      navigate('/quiz/main')
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // Setelah login berhasil, kita bisa langsung arahkan ke quiz yang dipilih
    // Atau biarkan user memilih sendiri
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>
        <div className="text-center space-y-6 relative z-10">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-amber-700 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-amber-800 font-bold text-lg">Menyiapkan pengalaman kuliner...</p>
            <p className="text-amber-600 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>

          {/* Floating Elements */}
          <div className="absolute top-32 left-16 text-6xl opacity-10 animate-bounce">🍜</div>
          <div className="absolute top-48 right-24 text-5xl opacity-10 animate-bounce delay-700">🥘</div>
          <div className="absolute bottom-48 left-1/3 text-7xl opacity-10 animate-bounce delay-1000">🍲</div>
          <div className="absolute bottom-32 right-1/4 text-6xl opacity-10 animate-bounce delay-500"></div>
        </div>

        <div className="relative z-10">
          <HeroSection />

          <section className="px-4 md:px-6 lg:px-8 space-y-12 mt-12 max-w-7xl mx-auto">

            {/* Rasa Hari Ini Section */}
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-800">Rasa Hari Ini</h2>
                    <p className="text-slate-600 text-sm mt-0.5">Rekomendasi spesial untuk Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/menu')}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Lihat Semua
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularFoods.slice(0, 2).map((food, idx) => (
                  <div
                    key={food.id}
                    className="group transform hover:-translate-y-3 transition-all duration-500"
                    style={{
                      animationDelay: `${idx * 100}ms`,
                      transform: `translateY(${scrollY * 0.02 * (idx + 1)}px)`
                    }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <FoodCard food={food} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tantangan Kuis Section - DENGAN MODAL LOGIN */}
            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-800">Tantangan Kuis</h2>
                  <p className="text-slate-600 text-sm mt-0.5">Uji kepribadian dan pengetahuan kuliner Anda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personality Quiz Card */}
                <div
                  onClick={handlePersonalityQuizClick}
                  className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-110 transform"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-3">Personality Quiz</h3>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      Temukan makanan khas Medan mana yang paling cocok dengan kepribadian dan gaya hidupmu!
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
                      <span>Mulai Tes Kepribadian</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Main Quiz Card */}
                <div
                  onClick={handleMainQuizClick}
                  className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 right-4 text-6xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-110 transform">🏆</div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold font-serif mb-3">Kuis Pengetahuan</h3>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      Uji wawasanmu tentang sejarah, bahan, dan fakta unik di balik kuliner legendaris Medan.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
                      <span>Mulai Kuis Pengetahuan</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Dapur Akulturasi - Premium Card */}
            <div
              onClick={() => navigate('/akulturasi')}
              className="group relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl cursor-pointer overflow-hidden hover:shadow-3xl transition-all duration-700 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '30px 30px'
                }}></div>
              </div>

              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 animate-pulse delay-1000"></div>

              <div className="absolute top-6 right-6 text-7xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 animate-float">🍳</div>
              <div className="absolute bottom-6 left-6 text-6xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 animate-float-reverse">👨‍🍳</div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30">
                        <Sparkles className="w-3 h-3 inline mr-1.5" />
                        Fitur Eksklusif
                      </div>
                      <div className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold shadow-lg">
                        Premium
                      </div>
                    </div>

                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 group-hover:scale-105 transition-transform duration-500 origin-left">
                      Dapur Akulturasi
                    </h3>

                    <p className="text-white/85 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
                      Pelajari percampuran budaya yang melahirkan cita rasa khas dan tak terlupakan dalam kuliner Medan.
                      Dari sejarah hingga langkah memasak.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <UtensilsCrossed className="w-5 h-5 text-amber-300" />
                          <span className="text-2xl font-bold font-serif">{foods.length}</span>
                        </div>
                        <div className="text-white/70 text-xs font-medium">Resep Lengkap</div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-orange-300" />
                          <span className="text-2xl font-bold font-serif">
                            {foods.reduce((acc, dish) => acc + (dish.cooking_steps?.length || 0), 0)}
                          </span>
                        </div>
                        <div className="text-white/70 text-xs font-medium">Langkah Masak</div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-yellow-300" />
                          <span className="text-2xl font-bold font-serif">5</span>
                        </div>
                        <div className="text-white/70 text-xs font-medium">Budaya</div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-cyan-300" />
                          <span className="text-2xl font-bold font-serif">100%</span>
                        </div>
                        <div className="text-white/70 text-xs font-medium">Otentik</div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <ArrowRight className="w-10 h-10 group-hover:translate-x-2 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats - Glassmorphism Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 font-serif mb-1">{foods.length}</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Total Resep</div>
              </div>

              <div className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 font-serif mb-1">
                  {foods.reduce((acc, dish) => acc + (dish.cooking_steps?.length || 0), 0)}
                </div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Langkah Masak</div>
              </div>

              <div className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 font-serif mb-1">5</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Budaya</div>
              </div>

              <div className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 font-serif mb-1">100%</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Tradisional</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* LOGIN MODAL - Muncul di HomePage */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}