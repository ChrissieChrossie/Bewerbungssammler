import { Link } from 'react-router-dom'
import Button from './Button'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Bewerbungssammler</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Hauptnavigation">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors">Preise</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors">Über uns</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors">
              Login
            </Link>
            <Button to="/signup" size="sm">Jetzt starten</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
