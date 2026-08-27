import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

interface QuizCardProps {
  quiz: {
    id: number
    title: string
    description: string
    icon: string
    color: string
    questions: any[]
    isPopular?: boolean
    difficulty?: 'Mudah' | 'Sedang' | 'Sulit'
    totalQuestions?: number
  }
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  function handleStart() {
    if (isAuthenticated) {
      navigate(`/quiz/${quiz.id}`)
    } else {
      setShowLogin(true)
    }
  }

  function handleLoginSuccess() {
    setShowLogin(false)
    navigate(`/quiz/${quiz.id}`)
  }

  const difficultyColor = {
    'Mudah': 'bg-green-500',
    'Sedang': 'bg-yellow-500',
    'Sulit': 'bg-red-500'
  }

  return (
    <>
      <div
        onClick={handleStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-gradient-to-br ${quiz.color} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer text-white relative overflow-hidden group`}
      >
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-500 group-hover:scale-150"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl transition-all duration-500 group-hover:scale-150"></div>
        
        {/* Shimmer Effect on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 ${isHovered ? 'translate-x-full' : ''}`}></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[280px] text-center">
          {/* Badge Populer */}
          {quiz.isPopular && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              🔥 POPULER
            </div>
          )}

          {/* Badge Difficulty */}
          {quiz.difficulty && (
            <div className={`absolute top-3 left-3 ${difficultyColor[quiz.difficulty]} text-white px-3 py-1 rounded-full text-xs font-bold`}>
              {quiz.difficulty}
            </div>
          )}

          {/* Icon dengan animasi */}
          <div className={`text-7xl mb-4 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            {quiz.icon}
          </div>

          {/* Title */}
          <h4 className="text-2xl font-bold mb-3 drop-shadow-lg">{quiz.title}</h4>

          {/* Description */}
          <p className="text-white/90 mb-6 text-sm leading-relaxed line-clamp-2 px-2">
            {quiz.description}
          </p>

          {/* Info Badge */}
          {quiz.totalQuestions && (
            <div className="mb-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium">
               {quiz.totalQuestions} Pertanyaan
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStart()
            }}
            className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2 group/btn"
          >
            <span>🎮</span>
            <span>Mulai Quiz</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
          </button>
        </div>

        {/* Progress Bar (jika sudah pernah dikerjakan) */}
        {quiz.questions && quiz.questions.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.random() * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}