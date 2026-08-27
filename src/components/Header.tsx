import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import logo from '../assets/LogoKuliner.png'

interface HeaderProps {
  onOpenMenu?: () => void
}

export default function Header({ onOpenMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo + Judul */}
        <Link to="/" className="flex items-center gap-2.5 md:gap-3 min-w-0">
          <img
            src={logo}
            alt="Logo Bhinneka Rasa"
            className="h-9 w-auto md:h-11 object-contain drop-shadow-sm select-none"
            draggable={false}
          />
          <span className="font-extrabold text-orange-600 text-base md:text-xl tracking-tight truncate">
            Bhinneka Rasa
          </span>
        </Link>

        {/* Kanan: avatar (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-semibold text-white hover:bg-orange-600 transition"
          >
            U
          </Link>

          <button
            onClick={onOpenMenu}
            className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-orange-50 active:scale-95 transition"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}