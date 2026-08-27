import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import logo from '../assets/LogoKuliner.png'

export default function DesktopSidebar() {
  return (
    <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-orange-100 bg-white/70 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 border-b border-orange-100 flex items-center gap-3">
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

      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
  )
}