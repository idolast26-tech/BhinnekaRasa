import { useState, useEffect, useRef, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, X, Search, ChefHat, Star,
  Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle, Check,
  Leaf, Flame, BookOpen, Info, Sparkles, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown
} from 'lucide-react'
import { adminFetch } from '../../services/adminApi'
import API_BASE_URL from '../../config/api'

interface Dish {
  id: number; name: string; description: string; category: string; price: number
  image: string; is_popular: number; history: string; ingredients: string
  nutrition: string; journey: string; spices: string; cooking_steps: string; created_at: string
}

interface FormData {
  name: string; description: string; category: string; price: number; image: string
  is_popular: boolean; history: string; ingredients: string; nutrition: string
  journey: string; spices: string; cooking_steps: string
}

type ImageMode = 'url' | 'upload'

// ⚙️ 'json' → ["a","b"] | 'lines' → "a\nb" (sesuaikan backend kamu)
const LIST_FORMAT: 'json' | 'lines' = 'json'

const CATEGORIES = [
  { value: 'Sup', emoji: '🍲', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Tradisional', emoji: '🍛', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Makanan Penutup', emoji: '🍰', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'Mie', emoji: '🍜', color: 'bg-orange-50 text-orange-700 border-orange-200' },
]

// Bahan yang sering dipakai — tinggal tap untuk menambahkan
const COMMON_INGREDIENTS = [
  'Bawang merah', 'Bawang putih', 'Garam', 'Gula', 'Santan', 'Cabai merah',
  'Kemiri', 'Kunyit', 'Jahe', 'Lengkuas', 'Serai', 'Daun jeruk', 'Minyak goreng', 'Air',
]

const EMPTY_FORM: FormData = {
  name: '', description: '', category: 'Tradisional', price: 0, image: '',
  is_popular: false, history: '', ingredients: '', nutrition: '', journey: '',
  spices: '', cooking_steps: '',
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

const STEPS = [
  { icon: Info, label: 'Info Menu' },
  { icon: ImageIcon, label: 'Gambar' },
  { icon: ChefHat, label: 'Bahan & Langkah' },
  { icon: BookOpen, label: 'Sejarah & Cerita' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toLines = (v: unknown): string => {
  if (Array.isArray(v)) return v.join('\n')
  if (typeof v !== 'string' || !v.trim()) return ''
  try {
    const p = JSON.parse(v)
    if (Array.isArray(p)) return p.join('\n')
  } catch { /* teks biasa */ }
  return v
}

const toList = (v: unknown): string[] => toLines(v).split('\n').map(s => s.trim()).filter(Boolean)

const serialize = (list: string[]): string =>
  LIST_FORMAT === 'json' ? JSON.stringify(list) : list.join('\n')

const ingEmoji = (n: string): string => {
  const s = n.toLowerCase()
  if (s.includes('bawang merah')) return '🧅'
  if (s.includes('bawang putih')) return '🧄'
  if (s.includes('cabai') || s.includes('cabe')) return '🌶️'
  if (s.includes('santan') || s.includes('susu')) return '🥛'
  if (s.includes('garam')) return '🧂'
  if (s.includes('gula') || s.includes('kecap')) return '🍬'
  if (s.includes('ayam')) return '🍗'
  if (s.includes('daging')) return '🥩'
  if (s.includes('telur')) return '🥚'
  if (s.includes('mie') || s.includes('bihun')) return '🍜'
  if (s.includes('daun')) return '🍃'
  if (s.includes('kunyit') || s.includes('jahe') || s.includes('lengkuas') || s.includes('serai')) return '🫚'
  if (s.includes('kemiri')) return '🥜'
  return '🥬'
}

function Label({ text, required, optional }: { text: string; required?: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-sm font-semibold text-gray-700">{text}</span>
      {required && <span className="text-[10px] font-bold text-white bg-red-400 px-1.5 py-0.5 rounded-full">WAJIB</span>}
      {optional && <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">OPSIONAL</span>}
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1"><span>💡</span><span>{children}</span></p>
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ManageMenu() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')

  const [showForm, setShowForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState('')
  const [imageMode, setImageMode] = useState<ImageMode>('url')
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ✨ Builder bahan & langkah (lebih mudah dari textarea)
  const [ingredientList, setIngredientList] = useState<string[]>([])
  const [ingInput, setIngInput] = useState('')
  const [stepList, setStepList] = useState<string[]>([])

  useEffect(() => { fetchDishes() }, [])
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t) }
  }, [toast])

  const notify = (type: 'success' | 'error', msg: string) => setToast({ type, msg })
  const update = (patch: Partial<FormData>) => setFormData(f => ({ ...f, ...patch }))

  const fetchDishes = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/dishes`)
      const data = await res.json()
      if (data.success) setDishes(data.data)
    } catch {
      notify('error', 'Gagal memuat data menu')
    } finally {
      setLoading(false)
    }
  }

  // ─── Gambar ───────────────────────────────────────────────────────────────
  const processFile = async (file: File) => {
    setImageError(null)
    if (!file.type.startsWith('image/')) { setImageError('File harus berupa gambar (JPG/PNG)'); return }
    if (file.size > MAX_FILE_SIZE) { setImageError(`Ukuran maksimal 2MB (punyamu ${(file.size / 1024 / 1024).toFixed(1)}MB)`); return }
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const MAX_DIM = 800
            let { width, height } = img
            if (width > height && width > MAX_DIM) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM }
            else if (height > MAX_DIM) { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM }
            const canvas = document.createElement('canvas')
            canvas.width = width; canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject('Canvas tidak didukung')
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.85))
          }
          img.onerror = () => reject('Gambar tidak valid')
          img.src = e.target?.result as string
        }
        reader.onerror = () => reject('Gagal membaca file')
        reader.readAsDataURL(file)
      })
      update({ image: base64 })
      setImageMode('upload')
    } catch {
      setImageError('Gagal memproses gambar')
    }
  }

  // ─── Builder: bahan ───────────────────────────────────────────────────────
  const addIngredient = (raw: string) => {
    const lines = raw.split('\n').map(s => s.trim()).filter(Boolean)
    if (!lines.length) return
    setIngredientList(list => {
      const merged = [...list]
      for (const l of lines) if (!merged.some(m => m.toLowerCase() === l.toLowerCase())) merged.push(l)
      return merged
    })
    setIngInput('')
  }

  const removeIngredient = (i: number) => setIngredientList(l => l.filter((_, idx) => idx !== i))

  // ─── Builder: langkah ─────────────────────────────────────────────────────
  const addStep = () => setStepList(l => [...l, ''])
  const updateStep = (i: number, val: string) => setStepList(l => l.map((s, idx) => (idx === i ? val : s)))
  const removeStep = (i: number) => setStepList(l => l.filter((_, idx) => idx !== i))
  const moveStep = (i: number, dir: -1 | 1) => setStepList(l => {
    const j = i + dir
    if (j < 0 || j >= l.length) return l
    const next = [...l]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  // ─── ✨ AI generate ───────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!formData.name.trim()) { setStep(0); setStepError('Isi nama menu dulu ya, biar AI tahu mau buat apa 😊'); return }
    setAiLoading(true)
    try {
      const res = await adminFetch(`${API_BASE_URL}/ai/generate-recipe`, {
        method: 'POST',
        body: JSON.stringify({ name: formData.name, category: formData.category }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        const d = data.data
        if (Array.isArray(d.ingredients) && d.ingredients.length) setIngredientList(d.ingredients.map(String))
        if (Array.isArray(d.steps) && d.steps.length) setStepList(d.steps.map(String))
        if (Array.isArray(d.spices) && d.spices.length) update({ spices: d.spices.join('\n') })
        if (typeof d.history === 'string' && d.history) update({ history: d.history })
        notify('success', 'Resep & sejarah dibuat AI! Silakan cek dan edit sesuka hati ✨')
      } else {
        notify('error', data.message || 'AI gagal membuat resep')
      }
    } catch {
      notify('error', 'Fitur AI belum tersedia di backend (lihat panduan route /api/ai)')
    } finally {
      setAiLoading(false)
    }
  }

  // ─── Wizard ──────────────────────────────────────────────────────────────
  const step0Valid = formData.name.trim() !== '' && formData.description.trim() !== ''

  const handleNext = () => {
    if (step === 0 && !step0Valid) { setStepError('Nama menu dan deskripsi wajib diisi dulu ya 😊'); return }
    setStepError('')
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const openAddForm = () => {
    setEditingDish(null); setFormData(EMPTY_FORM); setStep(0); setStepError('')
    setImageMode('url'); setImageError(null)
    setIngredientList([]); setStepList([]); setIngInput('')
    setShowForm(true)
  }

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish)
    setImageMode(dish.image?.startsWith('data:image') ? 'upload' : 'url')
    setFormData({
      name: dish.name, description: dish.description || '', category: dish.category || 'Tradisional',
      price: dish.price || 0, image: dish.image || '', is_popular: dish.is_popular === 1,
      history: dish.history || '', ingredients: toLines(dish.ingredients), nutrition: dish.nutrition || '',
      journey: dish.journey || '', spices: dish.spices || '', cooking_steps: toLines(dish.cooking_steps),
    })
    setIngredientList(toList(dish.ingredients))
    setStepList(toList(dish.cooking_steps))
    setIngInput('')
    setStep(0); setStepError(''); setImageError(null)
    setShowForm(true)
  }

  const closeModal = () => { setShowForm(false); setEditingDish(null); setFormData(EMPTY_FORM); setStep(0) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!step0Valid) { setStep(0); setStepError('Nama menu dan deskripsi wajib diisi dulu ya 😊'); return }
    setSaving(true)
    try {
      const url = editingDish ? `${API_BASE_URL}/admin/dishes/${editingDish.id}` : `${API_BASE_URL}/admin/dishes`
      const method = editingDish ? 'PUT' : 'POST'
      const payload = {
        ...formData,
        ingredients: serialize(ingredientList),
        cooking_steps: serialize(stepList.filter(s => s.trim())),
      }
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) {
        notify('success', editingDish ? 'Menu berhasil diupdate! 🎉' : 'Menu baru berhasil ditambahkan! 🎉')
        fetchDishes(); closeModal()
      } else notify('error', data.message || 'Gagal menyimpan')
    } catch {
      notify('error', 'Terjadi kesalahan!')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/dishes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { notify('success', 'Menu berhasil dihapus!'); fetchDishes() }
      else notify('error', data.message || 'Gagal menghapus')
    } catch { notify('error', 'Gagal menghapus menu!') }
  }

  const filteredDishes = dishes.filter(d =>
    (categoryFilter === 'Semua' || d.category === categoryFilter) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getCategory = (cat: string) => CATEGORIES.find(c => c.value === cat)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full"></div>
        <p className="text-gray-500 text-sm">Memuat menu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-amber-50 rounded-lg shrink-0 transition">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 truncate">
                <ChefHat className="w-5 h-5 text-amber-600" /> Kelola Menu
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">{dishes.length} menu tersimpan</p>
            </div>
          </div>
          <button onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-200 transition font-semibold shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Menu</span><span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + filter */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-amber-100 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['Semua', ...CATEGORIES.map(c => c.value)].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                categoryFilter === cat ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
              {cat === 'Semua' ? '🍽️ Semua' : `${getCategory(cat)?.emoji} ${cat}`}
            </button>
          ))}
        </div>

        {/* Daftar menu */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
            <ChefHat className="w-14 h-14 mx-auto mb-3 text-amber-200" />
            <p className="font-medium text-gray-600">Tidak ada menu yang cocok</p>
            <button onClick={openAddForm} className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition">
              + Tambah menu pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map(dish => (
              <div key={dish.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden flex flex-col">
                <div className="relative h-40 bg-gradient-to-br from-amber-100 to-orange-100">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-amber-300" /></div>
                  )}
                  {dish.is_popular === 1 && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                      <Star className="w-3 h-3 fill-white" /> POPULER
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800">{dish.name}</h3>
                    <span className="text-sm font-bold text-amber-600 whitespace-nowrap">Rp {(dish.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{dish.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getCategory(dish.category)?.color ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {getCategory(dish.category)?.emoji} {dish.category || '—'}
                    </span>
                    <span className="text-[10px] text-gray-400">{toList(dish.cooking_steps).length} langkah</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditForm(dish)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(dish.id, dish.name)}
                      className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* ═══════════ MODAL WIZARD ═══════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-3xl h-[95vh] sm:h-auto sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Stepper */}
            <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingDish ? `✏️ Edit: ${editingDish.name}` : '➕ Tambah Menu Baru'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-white rounded-lg transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center">
                {STEPS.map((s, i) => (
                  <Fragment key={s.label}>
                    <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1" title={s.label}>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition ${
                        i < step ? 'bg-green-500 border-green-500 text-white'
                        : i === step ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-105'
                        : 'bg-white border-gray-200 text-gray-400'}`}>
                        {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] font-semibold hidden sm:block ${i === step ? 'text-amber-700' : 'text-gray-500'}`}>{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-1.5 sm:mx-3 rounded-full mb-4 sm:mb-5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </Fragment>
                ))}
              </div>
              <p className="sm:hidden text-xs font-semibold text-amber-700 mt-1">
                Langkah {step + 1} dari {STEPS.length}: {STEPS[step].label}
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5">

              {/* ── STEP 1: INFO ── */}
              {step === 0 && (
                <>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Tenang, isi bertahap aja 😊 Hanya <b>nama</b> dan <b>deskripsi</b> yang wajib. Bahan, langkah & sejarah bisa dibantu AI ✨</span>
                  </div>

                  <div>
                    <Label text="Nama Menu" required />
                    <input type="text" value={formData.name} onChange={e => update({ name: e.target.value })}
                      placeholder="cth: Soto Medan, Bika Ambon, Mie Gomak..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition" />
                  </div>

                  <div>
                    <Label text="Deskripsi Singkat" required />
                    <textarea value={formData.description} onChange={e => update({ description: e.target.value })} rows={2}
                      placeholder="Jelaskan menu ini dalam 1-2 kalimat..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none" />
                  </div>

                  <div>
                    <Label text="Kategori" required />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map(c => (
                        <button type="button" key={c.value} onClick={() => update({ category: c.value })}
                          className={`rounded-xl border-2 p-3 text-center transition ${
                            formData.category === c.value ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-gray-200 bg-white hover:border-amber-300'}`}>
                          <div className="text-2xl">{c.emoji}</div>
                          <div className={`text-xs font-semibold mt-1 ${formData.category === c.value ? 'text-amber-700' : 'text-gray-600'}`}>{c.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label text="Harga" optional />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">Rp</span>
                        <input type="number" min="0" value={formData.price || ''} onChange={e => update({ price: Number(e.target.value) })}
                          placeholder="37500"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition" />
                      </div>
                      {formData.price > 0 && <p className="text-xs text-amber-600 font-semibold mt-1">= Rp {formData.price.toLocaleString('id-ID')}</p>}
                    </div>
                    <div>
                      <Label text="Menu Populer?" optional />
                      <button type="button" onClick={() => update({ is_popular: !formData.is_popular })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                          formData.is_popular ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Star className={`w-4 h-4 ${formData.is_popular ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          {formData.is_popular ? 'Ya, populer' : 'Tidak'}
                        </span>
                        <span className={`w-11 h-6 rounded-full relative transition ${formData.is_popular ? 'bg-amber-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.is_popular ? 'left-[22px]' : 'left-0.5'}`} />
                        </span>
                      </button>
                    </div>
                  </div>

                  {stepError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {stepError}
                    </div>
                  )}
                </>
              )}

              {/* ── STEP 2: GAMBAR ── */}
              {step === 1 && (
                <>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Gambar bikin menu menarik, tapi <b>boleh dilewati</b> 😉 Klik "Lanjut" untuk skip.</span>
                  </div>

                  <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50">
                    <button type="button" onClick={() => setImageMode('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${imageMode === 'upload' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
                      <Upload className="w-4 h-4" /> Upload dari HP/Laptop
                    </button>
                    <button type="button" onClick={() => setImageMode('url')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${imageMode === 'url' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
                      <LinkIcon className="w-4 h-4" /> Pakai link gambar
                    </button>
                  </div>

                  {imageMode === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                        dragging ? 'border-amber-500 bg-amber-50' : 'border-amber-200 bg-amber-50/50 hover:border-amber-400'}`}>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
                      <Upload className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Klik atau seret gambar ke sini</p>
                      <p className="text-xs text-gray-400 mt-1">JPG/PNG, maksimal 2MB — otomatis dikompres 👍</p>
                    </div>
                  ) : (
                    <div>
                      <input type="url" value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={e => update({ image: e.target.value })}
                        placeholder="https://contoh.com/foto-soto.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition" />
                      <Tip>Tempel link gambar dari internet.</Tip>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {imageError}
                    </div>
                  )}

                  {formData.image && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img src={formData.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Gambar siap dipakai!</p>
                        <p className="text-xs text-gray-500 mt-0.5">Beginilah tampilannya di kartu menu.</p>
                      </div>
                      <button type="button" onClick={() => { update({ image: '' }); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition" title="Hapus gambar">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── STEP 3: BAHAN & LANGKAH (MUDAH) ── */}
              {step === 2 && (
                <>
                  {/* Tombol AI */}
                  <button type="button" onClick={handleAiGenerate} disabled={aiLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {aiLoading ? (
                      <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> AI sedang memasak resep...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Isi Otomatis dengan AI (bahan + langkah + sejarah)</>
                    )}
                  </button>
                  <Tip>AI membuatkan bahan, langkah memasak, bumbu, dan sejarah berdasarkan nama menu. Hasilnya tetap bisa kamu edit!</Tip>

                  {/* BAHAN */}
                  <div>
                    <Label text="Bahan-bahan" optional />
                    <p className="text-xs text-gray-400 mb-2">Tap bahan cepat di bawah, atau ketik sendiri lalu tekan <b>Enter</b> / tombol <b>＋</b>:</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {COMMON_INGREDIENTS.map(c => (
                        <button type="button" key={c} onClick={() => addIngredient(c)}
                          className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition">
                          + {c}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={ingInput}
                        onChange={e => setIngInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(ingInput) } }}
                        onPaste={e => {
                          const text = e.clipboardData.getData('text')
                          if (text.includes('\n')) { e.preventDefault(); addIngredient(text) }
                        }}
                        placeholder="Ketik bahan, cth: 500g daging ayam"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition" />
                      <button type="button" onClick={() => addIngredient(ingInput)}
                        className="px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition" title="Tambah bahan">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {ingredientList.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {ingredientList.map((ing, i) => (
                          <li key={`${ing}-${i}`} className="flex items-center gap-2.5 bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2">
                            <span className="text-lg">{ingEmoji(ing)}</span>
                            <span className="flex-1 text-sm text-gray-700">{ing}</span>
                            <button type="button" onClick={() => removeIngredient(i)}
                              className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition" title="Hapus">
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs text-amber-600 font-semibold mt-2">🥬 {ingredientList.length} bahan terdaftar</p>
                  </div>

                  {/* LANGKAH */}
                  <div>
                    <Label text="Langkah Memasak" optional />
                    <p className="text-xs text-gray-400 mb-2">Tulis seperti bercerita — nomor urut otomatis. Sebutkan nama bahan di dalam langkah agar game bisa mendeteksinya.</p>

                    <div className="space-y-2.5">
                      {stepList.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">{i + 1}</span>
                          <textarea
                            value={s}
                            onChange={e => updateStep(i, e.target.value)}
                            rows={2}
                            placeholder={`Langkah ${i + 1}, cth: Rebus daging ayam dalam 1 liter air hingga matang`}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm resize-none" />
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0}
                              className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-30" title="Naik"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveStep(i, 1)} disabled={i === stepList.length - 1}
                              className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-30" title="Turun"><ChevronDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => removeStep(i)}
                              className="p-1 text-red-400 hover:text-red-600" title="Hapus"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={addStep}
                      className="mt-3 w-full py-2.5 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah Langkah {stepList.length + 1}
                    </button>
                  </div>

                  {/* BUMBU */}
                  <div>
                    <Label text="Bumbu & Rempah" optional />
                    <textarea value={formData.spices} onChange={e => update({ spices: e.target.value })} rows={2}
                      placeholder={'Satu per baris, cth:\nKetumbar\nJintan'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition text-sm" />
                  </div>
                </>
              )}

              {/* ── STEP 4: SEJARAH & CERITA ── */}
              {step === 3 && (
                <>
                  <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700">
                    <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Ceritakan kisah makanan ini — tampil di halaman detail & <b>Dapur Akulturasi</b>. Kalau bingung, pakai tombol AI di langkah 3 ✨</span>
                  </div>

                  <div>
                    <Label text="Sejarah / Cerita Menu" optional />
                    <textarea value={formData.history} onChange={e => update({ history: e.target.value })} rows={4}
                      placeholder={'Contoh:\nSoto Medan lahir dari akulturasi budaya Melayu, Tionghoa, dan India di pelabuhan Medan pada awal abad ke-20...'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none" />
                    <Tip>2-3 kalimat saja cukup: dari mana asalnya, pengaruh budaya apa, dan kenapa jadi ikon Medan.</Tip>
                  </div>

                  <div>
                    <Label text="Perjalanan / Jejak Akulturasi" optional />
                    <textarea value={formData.journey} onChange={e => update({ journey: e.target.value })} rows={3}
                      placeholder="Bagaimana resep ini berpindah & berbaur antar budaya..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none" />
                  </div>

                  <div>
                    <Label text="Nilai Gizi" optional />
                    <textarea value={formData.nutrition} onChange={e => update({ nutrition: e.target.value })} rows={2}
                      placeholder={'Kalori: 350 kkal\nProtein: 20g'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none" />
                  </div>

                  {/* Ringkasan */}
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4">
                    <p className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2"><Leaf className="w-4 h-4" /> Cek dulu sebelum disimpan:</p>
                    <div className="flex gap-3 bg-white rounded-xl p-3 border border-amber-100">
                      {formData.image ? (
                        <img src={formData.image} alt="" className="w-16 h-16 rounded-lg object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center"><ImageIcon className="w-6 h-6 text-amber-400" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{formData.name || '(belum ada nama)'}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{formData.description}</p>
                        <p className="text-xs mt-1 text-amber-600 font-semibold">
                          {getCategory(formData.category)?.emoji} {formData.category} • Rp {(formData.price || 0).toLocaleString('id-ID')}
                          {formData.is_popular && ' • ⭐ Populer'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      🥬 {ingredientList.length} bahan • 🔥 {stepList.filter(s => s.trim()).length} langkah • 📖 Sejarah: {formData.history.trim() ? 'ada ✅' : 'belum ❌'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-8 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                className="flex items-center gap-1 px-4 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition shadow">
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:shadow-lg transition disabled:opacity-50">
                  {saving ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Simpan Menu</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}