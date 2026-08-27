import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// 1. Tambahkan 'role' pada interface User
interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean // 2. Tambahkan properti isAdmin
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
import API_BASE_URL from '../config/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    const savedToken = localStorage.getItem('auth_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const result = await res.json()
      if (!result.success) return { success: false, message: result.message }

      // Pastikan backend mengirimkan data user yang sudah termasuk 'role'
      localStorage.setItem('auth_token', result.token)
      localStorage.setItem('auth_user', JSON.stringify(result.user))
      setUser(result.user)
      return { success: true }
    } catch {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  async function register(username: string, email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const result = await res.json()
      if (!result.success) return { success: false, message: result.message }

      localStorage.setItem('auth_token', result.token)
      localStorage.setItem('auth_user', JSON.stringify(result.user))
      setUser(result.user)
      return { success: true }
    } catch {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  // 3. Cek apakah user yang login memiliki role 'admin'
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin, // 4. Masukkan isAdmin ke dalam value
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}