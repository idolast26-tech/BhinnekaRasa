import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminFetch } from '../../services/adminApi'
import { 
  MapPin, Phone, Globe, Star, Clock, DollarSign,
  Plus, Edit2, Trash2, X, Save, Search, ChevronLeft,
  ExternalLink, Image as ImageIcon, UtensilsCrossed,
  Building2, Navigation, Info, Hash
} from 'lucide-react'
import API_BASE_URL from '../../config/api'

interface Restaurant {
  id: number
  google_place_id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string
  website: string
  rating: number
  total_reviews: number
  price_level: string
  opening_hours: string
  photos: string
  dish_id: number
  dish_name: string
  dish_history: string
  dish_ingredients: string
  dish_nutrition: string
}

export default function RestaurantManagement() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'menu'>('basic')

  const [formData, setFormData] = useState({
    google_place_id: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    website: '',
    rating: '',
    total_reviews: '',
    price_level: '',
    opening_hours: '',
    photos: '',
    dish_id: '',
    dish_name: '',
    dish_history: '',
    dish_ingredients: '',
    dish_nutrition: ''
  })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/restaurants`)
      const data = await res.json()
      if (data.success) {
        setRestaurants(data.data)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRestaurant 
        ? `${API_BASE_URL}/admin/restaurants/${editingRestaurant.id}`
        : `${API_BASE_URL}/admin/restaurants`
      
      const method = editingRestaurant ? 'PUT' : 'POST'
      
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
          rating: parseFloat(formData.rating) || 0,
          total_reviews: parseInt(formData.total_reviews) || 0,
          dish_id: parseInt(formData.dish_id) || null
        })
      })
      
      const data = await res.json()
      if (data.success) {
        await fetchRestaurants()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving restaurant:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) return
    
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/restaurants/${id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      if (data.success) {
        await fetchRestaurants()
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert('Gagal menghapus data')
    }
  }

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setFormData({
      google_place_id: restaurant.google_place_id || '',
      name: restaurant.name,
      address: restaurant.address || '',
      latitude: restaurant.latitude?.toString() || '',
      longitude: restaurant.longitude?.toString() || '',
      phone: restaurant.phone || '',
      website: restaurant.website || '',
      rating: restaurant.rating?.toString() || '',
      total_reviews: restaurant.total_reviews?.toString() || '',
      price_level: restaurant.price_level || '',
      opening_hours: restaurant.opening_hours || '',
      photos: restaurant.photos || '',
      dish_id: restaurant.dish_id?.toString() || '',
      dish_name: restaurant.dish_name || '',
      dish_history: restaurant.dish_history || '',
      dish_ingredients: restaurant.dish_ingredients || '',
      dish_nutrition: restaurant.dish_nutrition || ''
    })
    setActiveTab('basic')
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      google_place_id: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      website: '',
      rating: '',
      total_reviews: '',
      price_level: '',
      opening_hours: '',
      photos: '',
      dish_id: '',
      dish_name: '',
      dish_history: '',
      dish_ingredients: '',
      dish_nutrition: ''
    })
    setEditingRestaurant(null)
    setActiveTab('basic')
  }

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriceLevelLabel = (priceLevel: string) => {
    const levels: { [key: string]: string } = {
      '$': 'Murah',
      '$$': 'Menengah',
      '$$$': 'Mahal',
      '$$$$': 'Sangat Mahal'
    }
    return levels[priceLevel] || priceLevel
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data lokasi...</p>
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
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-200">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Kelola Lokasi Restoran</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Kelola data lokasi dan informasi restoran</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Lokasi
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau alamat restoran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredRestaurants.length}</p>
                <p className="text-sm text-gray-500">Total Restoran</p>
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
                  {filteredRestaurants.filter(r => r.rating >= 4.5).length}
                </p>
                <p className="text-sm text-gray-500">Rating Tinggi (4.5+)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredRestaurants.filter(r => r.latitude && r.longitude).length}
                </p>
                <p className="text-sm text-gray-500">Dengan Koordinat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
              {/* Card Header with Image Placeholder */}
              <div className="h-32 bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{restaurant.name}</h3>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-white rounded-lg transition-colors shadow-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-red-50 rounded-lg transition-colors shadow-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  <span className="line-clamp-2">{restaurant.address || 'Alamat tidak tersedia'}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {restaurant.rating > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200">
                      <Star className="w-3.5 h-3.5 fill-yellow-500" />
                      {restaurant.rating}
                    </span>
                  )}
                  
                  {restaurant.price_level && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                      <DollarSign className="w-3.5 h-3.5" />
                      {getPriceLevelLabel(restaurant.price_level)}
                    </span>
                  )}

                  {restaurant.dish_name && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      {restaurant.dish_name}
                    </span>
                  )}
                </div>

                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.opening_hours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{restaurant.opening_hours}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                  {restaurant.website && (
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  
                  {(restaurant.latitude && restaurant.longitude) && (
                    <a
                      href={`https://www.google.com/maps/place/?q=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
                    >
                      <Navigation className="w-4 h-4" />
                      Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada data lokasi restoran</h3>
            <p className="text-gray-500 mb-6">Klik tombol "Tambah Lokasi" untuk menambahkan restoran pertama</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Lokasi
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingRestaurant ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
                  </h2>
                  <p className="text-sm text-gray-500">Lengkapi informasi restoran di bawah ini</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'basic'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  Informasi Dasar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'contact'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Kontak & Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'menu'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Menu & Foto
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Tab: Informasi Dasar */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Restoran <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Contoh: Rumah Makan Padang Sederhana"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Google Place ID
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="google_place_id"
                          value={formData.google_place_id}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat Lengkap
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Jl. Contoh No. 123, Kecamatan, Kota, Provinsi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Latitude
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="-6.2088"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Longitude
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="106.8456"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Kontak & Info */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="+62 21 1234567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rating (0-5)
                      </label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          name="rating"
                          value={formData.rating}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="4.5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Reviews
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="total_reviews"
                        value={formData.total_reviews}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Level Harga
                      </label>
                      <select
                        name="price_level"
                        value={formData.price_level}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Pilih Level Harga</option>
                        <option value="$">($) - Murah</option>
                        <option value="$$">($$) - Menengah</option>
                        <option value="$$$">($$$) - Mahal</option>
                        <option value="$$$$">($$$$) - Sangat Mahal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jam Operasional
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="opening_hours"
                          value={formData.opening_hours}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Senin-Minggu: 10:00-22:00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Menu & Foto */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Foto Restoran (URL)
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="photos"
                          value={formData.photos}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="https://example.com/foto-restoran.jpg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dish ID
                      </label>
                      <input
                        type="number"
                        name="dish_id"
                        value={formData.dish_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Menu Andalan
                      </label>
                      <div className="relative">
                        <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="dish_name"
                          value={formData.dish_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Nasi Goreng Spesial"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sejarah Menu
                      </label>
                      <textarea
                        name="dish_history"
                        value={formData.dish_history}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Ceritakan sejarah atau keunikan menu andalan..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bahan-bahan
                      </label>
                      <textarea
                        name="dish_ingredients"
                        value={formData.dish_ingredients}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Nasi, ayam, telur, sayuran, bumbu spesial..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Informasi Nutrisi
                      </label>
                      <textarea
                        name="dish_nutrition"
                        value={formData.dish_nutrition}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Kalori: 500 kkal, Protein: 20g, Karbohidrat: 60g..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-200 transition-all"
                >
                  <Save className="w-5 h-5" />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}