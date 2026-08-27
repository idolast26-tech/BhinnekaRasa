import logo from '../assets/LogoKuliner.png'

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 animate-fade-in px-4">
      <div className="text-center animate-scale-in">
        {/* Logo — ukuran responsif & proporsional */}
        <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 mx-auto mb-6 md:mb-8 relative">
          {/* Efek glow di belakang logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>

          <img
            src={logo}
            alt="Logo Kuliner Medan"
            className="relative w-full h-full object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* Judul — ikut responsif */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-900 tracking-widest mb-2 md:mb-3 animate-slide-up drop-shadow-lg">
          BHINNEKA
        </h1>
        <p className="text-amber-700 tracking-[0.3em] text-xs md:text-sm font-semibold animate-slide-up-delayed uppercase">
          RASA
        </p>
      </div>
    </div>
  )
}