import { useState, useEffect, useRef } from 'react'
import { fetchDishes } from '../../services/dishApi'
import { Play, Pause, SkipBack, SkipForward, Volume2, X, ChefHat, Search, RotateCcw, Mic } from 'lucide-react'
import type { Food } from '../../types/food'

export default function DapurAkulturasi() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | string | null>(null)

  // Audio states
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFoodId, setCurrentFoodId] = useState<number | string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const [availableIdVoices, setAvailableIdVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')
  const [voicesChecked, setVoicesChecked] = useState(false)

  const speechSynthRef = useRef<SpeechSynthesis | null>(null)
  const indonesianVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPlayingRef = useRef(false)
  const currentFoodIdRef = useRef<number | string | null>(null)
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchDishes()
      .then((data) => {
        const akulturasiFoods = data.filter((f) =>
          f.category?.toLowerCase().includes('akulturasi') ||
          f.journey?.toLowerCase().includes('akulturasi') ||
          f.journey?.toLowerCase().includes('tionghoa') ||
          f.journey?.toLowerCase().includes('arab') ||
          f.journey?.toLowerCase().includes('india') ||
          f.category?.toLowerCase().includes('tradisional') ||
          f.category?.toLowerCase().includes('mie') ||
          f.category?.toLowerCase().includes('sup') ||
          f.category?.toLowerCase().includes('makanan penutup')
        )
        setFoods(akulturasiFoods.length > 0 ? akulturasiFoods : data)
      })
      .catch((err) => {
        console.error('Gagal mengambil data:', err)
        setError('Gagal memuat data dari database.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis

    const isTrueIndonesian = (v: SpeechSynthesisVoice) =>
      v.lang.toLowerCase().replace('_', '-').startsWith('id')

    const loadVoices = () => {
      const voices = speechSynthRef.current?.getVoices() || []
      const idVoices = voices.filter(isTrueIndonesian)

      setAvailableIdVoices(idVoices)
      setVoicesChecked(true)

      if (idVoices.length === 0) {
        indonesianVoiceRef.current = null
        return
      }

      if (selectedVoiceURI) {
        const chosen = idVoices.find((v) => v.voiceURI === selectedVoiceURI)
        if (chosen) {
          indonesianVoiceRef.current = chosen
          return
        }
      }

      const priorities = [
        (v: SpeechSynthesisVoice) => /neural/i.test(v.name) || /online \(natural\)/i.test(v.name),
        (v: SpeechSynthesisVoice) => /google/i.test(v.name),
        (v: SpeechSynthesisVoice) => /gadis|damayanti|hani/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang.toLowerCase() === 'id-id',
        () => true,
      ]

      let picked: SpeechSynthesisVoice | undefined
      for (const priority of priorities) {
        picked = idVoices.find(priority)
        if (picked) break
      }

      indonesianVoiceRef.current = picked || idVoices[0]
      setSelectedVoiceURI((picked || idVoices[0]).voiceURI)
    }

    loadVoices()
    if (speechSynthRef.current.onvoiceschanged !== undefined) {
      speechSynthRef.current.onvoiceschanged = loadVoices
    }

    return () => {
      speechSynthRef.current?.cancel()
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current)
    }
  }, [])

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI)
    const chosen = availableIdVoices.find((v) => v.voiceURI === voiceURI)
    if (chosen) indonesianVoiceRef.current = chosen

    if (isPlayingRef.current && currentFoodIdRef.current !== null) {
      const food = foods.find((f) => f.id === currentFoodIdRef.current)
      const steps = Array.isArray(food?.cookingSteps) ? food!.cookingSteps : []
      if (steps.length > 0) {
        clearTimers()
        playCurrentStep(currentFoodIdRef.current, currentStepIndex, steps)
      }
    }
  }

  const formatTextForSpeech = (text: string): string => {
    return text
      .replace(/\b(\d+)\s+x\s*(\d+)\b/g, '$1 kali $2')
      .replace(/\b(\d+)\s+gram\b/g, '$1 gram')
      .replace(/\b(\d+)\s+sendok\b/g, '$1 sendok')
      .replace(/\b(\d+)\s+liter\b/g, '$1 liter')
      .replace(/\b(\d+)\s+ml\b/g, '$1 mililiter')
      .replace(/\b(\d+)\s+derajat\b/g, '$1 derajat')
      .replace(/\b(\d+)\s+cm\b/g, '$1 sentimeter')
      .replace(/([.,])/g, '$1 ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const clearTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
  }

  const playCurrentStep = (foodId: number | string, stepIndex: number, steps: string[]) => {
    if (stepIndex >= steps.length) {
      finishAudio()
      return
    }

    isPlayingRef.current = true
    currentFoodIdRef.current = foodId

    setCurrentFoodId(foodId)
    setIsPlaying(true)
    setIsFinished(false)
    setCurrentStepIndex(stepIndex)
    setAudioProgress(0)

    const stepText = formatTextForSpeech(steps[stepIndex])
    const utterance = new SpeechSynthesisUtterance(stepText)

    if (indonesianVoiceRef.current) {
      utterance.voice = indonesianVoiceRef.current
      utterance.lang = indonesianVoiceRef.current.lang
    } else {
      utterance.lang = 'id-ID'
    }

    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const estimatedDuration = Math.max(stepText.length * 55, 1200)
    const startTime = Date.now()

    clearTimers()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / estimatedDuration) * 100, 100)
      setAudioProgress(progress)
    }, 100)

    utterance.onend = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setAudioProgress(100)

      if (!isPlayingRef.current || currentFoodIdRef.current !== foodId) return

      const nextIndex = stepIndex + 1
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current && currentFoodIdRef.current === foodId) {
          playCurrentStep(foodId, nextIndex, steps)
        }
      }, 900)
    }

    utterance.onerror = (event) => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.error('Audio error:', event.error)
      }
    }

    speechSynthRef.current?.cancel()
    speechSynthRef.current?.speak(utterance)
  }

  const startAudio = (foodId: number | string, steps: string[], startIndex: number = 0) => {
    if (steps.length === 0) return
    clearTimers()
    playCurrentStep(foodId, startIndex, steps)
  }

  const finishAudio = () => {
    clearTimers()
    speechSynthRef.current?.cancel()
    isPlayingRef.current = false
    setIsPlaying(false)
    setIsFinished(true)
    setAudioProgress(100)
  }

  const stopAudio = () => {
    clearTimers()
    speechSynthRef.current?.cancel()
    isPlayingRef.current = false
    currentFoodIdRef.current = null
    setIsPlaying(false)
    setCurrentFoodId(null)
    setCurrentStepIndex(0)
    setAudioProgress(0)
    setIsFinished(false)
  }

  const pauseAudio = () => {
    clearTimers()
    speechSynthRef.current?.cancel()
    isPlayingRef.current = false
    setIsPlaying(false)
  }

  const resumeAudio = (foodId: number | string, steps: string[]) => {
    playCurrentStep(foodId, currentStepIndex, steps)
  }

  const handlePlayPause = (foodId: number | string, steps: string[]) => {
    if (isPlaying && currentFoodId === foodId) {
      pauseAudio()
    } else if (isFinished && currentFoodId === foodId) {
      startAudio(foodId, steps, 0)
    } else if (!isPlaying && currentFoodId === foodId) {
      resumeAudio(foodId, steps)
    } else {
      startAudio(foodId, steps, 0)
    }
  }

  const handleStop = () => {
    stopAudio()
  }

  const handleSkipNext = (foodId: number | string, steps: string[]) => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1
      if (isPlaying) {
        clearTimers()
        playCurrentStep(foodId, nextIndex, steps)
      } else {
        setCurrentStepIndex(nextIndex)
        setAudioProgress(0)
      }
    }
  }

  const handleSkipPrev = (foodId: number | string, steps: string[]) => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      if (isPlaying) {
        clearTimers()
        playCurrentStep(foodId, prevIndex, steps)
      } else {
        setCurrentStepIndex(prevIndex)
        setAudioProgress(0)
      }
    }
  }

  const toggleCard = (foodId: number | string) => {
    if (expandedCardId !== foodId) {
      stopAudio()
    }
    setExpandedCardId(expandedCardId === foodId ? null : foodId)
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase()) ||
    food.category?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-800 font-medium text-lg">Memuat menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-bold mb-2 text-lg">Terjadi Kesalahan</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[150vh] bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">Dapur Akulturasi</h1>
                <p className="text-white/90 text-sm mt-1">Panduan memasak dengan audio otomatis</p>
              </div>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama makanan..."
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-md rounded-2xl text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-base"
            />
          </div>

          {/* Voice Selector */}
          {voicesChecked && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5">
                <Mic className="w-4 h-4 text-white" />
                {availableIdVoices.length === 0 ? (
                  <p className="text-xs text-white/95">
                    Tidak ada suara Bahasa Indonesia terdeteksi
                  </p>
                ) : (
                  <>
                    <span className="text-xs font-medium text-white/90">Suara:</span>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="text-sm bg-white/95 text-gray-800 rounded-lg px-3 py-1.5 font-medium shadow focus:outline-none focus:ring-2 focus:ring-white/50 max-w-xs cursor-pointer"
                    >
                      {availableIdVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} {/neural|online \(natural\)/i.test(v.name) ? '⭐' : ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-gray-600 text-lg">
            Menampilkan <span className="text-orange-600 font-bold text-xl">{filteredFoods.length}</span> hidangan
          </p>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-orange-200 shadow-sm">
            <div className="text-7xl mb-4">🍽️</div>
            <p className="text-gray-500 font-medium text-lg">Tidak ada makanan ditemukan</p>
            <p className="text-gray-400 text-sm mt-2">Coba kata kunci pencarian lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFoods.map((food) => {
              const isExpanded = expandedCardId === food.id
              const steps = Array.isArray(food.cookingSteps) ? food.cookingSteps : []
              const isThisPlaying = isPlaying && currentFoodId === food.id
              const isThisFinished = isFinished && currentFoodId === food.id
              const isThisActive = currentFoodId === food.id && (isThisPlaying || isThisFinished || (!isPlaying && !isFinished && currentStepIndex > 0))

              return (
                <div
                  key={food.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                    isExpanded ? 'border-orange-400 shadow-2xl scale-[1.01]' : 'border-transparent hover:border-orange-200'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-orange-200 to-amber-200">🍲</div>'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-orange-200 to-amber-200">
                        🍲
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {food.category && (
                        <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-orange-600 shadow-lg">
                          {food.category}
                        </span>
                      )}
                      {isThisPlaying && (
                        <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Sedang Diputar
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg">
                      <span className="text-lg font-bold text-orange-600">
                        Rp {((food.price || 0) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-800 text-2xl mb-2">{food.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                      {food.description || food.history || 'Tidak ada deskripsi.'}
                    </p>

                    {steps.length > 0 ? (
                      <button
                        onClick={() => toggleCard(food.id)}
                        className={`w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          isExpanded
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <X className="w-5 h-5" /> Tutup Panduan
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            Lihat Panduan Memasak
                            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs">
                              {steps.length} langkah
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
                        Langkah memasak belum tersedia
                      </p>
                    )}
                  </div>

                  {/* Audio Player Section */}
                  {isExpanded && steps.length > 0 && (
                    <div className="border-t-2 border-orange-100 bg-gradient-to-b from-orange-50/50 to-white p-6 animate-fade-in">
                      {/* Control Panel */}
                      <div className="bg-white rounded-2xl p-5 shadow-lg border border-orange-200 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                              isThisPlaying ? 'bg-orange-500 shadow-lg' : isThisFinished ? 'bg-green-500' : 'bg-orange-100'
                            }`}>
                              {isThisFinished ? (
                                <ChefHat className="w-7 h-7 text-white" />
                              ) : (
                                <Volume2 className={`w-7 h-7 ${isThisPlaying ? 'text-white animate-pulse' : 'text-orange-600'}`} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-base">
                                {isThisFinished ? 'Selesai! Selamat memasak 👨‍🍳' : isThisPlaying ? 'Sedang dibacakan...' : 'Panduan Audio'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Langkah {Math.min(currentStepIndex + 1, steps.length)} dari {steps.length}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSkipPrev(food.id, steps)}
                              disabled={currentStepIndex === 0}
                              className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                              <SkipBack className="w-5 h-5 text-gray-700" />
                            </button>

                            <button
                              onClick={() => handlePlayPause(food.id, steps)}
                              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                                isThisPlaying
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                              }`}
                            >
                              {isThisPlaying ? (
                                <Pause className="w-8 h-8 fill-current" />
                              ) : isThisFinished ? (
                                <RotateCcw className="w-8 h-8" />
                              ) : (
                                <Play className="w-8 h-8 fill-current ml-1" />
                              )}
                            </button>

                            <button
                              onClick={() => handleSkipNext(food.id, steps)}
                              disabled={currentStepIndex >= steps.length - 1}
                              className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                              <SkipForward className="w-5 h-5 text-gray-700" />
                            </button>

                            {(isThisPlaying || isThisFinished || currentStepIndex > 0) && (
                              <button
                                onClick={handleStop}
                                className="w-11 h-11 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all ml-2"
                              >
                                <X className="w-5 h-5 text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-200 ${
                                isThisFinished ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                              }`}
                              style={{ width: `${((currentStepIndex + (isThisPlaying ? audioProgress / 100 : isThisFinished ? 1 : 0)) / steps.length) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            {steps.map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-1.5 mx-0.5 rounded-full transition-all ${
                                  i < currentStepIndex || isThisFinished
                                    ? 'bg-orange-400'
                                    : i === currentStepIndex && isThisPlaying
                                    ? 'bg-orange-400/60'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Steps List */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
                          <ChefHat className="w-5 h-5 text-orange-600" />
                          Langkah-langkah Memasak
                        </h4>

                        {steps.map((step, index) => {
                          const isCurrentStep = currentFoodId === food.id && currentStepIndex === index
                          const isDone = currentFoodId === food.id && (index < currentStepIndex || isThisFinished)

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (isThisPlaying && isCurrentStep) {
                                  pauseAudio()
                                } else {
                                  startAudio(food.id, steps, index)
                                }
                              }}
                              className={`flex gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                                isCurrentStep && isThisPlaying
                                  ? 'bg-orange-50 border-orange-400 shadow-md'
                                  : isCurrentStep
                                  ? 'bg-orange-50/60 border-orange-200'
                                  : isDone
                                  ? 'bg-white border-gray-100 opacity-60'
                                  : 'bg-white border-gray-100 hover:border-orange-300 hover:shadow-md'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                isCurrentStep && isThisPlaying
                                  ? 'bg-orange-500 text-white shadow-md'
                                  : isDone
                                  ? 'bg-orange-200 text-orange-700'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm leading-relaxed ${isCurrentStep && isThisPlaying ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                  {step}
                                </p>
                                {isCurrentStep && isThisPlaying && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex gap-1">
                                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-orange-600 font-semibold">Sedang dibacakan...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}