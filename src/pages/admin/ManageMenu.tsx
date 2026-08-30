import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, X, Search, ChefHat, Star,
  Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle, Check,
  Leaf, Info, Sparkles, UtensilsCrossed, Hash, Building2
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
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {text} {required && <span className="text-red-500">*</span>} {optional && <span className="text-gray-400 font-normal text-xs">(Opsional)</span>}
    </label>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1"><span>💡</span><span>{children}</span></p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin')}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Kelola Menu Restoran</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Kelola data menu, resep, dan informasi hidangan</p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau kategori menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredDishes.length}</p>
                <p className="text-sm text-gray-500">Total Menu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredDishes.filter(d => d.is_popular === 1).length}
                </p>
                <p className="text-sm text-gray-500">Menu Populer</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(filteredDishes.map(d => d.category)).size}
                </p>
                <p className="text-sm text-gray-500">Kategori Unik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
              {/* Card Header */}
              <div className="h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <ChefHat className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{dish.name}</h3>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(dish)}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-white rounded-lg transition-colors shadow-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id, dish.name)}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-red-50 rounded-lg transition-colors shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{dish.description || 'Tidak ada deskripsi'}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium border ${getCategory(dish.category)?.color || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {getCategory(dish.category)?.emoji} {dish.category}
                  </span>
                  
                  {dish.is_popular === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200">
                      <Star className="w-3.5 h-3.5 fill-yellow-500" /> Populer
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                    Rp {(dish.price || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                  <UtensilsCrossed className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{toList(dish.cooking_steps).length} langkah memasak</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                  <button 
                    onClick={() => openEditForm(dish)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors text-sm font-semibold"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Menu
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id, dish.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada data menu</h3>
            <p className="text-gray-500 mb-6">Klik tombol "Tambah Menu" untuk menambahkan hidangan pertama</p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingDish ? 'Edit Menu' : 'Tambah Menu Baru'}
                  </h2>
                  <p className="text-sm text-gray-500">Lengkapi informasi hidangan di bawah ini</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6 bg-gray-50/50">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'basic'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  Informasi Dasar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'image'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Gambar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('recipe')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'recipe'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Resep & Cerita
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Tab: Informasi Dasar */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label text="Nama Menu" required />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => update({ name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Contoh: Soto Medan, Bika Ambon"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label text="Deskripsi Singkat" required />
                      <textarea
                        value={formData.description}
                        onChange={(e) => update({ description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="Jelaskan menu ini dalam 1-2 kalimat..."
                      />
                    </div>

                    <div>
                      <Label text="Kategori" required />
                      <select
                        value={formData.category}
                        onChange={(e) => update({ category: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label text="Harga (Rp)" optional />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => update({ price: Number(e.target.value) })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="35000"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label text="Status" optional />
                      <button 
                        type="button" 
                        onClick={() => update({ is_popular: !formData.is_popular })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                          formData.is_popular ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Star className={`w-4 h-4 ${formData.is_popular ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          {formData.is_popular ? 'Ya, tampilkan sebagai menu populer' : 'Tidak, menu reguler'}
                        </span>
                        <span className={`w-11 h-6 rounded-full relative transition ${formData.is_popular ? 'bg-amber-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.is_popular ? 'left-[22px]' : 'left-0.5'}`} />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Gambar */}
              {activeTab === 'image' && (
                <div className="space-y-4">
                  <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50 w-fit">
                    <button type="button" onClick={() => setImageMode('upload')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'upload' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
                      <Upload className="w-4 h-4" /> Upload File
                    </button>
                    <button type="button" onClick={() => setImageMode('url')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'url' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
                      <LinkIcon className="w-4 h-4" /> Pakai Link URL
                    </button>
                  </div>

                  {imageMode === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                        dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-amber-400'}`}>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Klik atau seret gambar ke sini</p>
                      <p className="text-xs text-gray-500 mt-1">JPG/PNG, maksimal 2MB — otomatis dikompres</p>
                    </div>
                  ) : (
                    <div>
                      <Label text="URL Gambar" optional />
                      <input 
                        type="url" 
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={e => update({ image: e.target.value })}
                        placeholder="https://contoh.com/foto-makanan.jpg"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      />
                      <Tip>Tempel link gambar dari internet.</Tip>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {imageError}
                    </div>
                  )}

                  {formData.image && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-20 h-20 rounded-xl object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
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
                </div>
              )}

              {/* Tab: Resep & Cerita */}
              {activeTab === 'recipe' && (
                <div className="space-y-6">
                  {/* AI Button */}
                  <button type="button" onClick={handleAiGenerate} disabled={aiLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {aiLoading ? (
                      <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> AI sedang memasak resep...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Isi Otomatis dengan AI (Bahan + Langkah + Sejarah)</>
                    )}
                  </button>

                  {/* Bahan */}
                  <div>
                    <Label text="Bahan-bahan" optional />
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
                        placeholder="Ketik bahan, cth: 500g daging ayam"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                      <button type="button" onClick={() => addIngredient(ingInput)}
                        className="px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {ingredientList.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {ingredientList.map((ing, i) => (
                          <li key={`${ing}-${i}`} className="flex items-center gap-2.5 bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2">
                            <span className="text-lg">{ingEmoji(ing)}</span>
                            <span className="flex-1 text-sm text-gray-700">{ing}</span>
                            <button type="button" onClick={() => removeIngredient(i)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition">
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Langkah */}
                  <div>
                    <Label text="Langkah Memasak" optional />
                    <div className="space-y-2.5">
                      {stepList.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">{i + 1}</span>
                          <textarea
                            value={s}
                            onChange={e => updateStep(i, e.target.value)}
                            rows={2}
                            placeholder={`Langkah ${i + 1}...`}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none" />
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveStep(i, 1)} disabled={i === stepList.length - 1} className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => removeStep(i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addStep}
                      className="mt-3 w-full py-2.5 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah Langkah
                    </button>
                  </div>

                  {/* Sejarah & Nutrisi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label text="Sejarah / Cerita Menu" optional />
                      <textarea 
                        value={formData.history} 
                        onChange={e => update({ history: e.target.value })} 
                        rows={3}
                        placeholder="Ceritakan kisah makanan ini..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label text="Nilai Gizi" optional />
                      <textarea 
                        value={formData.nutrition} 
                        onChange={e => update({ nutrition: e.target.value })} 
                        rows={2}
                        placeholder="Kalori: 350 kkal, Protein: 20g..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-200 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Simpan Data</>
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
