import { useState, useEffect, useMemo } from 'react'
import FoodCard from '../components/FoodCard'
import type { Food } from '../types/food'
import { ChefHat, UtensilsCrossed, SearchX, Filter, Grid3x3, List, ArrowUpDown } from 'lucide-react'

import API_BASE_URL from '../config/api'

async function fetchDishes(): Promise<Food[]> {
  const response = await fetch(`${API_BASE_URL}/dishes`)
  if (!response.ok) {
    throw new Error(`Failed to fetch dishes: ${response.statusText}`)
  }
  const result = await response.json()
  if (!result.success) {
    throw new Error('API returned success: false')
  }
  return result.data as Food[]
}

export default function MenuPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')

  useEffect(() => {
    fetchDishes()
      .then(setFoods)
      .catch((e: unknown) => console.error('Error fetching dishes:', e))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(foods.map(f => f.category || 'Lainnya')))
    return ['Semua', ...unique]
  }, [foods])

  const filteredAndSortedFoods = useMemo(() => {
    let result = selectedCategory === 'Semua'
      ? foods
      : foods.filter(f => f.category === selectedCategory)

    return result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return (a.price || 0) - (b.price || 0)
    })
  }, [foods, selectedCategory, sortBy])

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
            <p className="text-amber-800 font-bold text-lg">Menyiapkan menu kuliner...</p>
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
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 md:p-12 text-white shadow-2xl">
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
                <UtensilsCrossed className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2">Menu Kuliner</h1>
                <p className="text-slate-300 text-lg">Jelajahi semua hidangan khas Medan yang autentik dan lezat</p>
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

        {/* Controls Section */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-amber-600" />
              <span>Kategori</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category, idx) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    group relative px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all duration-300
                    ${selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 scale-105'
                      : 'bg-white text-slate-600 hover:text-amber-600 shadow-lg hover:shadow-xl border-2 border-slate-200 hover:border-amber-300'
                    }
                  `}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-200/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">
                {filteredAndSortedFoods.length} Hidangan
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                <ArrowUpDown className="w-4 h-4 text-slate-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="name">Nama</option>
                  <option value="price">Harga</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-amber-600' : 'text-slate-600 hover:text-amber-600'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-amber-600' : 'text-slate-600 hover:text-amber-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Food Grid/List */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredAndSortedFoods.map((food, idx) => (
            <div
              key={food.id}
              className="group transform hover:-translate-y-2 transition-all duration-500"
              style={{
                animationDelay: `${idx * 100}ms`,
                transform: `translateY(${idx * 2}px)`
              }}
            >
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative h-full">
                  <FoodCard food={food} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedFoods.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
                <SearchX className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white text-2xl">️</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-800 mb-3">Tidak Ada Hidangan</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed text-lg">
              Maaf, belum ada makanan yang tersedia dalam kategori <span className="font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">"{selectedCategory}"</span>.
            </p>
            <button
              onClick={() => setSelectedCategory('Semua')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto text-lg"
            >
              <Filter className="w-5 h-5" />
              Lihat Semua Menu
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
      `}</style>
    </div>
  )
}