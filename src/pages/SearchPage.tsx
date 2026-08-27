import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDishes } from '../services/dishApi'
import type { Food } from '../types/food'
import {
  Search,
  ChefHat,
  Star,
  MapPin,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  X,
  Filter
} from 'lucide-react'

export default function SearchPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDishes()
      .then(setFoods)
      .catch((e) => console.error('Error fetching dishes:', e))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(foods.map(f => f.category || 'Lainnya')))
    return ['Semua', ...unique]
  }, [foods])

  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.category || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchCategory = selectedCategory === 'Semua' || food.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [foods, searchTerm, selectedCategory])

  // Highlight matched text
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-amber-300 text-amber-900 px-1 rounded font-semibold">{part}</mark>
        : part
    )
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
              <Search className="w-10 h-10 text-amber-700 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-amber-800 font-bold text-lg">Mencari kuliner lezat...</p>
            <p className="text-amber-600 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 pb-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                <Search className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2">Cari Kuliner</h1>
                <p className="text-slate-300 text-lg">Temukan hidangan favorit Anda dari berbagai kategori</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    {foods.length} Resep
                  </span>
                  <span>•</span>
                  <span>{categories.length - 1} Kategori</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Premium */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center">
                <div className="pl-6 pr-4">
                  <Search className="w-6 h-6 text-amber-600" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari makanan, kategori, atau deskripsi..."
                  className="flex-1 py-5 text-lg outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="pr-6 text-slate-400 hover:text-amber-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold text-sm uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Filter Kategori</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, idx) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  group relative px-5 py-2.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-white text-slate-600 hover:text-amber-600 shadow-md border-2 border-slate-200 hover:border-amber-300'
                  }
                `}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        {(searchTerm || selectedCategory !== 'Semua') && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-slate-200">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-slate-700">
                {filteredFoods.length} Hasil Ditemukan
              </span>
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-bold text-amber-800">
                  "{searchTerm}"
                </span>
              </div>
            )}
          </div>
        )}

        {/* Food List */}
        <div className="space-y-4">
          {filteredFoods.map((food, idx) => (
            <div
              key={food.id}
              onClick={() => navigate(`/food/${food.id}`)}
              className="group relative bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

              <div className="relative flex gap-4 md:gap-6 p-4 md:p-6">
                {/* Image */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-amber-100 to-orange-100">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-300">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                    {food.isPopular && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg shadow-lg">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold font-serif text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                      {highlightText(food.name, searchTerm)}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-sm md:text-base text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {highlightText(food.description, searchTerm)}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full">
                      <Star className="w-4 h-4 text-amber-600 fill-current" />
                      <span className="text-sm font-bold text-amber-700">{food.rating}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 rounded-full">
                      <span className="text-sm font-bold text-orange-700">Rp {food.price.toLocaleString()}</span>
                    </div>

                    {food.category && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-semibold text-slate-700">{food.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFoods.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
                <Search className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white text-2xl">🍽️</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-800 mb-3">Tidak Ada Hasil</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed text-lg">
              Maaf, kami tidak menemukan kuliner yang cocok dengan pencarian <span className="font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">"{searchTerm}"</span>.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('Semua')
              }}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto text-lg"
            >
              <X className="w-5 h-5" />
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        mark {
          background-color: #FCD34D;
          color: #78350F;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}