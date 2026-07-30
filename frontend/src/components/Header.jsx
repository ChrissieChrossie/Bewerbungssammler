import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-11 h-11 bg-white/10 backdrop-blur border border-white/20 rounded-xl shadow-glow">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Bewerbungssammler
              </h1>
              <p className="text-sm text-violet-200">Dein digitales Bewerbungs-Management</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
