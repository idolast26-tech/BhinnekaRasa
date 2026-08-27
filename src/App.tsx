import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import SplashScreen from './components/SplashScreen'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'
import MobileDrawer from './components/MobileDrawer'
import AdminLayout from './layouts/AdminLayout'

import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import ChatPage from './pages/ChatPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import PersonalityQuiz from './features/quiz/PersonalityQuiz'
import MainQuiz from './features/quiz/MainQuiz'
import FoodDetail from './features/food/FoodDetail'
import FoodMap from './features/map/FoodMap'
import DapurAkulturasi from './features/akulturasi/DapurAkulturasi'
import BhinnekaRasaGame from './features/game/BhinnekaRasaGame'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageMenu from './pages/admin/ManageMenu'
import ManagePersonalityQuiz from './pages/admin/ManagePersonalityQuiz'
import ManageMainQuiz from './pages/admin/ManageMainQuiz'
import ManageRestaurants from './pages/admin/ManageRestaurants' 

// Layout user: sidebar di desktop, bottom nav + drawer di mobile
function UserLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Tutup drawer otomatis saat pindah halaman
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header onOpenMenu={() => setDrawerOpen(true)} />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto py-4 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <Routes>
      {/* Full screen */}
      <Route path="/map" element={<FoodMap />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/food/:id" element={<FoodDetail />} />
        <Route path="/akulturasi" element={<DapurAkulturasi />} />
        <Route path="/game" element={<BhinnekaRasaGame />} />
        <Route path="/quiz/main" element={<MainQuiz />} />
        <Route path="/quiz/personality" element={<PersonalityQuiz />} />
        <Route path="/quiz/:id" element={<Navigate to="/quiz/main" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="menu" element={<ManageMenu />} />
        <Route path="personality-quiz" element={<ManagePersonalityQuiz />} />
        <Route path="main-quiz" element={<ManageMainQuiz />} />
        <Route path="restaurants" element={<ManageRestaurants />} /> {/* <-- BARU: Route Manage Restaurants */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App