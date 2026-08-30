import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, X, Search, ChefHat, Star,
  Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle, Check,
  Leaf, Info, Sparkles, UtensilsCrossed, Hash, Building2,
  ChevronUp, ChevronDown, Tag, DollarSign, Clock, MapPin, FileText
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
type TabType = 'basic' | 'image' | 'recipe'

const LIST_FORMAT: 'json' | 'lines' = 'json'

const CATEGORIES = [
  { value: 'Sup', emoji: '🍲', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Tradisional', emoji: '🍛', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Makanan Penutup', emoji: '🍰', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'Mie', emoji: '🍜', color: 'bg-orange-50 text-orange-700 border-orange-200' },
]

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
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      {text} 
      {required && <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">WAJIB</span>}
      {optional && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">Opsional</span>}
    </label>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5 bg-blue-50/50 p-2 rounded-lg border border-blue-100"><Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" /><span>{children}</span></p>
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ManageMenu() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [imageMode, setImageMode] = useState<ImageMode>('url')
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [ingredientList, setIngredientList] = useState<string[]>([])
  const [ingInput, setIngInput] = useState('')
  const [stepList, setStepList] = useState<string[]>([])

  useEffect(() => { fetchDishes() }, [])
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) }
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

  const handleAiGenerate = async () => {
    if (!formData.name.trim()) { setActiveTab('basic'); notify('error', 'Isi nama menu dulu ya, biar AI tahu mau buat apa 😊'); return }
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
        if (typeof d.journey === 'string' && d.journey) update({ journey: d.journey })
        notify('success', 'Resep & sejarah dibuat AI! Silakan cek dan edit ✨')
      } else {
        notify('error', data.message || 'AI gagal membuat resep')
      }
    } catch {
      notify('error', 'Fitur AI belum tersedia di backend')
    } finally {
      setAiLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingDish(null); setFormData(EMPTY_FORM); setActiveTab('basic')
    setImageMode('url'); setImageError(null)
    setIngredientList([]); setStepList([]); setIngInput('')
    setShowModal(true)
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
    setIngInput(''); setImageError(null)
    setActiveTab('basic')
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM); setEditingDish(null); setActiveTab('basic')
    setImageMode('url'); setImageError(null)
    setIngredientList([]); setStepList([]); setIngInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    if (!formData.name.trim()) { notify('error', 'Nama menu wajib diisi'); return }
    
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
        await fetchDishes()
        setShowModal(false)
        resetForm()
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
      if (data.success) { notify('success', 'Menu berhasil dihapus!'); await fetchDishes() }
      else notify('error', data.message || 'Gagal menghapus')
    } catch { notify('error', 'Gagal menghapus menu!') }
  }

  const filteredDishes = dishes.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategory = (cat: string) => CATEGORIES.find(c => c.value === cat)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">Menyiapkan dapur...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin')}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-200/50">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Kelola Menu Restoran</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Atur hidangan, resep, dan cerita di balik makanan</p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-2xl font-semibold hover:shadow-xl hover:shadow-amber-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu Baru
            </button>
          </div>
        </div>

        {/* Search & Stats Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari nama atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{filteredDishes.length}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Menu</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-50 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredDishes.filter(d => d.is_popular === 1).length}
                  </p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Menu Populer</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(filteredDishes.map(d => d.category)).size}
                  </p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kategori</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300">
              {/* Card Header */}
              <div className="h-40 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 relative overflow-hidden">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-overlay opacity-90" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <ChefHat className="w-20 h-20 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => openEditForm(dish)} className="p-2 bg-white/95 backdrop-blur hover:bg-white rounded-xl transition-colors shadow-lg text-gray-700 hover:text-amber-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(dish.id, dish.name)} className="p-2 bg-white/95 backdrop-blur hover:bg-red-50 rounded-xl transition-colors shadow-lg text-gray-700 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">{dish.name}</h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{dish.description || 'Tidak ada deskripsi'}</p>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${getCategory(dish.category)?.color || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {getCategory(dish.category)?.emoji} {dish.category}
                  </span>
                  
                  {dish.is_popular === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> Populer
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">
                    <DollarSign className="w-3.5 h-3.5" /> {(dish.price || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 pt-2 border-t border-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{toList(dish.cooking_steps).length} langkah memasak</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="bg-white/60 backdrop-blur rounded-3xl border border-dashed border-gray-300 p-16 text-center">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-12 h-12 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada menu yang cocok</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Mulai tambahkan hidangan pertama Anda untuk melengkapi daftar menu restoran.</p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu Pertama
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right fade-in duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl my-8 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl z-20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-md">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingDish ? 'Edit Menu' : 'Tambah Menu Baru'}
                  </h2>
                  <p className="text-sm text-gray-500">Lengkapi informasi hidangan di bawah ini</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 bg-gray-50/50">
              <div className="flex gap-2 p-1 bg-gray-100/80 rounded-2xl w-fit">
                {(['basic', 'image', 'recipe'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-white text-amber-700 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    {tab === 'basic' && <Info className="w-4 h-4" />}
                    {tab === 'image' && <ImageIcon className="w-4 h-4" />}
                    {tab === 'recipe' && <UtensilsCrossed className="w-4 h-4" />}
                    {tab === 'basic' && 'Informasi Dasar'}
                    {tab === 'image' && 'Gambar'}
                    {tab === 'recipe' && 'Resep & Cerita'}
                  </button>
                ))}
              </div
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Tab: Informasi Dasar */}
              {activeTab === 'basic' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Label text="Nama Menu" required />
                      <div className="relative">
                        <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => update({ name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          placeholder="Contoh: Soto Medan, Bika Ambon"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label text="Deskripsi Singkat" required />
                      <textarea
                        value={formData.description}
                        onChange={(e) => update({ description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                        placeholder="Jelaskan menu ini dalam 1-2 kalimat yang menggugah selera..."
                      />
                    </div>

                    <div>
                      <Label text="Kategori" required />
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.category}
                          onChange={(e) => update({ category: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <Label text="Harga (Rp)" optional />
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => update({ price: Number(e.target.value) })}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          placeholder="35000"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label text="Status Menu" optional />
                      <button 
                        type="button" 
                        onClick={() => update({ is_popular: !formData.is_popular })}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.is_popular ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${formData.is_popular ? 'bg-amber-200' : 'bg-gray-100'}`}>
                            <Star className={`w-5 h-5 ${formData.is_popular ? 'text-amber-700 fill-amber-700' : 'text-gray-400'}`} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">{formData.is_popular ? 'Menu Populer' : 'Menu Reguler'}</p>
                            <p className="text-xs text-gray-500">{formData.is_popular ? 'Akan ditampilkan dengan badge spesial' : 'Tampilan standar di daftar menu'}</p>
                          </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${formData.is_popular ? 'bg-amber-500' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${formData.is_popular ? 'left-6' : 'left-1'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Gambar */}
              {activeTab === 'image' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex rounded-2xl border border-gray-200 p-1.5 bg-gray-50 w-fit">
                    <button type="button" onClick={() => setImageMode('upload')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${imageMode === 'upload' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Upload className="w-4 h-4" /> Upload File
                    </button>
                    <button type="button" onClick={() => setImageMode('url')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${imageMode === 'url' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <LinkIcon className="w-4 h-4" /> Pakai Link URL
                    </button>
                  </div>

                  {imageMode === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
                      className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${
                        dragging ? 'border-amber-500 bg-amber-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/30'}`}>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-amber-600" />
                      </div>
                      <p className="text-base font-bold text-gray-800">Klik atau seret gambar ke sini</p>
                      <p className="text-sm text-gray-500 mt-2">Format JPG/PNG, maksimal 2MB — otomatis dikompres agar ringan</p>
                    </div>
                  ) : (
                    <div>
                      <Label text="URL Gambar" optional />
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="url" 
                          value={formData.image.startsWith('data:') ? '' : formData.image}
                          onChange={e => update({ image: e.target.value })}
                          placeholder="https://contoh.com/foto-makanan.jpg"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" 
                        />
                      </div>
                      <Tip>Tempel link gambar langsung dari internet (Unsplash, dll).</Tip>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" /> {imageError}
                    </div>
                  )}

                  {formData.image && (
                    <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-24 h-24 rounded-xl object-cover shadow-sm" onError={e => { e.currentTarget.style.display = 'none' }} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Check className="w-4 h-4" /> Gambar berhasil dimuat!</p>
                        <p className="text-xs text-gray-500 mt-1">Beginilah tampilannya di kartu menu.</p>
                      </div>
                      <button type="button" onClick={() => { update({ image: '' }); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="p-2.5 hover:bg-red-100 text-red-500 rounded-xl transition-colors" title="Hapus gambar">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Resep & Cerita */}
              {activeTab === 'recipe' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* AI Button */}
                  <button type="button" onClick={handleAiGenerate} disabled={aiLoading}
                    className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    {aiLoading ? (
                      <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> AI sedang meracik resep...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 animate-pulse" /> Isi Otomatis dengan AI (Bahan + Langkah + Sejarah)</>
                    )}
                  </button>

                  {/* Bahan */}
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <Label text="Bahan-bahan" optional />
                    <p className="text-xs text-gray-500 mb-3">Klik bahan di bawah untuk menambahkan, atau ketik manual lalu tekan Enter.</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {COMMON_INGREDIENTS.map(c => (
                        <button type="button" key={c} onClick={() => addIngredient(c)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm">
                          + {c}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={ingInput}
                        onChange={e => setIngInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(ingInput) } }}
                        placeholder="Ketik bahan, cth: 500g daging ayam"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                      <button type="button" onClick={() => addIngredient(ingInput)}
                        className="px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {ingredientList.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {ingredientList.map((ing, i) => (
                          <li key={`${ing}-${i}`} className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-amber-300 hover:shadow-sm transition-all">
                            <span className="text-xl">{ingEmoji(ing)}</span>
                            <span className="flex-1 text-sm font-medium text-gray-700">{ing}</span>
                            <button type="button" onClick={() => removeIngredient(i)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Langkah */}
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <Label text="Langkah Memasak" optional />
                    <div className="space-y-3">
                      {stepList.map((s, i) => (
                        <div key={i} className="group flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-200 hover:border-amber-300 transition-all">
                          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <textarea
                            value={s}
                            onChange={e => updateStep(i, e.target.value)}
                            rows={2}
                            placeholder={`Deskripsikan langkah ke-${i + 1}...`}
                            className="flex-1 px-2 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm resize-none bg-transparent" />
                          <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveStep(i, 1)} disabled={i === stepList.length - 1} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => removeStep(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addStep}
                      className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah Langkah Baru
                    </button>
                  </div>

                  {/* Cerita, Akulturasi, Bumbu, & Nutrisi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-2">
                      <Label text="Sejarah / Cerita Menu" optional />
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                          value={formData.history} 
                          onChange={e => update({ history: e.target.value })} 
                          rows={3}
                          placeholder="Ceritakan kisah unik di balik makanan ini..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none" 
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label text="Perjalanan / Jejak Akulturasi" optional />
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                          value={formData.journey} 
                          onChange={e => update({ journey: e.target.value })} 
                          rows={3}
                          placeholder="Bagaimana resep ini berpindah & berbaur antar budaya..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none" 
                        />
                      </div>
                      <Tip>Ceritakan bagaimana menu ini menyebar dan beradaptasi dengan budaya lokal.</Tip>
                    </div>

                    <div className="space-y-2">
                      <Label text="Bumbu & Rempah" optional />
                      <textarea 
                        value={formData.spices} 
                        onChange={e => update({ spices: e.target.value })} 
                        rows={4}
                        placeholder="Satu per baris, cth:&#10;Ketumbar&#10;Jintan"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label text="Nilai Gizi" optional />
                      <textarea 
                        value={formData.nutrition} 
                        onChange={e => update({ nutrition: e.target.value })} 
                        rows={4}
                        placeholder="Kalori: 350 kkal&#10;Protein: 20g"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none" 
                      />
                    </div
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur-xl rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-amber-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Menyimpan Data...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Simpan Menu</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
