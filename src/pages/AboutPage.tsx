import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChefHat, Globe, Code2, Heart, MapPin, Star } from 'lucide-react'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/profile')} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali ke Profil
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <ChefHat className="w-12 h-12 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2">Kuliner Medan Food</h1>
              <p className="text-white/90 text-sm">Versi 1.0.0</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white/80 text-white/80" />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Tentang Aplikasi
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Kuliner Medan Food adalah platform digital yang didedikasikan untuk melestarikan dan mempromosikan kekayaan kuliner khas Kota Medan. 
                Aplikasi ini menyediakan informasi resep, sejarah akulturasi budaya, peta lokasi restoran, serta fitur interaktif seperti kuis pengetahuan dan tes kepribadian kuliner.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Fitur Utama
              </h2>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Database resep kuliner Medan yang otentik dengan sejarah dan akulturasi budaya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Peta interaktif lokasi restoran rekomendasi di Medan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Personality Quiz untuk menemukan makanan sesuai karakter Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Kuis Pengetahuan untuk menguji wawasan kuliner Medan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Chat AI (Chef AI) untuk bertanya seputar kuliner</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Teknologi yang Digunakan</h2>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                  <Code2 className="w-4 h-4" />
                  <span>React + TypeScript</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                  <Code2 className="w-4 h-4" />
                  <span>Node.js + Express</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium">
                  <Code2 className="w-4 h-4" />
                  <span>SQLite</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium">
                  <Code2 className="w-4 h-4" />
                  <span>Groq AI</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 text-center border border-amber-200">
              <p className="text-sm text-gray-600 mb-2">Dibuat dengan</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-500">© 2026 Kuliner Medan Food</p>
              <p className="text-xs text-gray-400 mt-1">Untuk pecinta kuliner Nusantara</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}