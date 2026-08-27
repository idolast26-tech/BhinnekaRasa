import { NavLink } from 'react-router-dom'
import { Home, UtensilsCrossed, Search, MessageCircle, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, end: false },
  { to: '/search', label: 'Cari', icon: Search, end: false },
  { to: '/chat', label: 'Chat', icon: MessageCircle, end: false },
  { to: '/profile', label: 'Profil', icon: User, end: false },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-orange-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[11px] ${
                isActive ? 'text-orange-600 font-semibold' : 'text-gray-500'
              }`
            }
          >
            <item.icon size={20} />
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}