import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import { Star, TrendingUp, MessageCircle, Award, ImageOff } from 'lucide-react'
import type { Food } from '../types/food'

interface Review {
  id: number
  restaurant_id: number
  user_id: number
  user_name: string
  rating: number
  comment: string
  created_at: string
}

interface FoodCardProps {
  food: Food
}

import API_BASE_URL from '../config/api'

export default function FoodCard({ food }: FoodCardProps) {
  const navigate = useNavigate()
  const { favorites, addToFavorites } = useApp()
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const isFavorite = favorites.includes(food.id)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews?restaurant_id=${food.id}`)
        const data = await response.json()
        
        if (Array.isArray(data) && data.length > 0) {
          // Urutkan: rating tertinggi dulu, lalu tanggal terbaru
          const sortedReviews = data.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          
          setReviews(sortedReviews)
          setTotalReviews(data.length)
          
          const total = data.reduce((sum, review) => sum + review.rating, 0)
          const average = total / data.length
          setAvgRating(parseFloat(average.toFixed(1)))
        } else {
          // Jika tidak ada review, set 0
          setAvgRating(0)
          setTotalReviews(0)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setAvgRating(0)
        setTotalReviews(0)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [food.id])

  function handleFavoriteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (isAuthenticated) {
      addToFavorites(food.id)
    } else {
      setShowLogin(true)
    }
  }

  function handleLoginSuccess() {
    setShowLogin(false)
    addToFavorites(food.id)
  }

  // Ambil hanya 2 ulasan terbaik
  const topReviews = reviews.slice(0, 2)

  return (
    <>
      <div
        onClick={() => navigate(`/food/${food.id}`)}
        className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null
                if (placeholder) placeholder.style.display = 'flex'
              }}
            />
          ) : null}
          {/* Placeholder shown when image is missing or broken */}
          <div
            className="w-full h-full items-center justify-center flex-col gap-2 text-orange-300"
            style={{ display: food.image ? 'none' : 'flex' }}
          >
            <ImageOff className="w-12 h-12" />
            <span className="text-xs font-medium text-orange-400">Foto belum tersedia</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {food.isPopular && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              POPULER
            </div>
          )}
          
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 left-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform shadow-lg z-10"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>

          {/* Rating Badge - Hanya tampil jika ada ulasan */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            {totalReviews > 0 ? (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-800">{avgRating}</span>
                <span className="text-xs text-gray-500">({totalReviews} ulasan)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Belum ada ulasan</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Category & Price */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
              {food.category}
            </span>
            <span className="text-lg font-bold text-orange-600">
              Rp {food.price.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
            {food.name}
          </h4>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
            {food.description}
          </p>

          {/* Top 2 Reviews - Hanya tampil jika ada ulasan */}
          {!loading && topReviews.length > 0 && (
            <div className="border-t border-gray-100 pt-3 mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                Ulasan Terbaik:
              </p>
              <div className="space-y-2">
                {topReviews.map((review, idx) => (
                  <div 
                    key={review.id} 
                    className={`rounded-lg p-2.5 ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-700">{review.user_name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
              
              {totalReviews > 2 && (
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  +{totalReviews - 2} ulasan lainnya
                </p>
              )}
            </div>
          )}

          {/* Bottom Rating & Price - Hanya tampil jika ada ulasan */}
          <div className="flex items-center justify-between pt-2">
            {totalReviews > 0 ? (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({totalReviews})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">Belum ada ulasan</span>
              </div>
            )}
            <span className="text-orange-600 font-bold text-sm">
              Rp {food.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}