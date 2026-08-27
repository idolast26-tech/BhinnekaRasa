import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="m-4 rounded-3xl overflow-hidden shadow-2xl relative group">
      <div className="relative h-80">
        <img
          src="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80"
          alt="Nasi Kuning Medan"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white">
          <div className="inline-block px-4 py-1 bg-orange-500 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            Kuliner Tradisional
          </div>
          <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">SELAMAT DATANG!</h2>
          <p className="text-lg mb-6 opacity-95 max-w-md mx-auto">
            Jelajahi kekayaan kuliner dan akulturasi budaya Medan
          </p>
          <button
            onClick={() => navigate('/map')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none px-10 py-4 rounded-full text-base font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95"
          >
            🗺️ Jelajahi Peta Kuliner
          </button>
        </div>
      </div>
    </section>
  )
}