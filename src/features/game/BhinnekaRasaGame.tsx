import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChefHat, ChevronRight, RefreshCw, Trophy,
  CheckCircle, XCircle, Star, Heart, X, BookOpen, Flame
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Dish {
  id: number
  name: string
  image: string
  description: string
  category: string
  ingredients: string[]
  cooking_steps: string[]
}

interface IngredientSlot {
  name: string
  isCorrect: boolean
  emoji: string
  id: string
}

interface FloatingParticle {
  id: string
  emoji: string
  x: number
  y: number
  targetX: number
  targetY: number
}

type GamePhase = 'select' | 'cooking' | 'result'
type ChefMood = 'idle' | 'happy' | 'sad' | 'cooking' | 'celebrate'

interface CookResult {
  step: number
  stepText: string
  pickedIngredient: string
  correct: boolean
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api'

// ─── CSS ──────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .gf { font-family: 'Plus Jakarta Sans', sans-serif; }
  .ff { font-family: 'Fredoka One', cursive; }

  @keyframes chefBob { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-8px) rotate(-2deg)} 75%{transform:translateY(-4px) rotate(2deg)} }
  @keyframes chefHappy { 0%,100%{transform:translateY(0) rotate(0)} 20%{transform:translateY(-16px) rotate(-8deg)} 40%{transform:translateY(-20px) rotate(8deg)} 60%{transform:translateY(-12px) rotate(-5deg)} 80%{transform:translateY(-6px) rotate(3deg)} }
  @keyframes chefSad { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(4px) rotate(3deg)} }
  @keyframes chefCook { 0%,100%{transform:translateY(0) rotate(0)} 30%{transform:translateY(-6px) rotate(-4deg)} 60%{transform:translateY(-10px) rotate(4deg)} }
  @keyframes panWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
  @keyframes steamRise { 0%{transform:translateY(0) scaleX(1);opacity:0.7} 100%{transform:translateY(-40px) scaleX(1.5);opacity:0} }
  @keyframes particleFly { 0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0.3) rotate(360deg);opacity:0} }
  @keyframes cardFlip { 0%{transform:rotateY(0) scale(1)} 50%{transform:rotateY(90deg) scale(1.1)} 100%{transform:rotateY(0) scale(1)} }
  @keyframes cardWrong { 0%,100%{transform:rotateZ(0) translateX(0)} 20%{transform:rotateZ(-5deg) translateX(-6px)} 40%{transform:rotateZ(5deg) translateX(6px)} 60%{transform:rotateZ(-3deg) translateX(-3px)} 80%{transform:rotateZ(3deg) translateX(3px)} }
  @keyframes floatIn { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(251,146,60,0)} 50%{box-shadow:0 0 24px 8px rgba(251,146,60,0.35)} }
  @keyframes wokShake { 0%,100%{transform:rotate(0) scale(1)} 25%{transform:rotate(-8deg) scale(1.05)} 75%{transform:rotate(8deg) scale(1.05)} }
  @keyframes ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(3);opacity:0} }
  @keyframes starPop { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.3) rotate(10deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes countUp { 0%{transform:translateY(20px);opacity:0} 100%{transform:translateY(0);opacity:1} }

  .chef-idle    { animation: chefBob 2.4s ease-in-out infinite; }
  .chef-happy   { animation: chefHappy 0.9s ease-in-out; }
  .chef-sad     { animation: chefSad 0.8s ease-in-out; }
  .chef-cook    { animation: chefCook 1.2s ease-in-out infinite; }
  .chef-celebrate { animation: chefHappy 0.7s ease-in-out 3; }
  .pan-cook     { animation: wokShake 0.5s ease-in-out; }
  .card-wrong   { animation: cardWrong 0.45s ease-in-out; }
  .float-in     { animation: floatIn 0.4s ease-out forwards; }
  .pulse-glow   { animation: pulseGlow 1.8s ease-in-out infinite; }
  .star-pop     { animation: starPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
  .count-up     { animation: countUp 0.4s ease-out forwards; }

  .bubble-down::after {
    content: '';
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: #22c55e;
  }
  .bubble-down-red::after {
    content: '';
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: #ef4444;
  }

  .ingredient-card {
    transform-style: preserve-3d;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .ingredient-card:hover:not(:disabled) {
    transform: translateY(-6px) scale(1.06) rotateX(8deg);
    box-shadow: 0 16px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(251,146,60,0.6);
  }
  .ingredient-card:active:not(:disabled) {
    transform: translateY(2px) scale(0.96) rotateX(-4deg);
  }
  .scene-3d {
    perspective: 800px;
    perspective-origin: 50% 30%;
  }
  .particle {
    position: fixed;
    pointer-events: none;
    font-size: 2rem;
    z-index: 9999;
    animation: particleFly 0.8s cubic-bezier(.25,.46,.45,.94) forwards;
  }
  .steam { animation: steamRise 1.8s ease-out infinite; }
  .steam-2 { animation: steamRise 1.8s ease-out 0.6s infinite; }
  .steam-3 { animation: steamRise 1.8s ease-out 1.2s infinite; }
  .ripple-circle { animation: ripple 0.6s ease-out forwards; }
`

// ─── Animated SVG Chef Character ─────────────────────────────────────────────
function ChefCharacter({ mood }: { mood: ChefMood }) {
  const moodClass = mood === 'happy' ? 'chef-happy' : mood === 'sad' ? 'chef-sad' : mood === 'cooking' ? 'chef-cook' : mood === 'celebrate' ? 'chef-celebrate' : 'chef-idle'
  const eyeLeft = mood === 'happy' || mood === 'celebrate' ? 'M18,24 Q20,21 22,24' : mood === 'sad' ? 'M18,26 Q20,24 22,26' : 'M19,24 A1.5,1.5 0 1,1 22,24'
  const eyeRight = mood === 'happy' || mood === 'celebrate' ? 'M30,24 Q32,21 34,24' : mood === 'sad' ? 'M30,26 Q32,24 34,26' : 'M31,24 A1.5,1.5 0 1,1 34,24'
  const mouth = mood === 'happy' || mood === 'celebrate' ? 'M22,32 Q26,38 30,32' : mood === 'sad' ? 'M22,36 Q26,31 30,36' : 'M23,34 Q26,37 29,34'
  const cheeks = (mood === 'happy' || mood === 'celebrate') ? (
    <>
      <ellipse cx="15" cy="30" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.6" />
      <ellipse cx="37" cy="30" rx="4" ry="2.5" fill="#ffb3b3" opacity="0.6" />
    </>
  ) : null

  return (
    <div className={`${moodClass} select-none`} style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>
      <svg width="120" height="160" viewBox="0 0 52 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="26" cy="14" rx="14" ry="4" fill="#fff" />
        <rect x="14" y="4" width="24" height="12" rx="4" fill="#fff" />
        <ellipse cx="26" cy="4" rx="8" ry="4" fill="#f0f0f0" />
        <ellipse cx="26" cy="14" rx="14" ry="4" fill="#e8e8e8" />
        <ellipse cx="26" cy="30" rx="14" ry="14" fill="#FDDCB5" />
        {cheeks}
        <path d={eyeLeft} stroke="#4a3728" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d={eyeRight} stroke="#4a3728" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {mood !== 'happy' && mood !== 'celebrate' && mood !== 'sad' && (
          <>
            <circle cx="20.5" cy="24.5" r="1" fill="#4a3728" />
            <circle cx="32.5" cy="24.5" r="1" fill="#4a3728" />
          </>
        )}
        <path d={mouth} stroke="#c0785a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="12" y="44" width="28" height="22" rx="8" fill="#fff" />
        <rect x="18" y="44" width="16" height="22" rx="4" fill="#f97316" opacity="0.85" />
        <circle cx="26" cy="50" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="26" cy="56" r="1.5" fill="#fff" opacity="0.8" />
        <path d="M12,50 Q2,48 4,58" stroke="#FDDCB5" strokeWidth="6" strokeLinecap="round" />
        <path d={mood === 'cooking' || mood === 'happy' ? "M40,50 Q50,40 48,52" : "M40,50 Q50,48 48,58"} stroke="#FDDCB5" strokeWidth="6" strokeLinecap="round" />
        <rect x="16" y="63" width="8" height="14" rx="4" fill="#3b4a6b" />
        <rect x="28" y="63" width="8" height="14" rx="4" fill="#3b4a6b" />
        <ellipse cx="20" cy="77" rx="6" ry="3" fill="#1e2533" />
        <ellipse cx="32" cy="77" rx="6" ry="3" fill="#1e2533" />
        {mood === 'sad' && <ellipse cx="38" cy="22" rx="2" ry="3" fill="#93c5fd" opacity="0.8" />}
        {mood === 'celebrate' && (
          <>
            <text x="2" y="18" fontSize="8">⭐</text>
            <text x="42" y="18" fontSize="8">⭐</text>
          </>
        )}
      </svg>
    </div>
  )
}

// ─── Animated Wok/Pan ─────────────────────────────────────────────────────────
function CookingWok({ shaking, ingredients }: { shaking: boolean; ingredients: string[] }) {
  return (
    <div className={`relative ${shaking ? 'pan-cook' : ''}`} style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }}>
      {ingredients.length > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none">
          <div className="steam w-2 h-6 bg-white/40 rounded-full blur-sm" />
          <div className="steam-2 w-2 h-7 bg-white/30 rounded-full blur-sm" />
          <div className="steam-3 w-2 h-5 bg-white/40 rounded-full blur-sm" />
        </div>
      )}

      <svg width="110" height="70" viewBox="0 0 110 70" fill="none">
        <rect x="80" y="28" width="28" height="8" rx="4" fill="#5a3e2b" />
        <rect x="82" y="30" width="24" height="4" rx="2" fill="#7a5a3b" />
        <ellipse cx="50" cy="32" rx="44" ry="14" fill="#2a2a2a" />
        <ellipse cx="50" cy="30" rx="44" ry="14" fill="#3a3a3a" />
        <ellipse cx="50" cy="28" rx="44" ry="14" fill="none" stroke="#555" strokeWidth="2" />
        <ellipse cx="50" cy="28" rx="42" ry="12" fill="none" stroke="#666" strokeWidth="1" />
        <ellipse cx="50" cy="36" rx="36" ry="10" fill="#1a1a1a" />
        {ingredients.length > 0 && (
          <>
            <ellipse cx="50" cy="38" rx="30" ry="7" fill="#b45309" opacity="0.9" />
            <ellipse cx="50" cy="37" rx="28" ry="6" fill="#d97706" opacity="0.6" />
            <circle cx="40" cy="37" r="2" fill="#fbbf24" opacity="0.7" />
            <circle cx="55" cy="36" r="1.5" fill="#fbbf24" opacity="0.6" />
            <circle cx="62" cy="38" r="2.5" fill="#fbbf24" opacity="0.5" />
          </>
        )}
        <ellipse cx="35" cy="22" rx="10" ry="4" fill="white" opacity="0.08" transform="rotate(-15 35 22)" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-1 pt-3">
        {ingredients.slice(-3).map((ing, i) => (
          <span key={i} className="text-sm" style={{ transform: `rotate(${(i - 1) * 15}deg)` }}>
            {ing}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Emoji mapping ────────────────────────────────────────────────────────────
function getIngredientEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('ayam') || n.includes('daging')) return '🍗'
  if (n.includes('santan')) return '🥛'
  if (n.includes('bawang merah')) return '🧅'
  if (n.includes('bawang putih')) return '🧄'
  if (n.includes('serai')) return '🌿'
  if (n.includes('kunyit')) return '🟡'
  if (n.includes('jahe') || n.includes('lengkuas')) return '🫚'
  if (n.includes('kemiri')) return '🥜'
  if (n.includes('daun')) return '🍃'
  if (n.includes('cabai') || n.includes('cabe') || n.includes('rawit')) return '🌶️'
  if (n.includes('garam')) return '🧂'
  if (n.includes('gula')) return '🍬'
  if (n.includes('minyak')) return '🫙'
  if (n.includes('air')) return '💧'
  if (n.includes('telur')) return '🥚'
  if (n.includes('tepung')) return '🌾'
  if (n.includes('bihun') || n.includes('mi')) return '🍜'
  if (n.includes('kentang')) return '🥔'
  if (n.includes('kecap')) return '🫗'
  if (n.includes('wijen')) return '⚪'
  if (n.includes('kayu manis')) return '🪵'
  if (n.includes('cengkeh') || n.includes('kapulaga') || n.includes('lawang')) return '✨'
  if (n.includes('ragi')) return '🫧'
  if (n.includes('margarin') || n.includes('butter') || n.includes('mentega')) return '🧈'
  if (n.includes('susu')) return '🥛'
  if (n.includes('keju')) return '🧀'
  return '🥄'
}

// ─── Kata yang BUKAN bahan (kata kerja masak, satuan, kata umum) ─────────────
const COOKING_STOPWORDS = new Set([
  // kata kerja / proses masak
  'rebus', 'rebusan', 'merebus', 'didihkan', 'didih', 'masak', 'matang',
  'angkat', 'simpan', 'suwir', 'haluskan', 'tumis', 'menumis', 'iris',
  'cincang', 'parut', 'sangrai', 'goreng', 'menggoreng', 'kukus',
  'panggang', 'aduk', 'campur', 'campurkan', 'tambahkan', 'tuang',
  'tuangkan', 'tiriskan', 'dinginkan', 'marinasi', 'lumuri', 'balurkan',
  'taburi', 'taburkan', 'siram', 'kocok', 'ulen',
  // satuan / ukuran
  'liter', 'ml', 'cc', 'sdm', 'sdt', 'gram', 'kg', 'siung', 'butir',
  'batang', 'lembar', 'ruas', 'buah', 'ekor', 'ikat', 'mangkuk',
  'cangkir', 'sendok', 'cup', 'kaleng', 'bungkus', 'sachet', 'potong',
  // kata umum
  'secukupnya', 'hingga', 'sampai', 'dengan', 'dalam', 'untuk', 'dari',
  'yang', 'dan', 'atau', 'lalu', 'kemudian', 'setelah', 'sebelum',
])

function extractStepIngredients(stepText: string, allIngredients: string[]): string[] {
  const lower = stepText.toLowerCase()
  const found: string[] = []

  for (const ing of allIngredients) {
    const words = ing
      .toLowerCase()
      .replace(/\(.*?\)/g, ' ')          // buang isi kurung
      .replace(/\d+([.,]\d+)?/g, ' ')    // buang angka
      .replace(/[(),./-]/g, ' ')         // buang tanda baca
      .split(/\s+/)
      .filter(w => w.length >= 3 && !COOKING_STOPWORDS.has(w))

    if (words.length === 0) continue

    // cocokkan per KATA utuh (biar "air" tidak cocok dengan "cair", dll)
    const hasWord = (w: string) =>
      new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)

    // FIX: 1 kata → harus ketemu; >1 kata → SEMUA kata harus ketemu
    const matched = words.length === 1 ? hasWord(words[0]) : words.every(hasWord)
    if (matched) found.push(ing)
  }

  return found.slice(0, 8)
}

// FIX #5: Math.max agar slice tidak pernah negatif
function buildSlots(correctIngs: string[], allIngredients: string[], count = 8): IngredientSlot[] {
  const decoyCount = Math.max(0, count - correctIngs.length)
  const decoys = [...allIngredients]
    .filter(i => !correctIngs.includes(i))
    .sort(() => Math.random() - 0.5)
    .slice(0, decoyCount)
  return [
    ...correctIngs.map(name => ({ name, isCorrect: true, emoji: getIngredientEmoji(name), id: Math.random().toString(36).slice(2) })),
    ...decoys.map(name => ({ name, isCorrect: false, emoji: getIngredientEmoji(name), id: Math.random().toString(36).slice(2) })),
  ].sort(() => Math.random() - 0.5)
}

function selectCookingSteps(dish: Dish, max = 5) {
  const result: { stepIdx: number; stepText: string; correctIngs: string[] }[] = []
  for (let i = 0; i < dish.cooking_steps.length && result.length < max; i++) {
    const stepText = dish.cooking_steps[i]
    const correctIngs = extractStepIngredients(stepText, dish.ingredients)
    if (correctIngs.length >= 1) result.push({ stepIdx: i, stepText, correctIngs })
  }
  if (result.length < 3) {
    for (let i = 0; i < dish.cooking_steps.length && result.length < max; i++) {
      if (!result.find(r => r.stepIdx === i))
        result.push({ stepIdx: i, stepText: dish.cooking_steps[i], correctIngs: [] })
    }
  }
  return result.slice(0, max)
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BhinnekaRasaGame() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<GamePhase>('select')
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const [cookingSteps, setCookingSteps] = useState<{ stepIdx: number; stepText: string; correctIngs: string[] }[]>([])
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [slots, setSlots] = useState<IngredientSlot[]>([])
  const [pickedIngredients, setPickedIngredients] = useState<string[]>([])
  const [wokIngredients, setWokIngredients] = useState<string[]>([])
  const [stepDone, setStepDone] = useState(false)
  const [chefMood, setChefMood] = useState<ChefMood>('idle')
  const [wokShaking, setWokShaking] = useState(false)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [scoreAnim, setScoreAnim] = useState(false)
  const [results, setResults] = useState<CookResult[]>([])
  const [particles, setParticles] = useState<FloatingParticle[]>([])
  const [wrongCardId, setWrongCardId] = useState<string | null>(null)
  const [wrongMsg, setWrongMsg] = useState<string | null>(null)
  const [wrongPickedIds, setWrongPickedIds] = useState<string[]>([]) // FIX #1
  const [rippleKey, setRippleKey] = useState(0)
  const wokRef = useRef<HTMLDivElement>(null)

  // FIX #8: response parsing aman
  useEffect(() => {
    fetch(`${API_BASE}/dishes`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || [])
        setDishes(Array.isArray(list) ? list : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const startCooking = useCallback((dish: Dish) => {
    const steps = selectCookingSteps(dish, 5)
    setSelectedDish(dish)
    setCookingSteps(steps)
    setCurrentStepIdx(0)
    setPickedIngredients([])
    setWokIngredients([])
    setStepDone(false)
    setChefMood('idle')
    setWokShaking(false)
    setLives(3)
    setScore(0)
    setResults([])
    setParticles([])
    setWrongCardId(null)
    setWrongMsg(null)
    setWrongPickedIds([])
    setSlots(steps.length > 0 ? buildSlots(steps[0].correctIngs, dish.ingredients) : [])
    setPhase('cooking')
  }, [])

  function spawnParticle(emoji: string, fromEl: HTMLButtonElement | null) {
    if (!fromEl || !wokRef.current) return
    const from = fromEl.getBoundingClientRect()
    const to = wokRef.current.getBoundingClientRect()
    const p: FloatingParticle = {
      id: Math.random().toString(36).slice(2),
      emoji,
      x: from.left + from.width / 2,
      y: from.top + from.height / 2,
      targetX: to.left + to.width / 2,
      targetY: to.top + to.height / 2,
    }
    setParticles(prev => [...prev, p])
    setTimeout(() => setParticles(prev => prev.filter(pt => pt.id !== p.id)), 850)
  }

  // FIX #1, #2, #3, #4: logic pick bahan diperbaiki
  function handlePickIngredient(slot: IngredientSlot, evt: React.MouseEvent<HTMLButtonElement>) {
    if (stepDone || lives <= 0) return
    if (pickedIngredients.includes(slot.name)) return
    if (wrongPickedIds.includes(slot.id)) return

    const currentStep = cookingSteps[currentStepIdx]
    if (!currentStep || currentStep.correctIngs.length === 0) return

    if (slot.isCorrect) {
      spawnParticle(slot.emoji, evt.currentTarget)
      const newPicked = [...pickedIngredients, slot.name]
      setPickedIngredients(newPicked)
      setWokIngredients(prev => [...prev, slot.emoji])

      setScore(s => s + 50)
      setScoreAnim(true)
      setTimeout(() => setScoreAnim(false), 450)

      setWokShaking(true)
      setRippleKey(k => k + 1)
      setTimeout(() => setWokShaking(false), 550)

      const allCorrectPicked = currentStep.correctIngs.every(ci => newPicked.includes(ci))
      if (allCorrectPicked) {
        setStepDone(true)
        setWrongMsg(null)
        setChefMood('happy')
        setResults(r => [...r, { step: currentStepIdx + 1, stepText: currentStep.stepText, pickedIngredient: newPicked.join(', '), correct: true }])
        setTimeout(() => setChefMood('idle'), 1000)
      } else {
        setChefMood('cooking')
        setTimeout(() => setChefMood('idle'), 700)
      }
    } else {
      // Kartu salah → langsung ditandai & disabled
      setWrongPickedIds(ids => [...ids, slot.id])
      setWrongCardId(slot.id)
      setChefMood('sad')

      const newLives = Math.max(0, lives - 1)
      setLives(newLives)
      setWrongMsg(newLives <= 0 ? 'Nyawa habis!' : 'Bukan itu!')
      setResults(r => [...r, { step: currentStepIdx + 1, stepText: currentStep.stepText, pickedIngredient: slot.name, correct: false }])

      setTimeout(() => { setWrongCardId(null); setChefMood('idle') }, 750)

      if (newLives <= 0) {
        setTimeout(() => { setWrongMsg(null); setPhase('result') }, 1100)
      } else {
        setTimeout(() => setWrongMsg(null), 1200)
      }
    }
  }

  function handleNextStep() {
    const nextIdx = currentStepIdx + 1
    if (nextIdx >= cookingSteps.length) {
      setChefMood('celebrate')
      setTimeout(() => setPhase('result'), 800)
      return
    }
    setCurrentStepIdx(nextIdx)
    setPickedIngredients([])
    setStepDone(false)
    setChefMood('idle')
    setWrongCardId(null)
    setWrongMsg(null)
    setWrongPickedIds([])
    const nextStep = cookingSteps[nextIdx]
    setSlots(buildSlots(nextStep.correctIngs, selectedDish!.ingredients))
  }

  const getRank = () => {
    const pct = cookingSteps.length > 0 ? (results.filter(r => r.correct).length / cookingSteps.length) * 100 : 0
    if (pct >= 90) return { label: 'Koki Maestro 👨‍🍳', color: 'text-amber-400', bg: 'from-amber-500 to-orange-600' }
    if (pct >= 70) return { label: 'Juru Masak Handal 🍳', color: 'text-orange-400', bg: 'from-orange-500 to-red-500' }
    if (pct >= 50) return { label: 'Murid Dapur 🌶️', color: 'text-red-400', bg: 'from-red-500 to-pink-600' }
    return { label: 'Masih Belajar 🍜', color: 'text-slate-300', bg: 'from-slate-500 to-slate-700' }
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="gf min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 flex items-center justify-center">
      <style>{STYLES}</style>
      <div className="text-center">
        <ChefCharacter mood="cooking" />
        <p className="text-amber-300 font-semibold mt-4 ff text-xl">Menyiapkan dapur...</p>
      </div>
    </div>
  )

  // ─── PHASE: SELECT ────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="gf min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <style>{STYLES}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌶️', '🧄', '🍃', '🥄', '', '🧅'].map((e, i) => (
          <div key={i} className="absolute text-5xl opacity-5"
            style={{ left: `${10 + i * 16}%`, top: `${15 + (i % 3) * 25}%`, animation: `chefBob ${2 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
            {e}
          </div>
        ))}
      </div>

      {/* FIX #11: container lebih lebar di desktop */}
      <div className="relative z-10 max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center mb-8">
          <ChefCharacter mood="idle" />
          <div className="mt-2 text-center">
            <h1 className="ff text-4xl sm:text-5xl md:text-6xl text-white" style={{ textShadow: '0 4px 20px rgba(251,146,60,0.5)' }}>
              Bhinneka<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">-Rasa</span>
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">Pilih resep & simulasikan memasak kuliner Medan! 🍳</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { icon: '📖', title: 'Baca Langkah', desc: 'Ikuti instruksi masak' },
            { icon: '🥄', title: 'Masukkan Bahan', desc: 'Klik bahan yang tepat' },
            { icon: '🏆', title: '+50 Poin', desc: 'Per bahan yang benar' },
          ].map(item => (
            <div key={item.title} className="rounded-2xl p-3 text-center border border-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-white font-bold text-xs">{item.title}</div>
              <div className="text-slate-400 text-[11px] mt-0.5 hidden sm:block">{item.desc}</div>
            </div>
          ))}
        </div>

        <h2 className="text-slate-300 font-semibold mb-3 flex items-center gap-2 text-sm">
          <ChefHat className="w-4 h-4 text-amber-400" /> Pilih Resep
        </h2>

        {/* FIX #11: 2 kolom di desktop */}
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {dishes.length === 0 ? (
            <div className="text-center py-10 rounded-3xl border border-white/10 md:col-span-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-slate-400 text-sm">Belum ada resep. Pastikan backend berjalan.</p>
            </div>
          ) : dishes.map(dish => (
            <button key={dish.id} onClick={() => startCooking(dish)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all group text-left float-in"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
              {dish.image
                ? <img src={dish.image} alt={dish.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
                : <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-orange-500/20 flex items-center justify-center text-3xl flex-shrink-0">🍽️</div>}
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base group-hover:text-amber-300 transition-colors">{dish.name}</div>
                <div className="text-slate-400 text-sm mt-0.5 line-clamp-1">{dish.description}</div>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">{dish.category}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Flame className="w-3 h-3" />{dish.cooking_steps?.length || 0} langkah</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── PHASE: COOKING ──────────────────────────────────────────────────────────
  if (phase === 'cooking' && selectedDish) {
    // FIX #6: guard kalau tidak ada steps
    if (cookingSteps.length === 0) {
      return (
        <div className="gf min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 40%, #1a0000 100%)' }}>
          <style>{STYLES}</style>
          <div className="text-center p-6">
            <ChefCharacter mood="sad" />
            <p className="text-slate-300 mt-4 text-sm">Resep ini belum punya langkah memasak.</p>
            <button onClick={() => setPhase('select')}
              className="mt-4 px-6 py-3 rounded-2xl text-white font-bold ff"
              style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}>
              ← Kembali Pilih Resep
            </button>
          </div>
        </div>
      )
    }

    const currentStep = cookingSteps[currentStepIdx]
    const hasIngredients = (currentStep?.correctIngs.length || 0) > 0
    const gameOver = lives <= 0
    // FIX #7: progress menghitung langkah yang selesai
    const completedSteps = currentStepIdx + (stepDone || !hasIngredients ? 1 : 0)
    const progressPct = Math.min(100, (completedSteps / cookingSteps.length) * 100)

    return (
      <div className="gf min-h-screen relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 40%, #1a0000 100%)' }}>
        <style>{STYLES}</style>

        {particles.map(p => (
          <div key={p.id} className="particle" style={{
            left: p.x, top: p.y,
            '--tx': `${p.targetX - p.x}px`,
            '--ty': `${p.targetY - p.y}px`,
          } as React.CSSProperties}>
            {p.emoji}
          </div>
        ))}

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2" style={{ background: 'linear-gradient(180deg, rgba(120,60,0,0.15) 0%, transparent 100%)' }} />
        </div>

        <div className="relative z-10 max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-4 py-3 md:py-6">
          {/* Top HUD */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { if (window.confirm('Keluar dari permainan?')) setPhase('select') }}
              className="p-2 rounded-xl border border-white/15 hover:bg-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {[1, 2, 3].map(i => (
                  <Heart key={i} className={`w-5 h-5 transition-all duration-300 ${i <= lives ? 'text-red-400 fill-red-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all ${scoreAnim ? 'scale-125' : 'scale-100'}`}
                style={{ background: 'rgba(251,146,60,0.15)' }}>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className={`text-amber-300 font-bold text-sm ff ${scoreAnim ? 'count-up' : ''}`}>{score}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #f97316, #fbbf24)' }} />
            </div>
            <span className="text-slate-400 text-xs">{Math.min(currentStepIdx + 1, cookingSteps.length)}/{cookingSteps.length}</span>
          </div>

          {/* SCENE 3D */}
          <div className="scene-3d mb-4">
            <div className="relative rounded-3xl border border-white/10"
              style={{
                background: 'linear-gradient(180deg, rgba(80,40,10,0.92) 0%, rgba(40,18,3,0.97) 100%)',
                transform: 'perspective(600px) rotateX(5deg)',
                boxShadow: '0 20px 48px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
              <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(88deg, rgba(255,255,255,0.025) 0px, transparent 2px, transparent 22px)',
              }} />

              <div className="relative flex items-end justify-around px-4 sm:px-6 pt-6 pb-5 gap-3 sm:gap-4">
                {/* Chef column */}
                <div className="flex flex-col items-center gap-0 flex-shrink-0" style={{ minWidth: 100 }}>
                  <div className="relative h-9 flex items-end justify-center mb-1 w-full">
                    {wrongMsg && (
                      <div className="bubble-down-red float-in relative whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-2xl text-white"
                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.55)' }}>
                        ❌ {wrongMsg}
                      </div>
                    )}
                    {stepDone && !wrongMsg && (
                      <div className="bubble-down float-in relative whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-2xl text-white"
                        style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 14px rgba(34,197,94,0.55)' }}>
                        ✅ Mantap!
                      </div>
                    )}
                  </div>
                  <ChefCharacter mood={chefMood} />
                </div>

                {/* Wok column */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="ff text-amber-300 text-sm font-semibold text-center mb-1"
                    style={{ textShadow: '0 2px 8px rgba(251,191,36,0.4)' }}>
                    {selectedDish.name}
                  </div>
                  <div ref={wokRef} className="relative">
                    <CookingWok shaking={wokShaking} ingredients={wokIngredients} />
                    <div key={rippleKey} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {rippleKey > 0 && <div className="ripple-circle w-16 h-16 rounded-full border-2 border-amber-400/60" />}
                    </div>
                  </div>
                  {scoreAnim && (
                    <div className="star-pop ff text-green-400 font-bold text-xl pointer-events-none select-none">+50</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step instruction */}
          <div className="rounded-2xl p-4 mb-4 border border-white/10 float-in"
            style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ff text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>
                {currentStepIdx + 1}
              </div>
              <p className="text-white leading-relaxed text-sm flex-1">{currentStep?.stepText}</p>
            </div>
            {pickedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                {pickedIngredients.map(ing => (
                  <span key={ing} className="flex items-center gap-1 text-xs bg-green-500/20 border border-green-500/40 text-green-300 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" />{ing.split('(')[0].trim().slice(0, 20)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* FIX #12: overlay nyawa habis */}
          {gameOver && (
            <div className="text-center py-6 rounded-2xl border border-red-500/30 float-in" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <p className="text-red-300 font-bold ff text-lg">💔 Nyawa habis!</p>
              <p className="text-slate-400 text-sm mt-1">Menghitung hasil masakan...</p>
            </div>
          )}

          {/* Ingredients grid — FIX #1: disabled untuk kartu salah/nyawa 0 */}
          {hasIngredients && !stepDone && !gameOver && (
            <div>
              <p className="text-slate-400 text-xs mb-3 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                Pilih bahan yang dibutuhkan
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold ff">
                  {pickedIngredients.length}/{currentStep.correctIngs.length}
                </span>
              </p>

              {/* Grid kondisional sesuai jumlah kartu */}
              <div className={`grid gap-1.5 sm:gap-2.5 ${slots.length <= 6 ? 'grid-cols-3'
                  : slots.length <= 8 ? 'grid-cols-4'
                    : 'grid-cols-4 sm:grid-cols-5'
                }`}>
                {slots.map((slot) => {
                  const isPicked = pickedIngredients.includes(slot.name)
                  const isWrongTried = wrongPickedIds.includes(slot.id)
                  const isShaking = wrongCardId === slot.id
                  return (
                    <button key={slot.id}
                      onClick={(e) => handlePickIngredient(slot, e)}
                      disabled={isPicked || isWrongTried}
                      className={`ingredient-card relative flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-2xl border-2 transition-colors select-none touch-manipulation
              ${isPicked ? 'opacity-50 cursor-not-allowed border-green-500/40 bg-green-500/10'
                          : isShaking ? 'card-wrong border-red-400/80 bg-red-500/20'
                            : isWrongTried ? 'opacity-40 cursor-not-allowed border-red-500/30 bg-red-500/10'
                              : 'border-white/15 hover:border-orange-400/70 cursor-pointer'}
            `}
                      style={!isPicked && !isWrongTried && !isShaking ? { background: 'rgba(255,255,255,0.07)' } : undefined}>
                      <span className="text-2xl sm:text-3xl">{slot.emoji}</span>
                      <span className="text-white text-[9px] sm:text-[10px] font-medium text-center leading-tight">
                        {slot.name.split('(')[0].replace(/\d+[a-z]*/g, '').trim().slice(0, 18)}
                      </span>
                      {isPicked && <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>}
                      {(isShaking || isWrongTried) && <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-3 h-3 text-white" />
                      </div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!hasIngredients && !gameOver && (
            <div className="text-center py-4 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-slate-400 text-sm">🔥 Langkah teknis — tidak ada bahan yang perlu dimasukkan</p>
            </div>
          )}

          {(stepDone || !hasIngredients) && !gameOver && (
            <button onClick={handleNextStep}
              className="w-full py-4 mt-4 text-white font-bold text-base rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 float-in pulse-glow ff"
              style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', boxShadow: '0 8px 32px rgba(249,115,22,0.4)' }}>
              {currentStepIdx + 1 >= cookingSteps.length
                ? '🏁 Selesai Memasak!'
                : <><ChevronRight className="w-5 h-5" /> Lanjut Langkah {currentStepIdx + 2}</>}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── PHASE: RESULT ────────────────────────────────────────────────────────────
  const rank = getRank()
  const correctCount = results.filter(r => r.correct).length
  const wrongCount = results.filter(r => !r.correct).length // FIX #3

  return (
    <div className="gf min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <style>{STYLES}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌟', '✨', '🎉', '⭐', '🎊'].map((e, i) => (
          <div key={i} className="absolute text-4xl opacity-20"
            style={{ left: `${10 + i * 18}%`, top: `${10 + (i % 2) * 60}%`, animation: `chefBob ${1.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
            {e}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full float-in">
        <div className="flex justify-center mb-4">
          <ChefCharacter mood={correctCount >= cookingSteps.length * 0.7 ? 'celebrate' : 'sad'} />
        </div>

        <div className="text-center mb-5">
          <h2 className={`ff text-3xl font-bold mb-1 ${rank.color}`}>{rank.label}</h2>
          <p className="text-slate-400 text-sm">Kamu memasak <span className="text-white font-semibold">{selectedDish?.name}</span>!</p>
        </div>

        <div className="rounded-3xl p-5 mb-4 border border-white/10 float-in" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
          <div className="text-center mb-4">
            <div className={`ff text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${rank.bg}`}>{score.toLocaleString()}</div>
            <p className="text-slate-400 text-sm mt-1">Total Poin</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: correctCount, label: 'Benar', color: 'text-green-400' },
              { val: wrongCount, label: 'Salah', color: 'text-red-400' },
              { val: lives, label: 'Nyawa Sisa', color: 'text-amber-400' },
            ].map(item => (
              <div key={item.label} className="text-center rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className={`ff text-2xl font-bold ${item.color}`}>{item.val}</div>
                <div className="text-slate-400 text-xs mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-4 mb-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-400" /> Rekap Memasak
          </h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-xl text-xs ${r.correct ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {r.correct ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 truncate">Langkah {r.step}: {r.stepText.slice(0, 50)}...</p>
                  <p className={`mt-0.5 font-semibold ${r.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {r.correct ? `✓ ${r.pickedIngredient}` : `✗ ${r.pickedIngredient}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => selectedDish && startCooking(selectedDish)}
            className="flex-1 py-4 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ff"
            style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>
            <RefreshCw className="w-5 h-5" /> Masak Lagi
          </button>
          <button onClick={() => setPhase('select')}
            className="py-4 px-5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}