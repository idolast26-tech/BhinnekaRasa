import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminFetch } from '../../services/adminApi'
import { 
  LayoutDashboard, UtensilsCrossed, Brain, BookOpen, 
  Trophy, Users, MessageCircle, TrendingUp, ArrowRight,
  ChefHat, AlertCircle, Package, Star, FileText, MapPin
} from 'lucide-react'

import API_BASE_URL from '../../config/api'

interface Stats {
  totalDishes: number
  totalRestaurants: number
  totalReviews: number
  totalUsers: number
  totalQuestions: number
  totalQuizResults: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    fetchStats()
  }, [isAdmin, navigate])

  const fetchStats = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/stats`)
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Menu',
      value: stats?.totalDishes || 0,
      icon: UtensilsCrossed,
      color: 'from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Reviews',
      value: stats?.totalReviews || 0,
      icon: MessageCircle,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Quiz Questions',
      value: stats?.totalQuestions || 0,
      icon: FileText,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Quiz Results',
      value: stats?.totalQuizResults || 0,
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Restaurants',
      value: stats?.totalRestaurants || 0,
      icon: MapPin,
      color: 'from-red-400 to-rose-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ]

  const managementItems = [
    {
      title: 'Kelola Menu',
      description: 'Tambah, edit, dan hapus menu kuliner',
      icon: UtensilsCrossed,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      path: '/admin/menu',
      count: stats?.totalDishes || 0,
      countLabel: 'Menu Items'
    },
    {
      title: 'Kelola Lokasi',
      description: 'Tambah, edit, dan hapus lokasi restoran',
      icon: MapPin,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      path: '/admin/restaurants',
      count: stats?.totalRestaurants || 0,
      countLabel: 'Lokasi'
    },
    {
      title: 'Personality Quiz',
      description: 'Kelola pertanyaan kuis kepribadian',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      path: '/admin/personality-quiz',
      count: 7,
      countLabel: 'Pertanyaan'
    },
    {
      title: 'Main Quiz',
      description: 'Kelola pertanyaan kuis pengetahuan',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      path: '/admin/main-quiz',
      count: 50,
      countLabel: 'Pertanyaan'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.username}!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Manajemen Konten Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Manajemen Konten</h2>
        <p className="text-gray-600 mb-6">Pilih menu untuk mengelola konten aplikasi</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`group relative ${item.bgColor} rounded-2xl p-6 border-2 ${item.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">{item.count}</div>
                    <div className="text-xs text-gray-500 font-medium">{item.countLabel}</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ 
                  color: item.color.includes('orange') ? '#ea580c' : 
                         item.color.includes('red') ? '#e11d48' : 
                         item.color.includes('purple') ? '#9333ea' : '#2563eb' 
                }}>
                  <span>Kelola Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Tips Penggunaan</h3>
            <ul className="text-sm text-white/90 space-y-1">
              <li>• Perubahan data akan langsung tersimpan ke database</li>
              <li>• Hapus data dengan hati-hati karena tidak dapat dikembalikan</li>
              <li>• Pastikan mengisi semua field yang diperlukan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}