import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import logo from '../assets/LogoKuliner.png'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-orange-100">
          <div className="flex items-center gap-3">
            {/* LOGO BARU */}
            <img
              src={logo}
              alt="Logo Bhinneka Rasa"
              className="w-10 h-10 object-contain"
              draggable={false}
            />
            <div>
              <p className="font-bold text-orange-600">Bhinneka Rasa</p>
              <p className="text-xs text-gray-500">Jelajahi Cita Rasa Indonesia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-orange-50" aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-orange-500 text-white shadow' : 'text-gray-700 hover:bg-orange-50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}