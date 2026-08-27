import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, Save, User, Mail, Lock, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [username, setUsername] = useState(user?.username || user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // TODO: Di sini nanti tambahkan API call ke backend untuk update data user
    // Contoh: await updateProfile({ username, email, newPassword })
    
    setTimeout(() => {
      setIsSaving(false)
      alert('✅ Pengaturan berhasil disimpan!')
      navigate('/profile')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/profile')} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali ke Profil
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" /> Pengaturan Akun
            </h1>
            <p className="text-white/80 text-sm mt-1">Kelola informasi profil dan keamanan akun Anda</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" /> Nama Pengguna
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Masukkan nama pengguna"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" /> Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Masukkan email"
              />
            </div>

            {/* Password Baru (Opsional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" /> Kata Sandi Baru <span className="text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Perubahan pada email atau kata sandi akan mengharuskan Anda untuk login ulang demi keamanan akun.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}