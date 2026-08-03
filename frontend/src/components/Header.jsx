import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

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

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-violet-100">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-violet-100 border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
