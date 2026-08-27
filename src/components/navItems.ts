import { Home, UtensilsCrossed, Search, MessageCircle, Map, ChefHat, Gamepad2, User } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, end: false },
  { to: '/search', label: 'Cari', icon: Search, end: false },
  { to: '/chat', label: 'Chat', icon: MessageCircle, end: false },
  { to: '/map', label: 'Peta Kuliner', icon: Map, end: false },
  { to: '/akulturasi', label: 'Dapur Akulturasi', icon: ChefHat, end: false },
  { to: '/game', label: 'Game Bhinneka-Rasa', icon: Gamepad2, end: false },
  { to: '/profile', label: 'Profil', icon: User, end: false },
]