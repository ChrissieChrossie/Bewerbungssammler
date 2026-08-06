import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await login({ email, password, remember_me: rememberMe })

    setSubmitting(false)
    if (result.success) {
      navigate(redirectTo, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 px-4">
      <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur border border-white/20 rounded-xl">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-white text-lg">Bewerbungssammler</span>
        </Link>

        <Card className="shadow-2xl">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">Willkommen zurück</h1>
          <p className="text-gray-600 text-sm mb-6">Melde dich an, um dein Dashboard zu öffnen.</p>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="E-Mail"
              type="email"
              placeholder="du@beispiel.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Angemeldet bleiben
            </label>

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={submitting}>
              {submitting ? 'Anmelden …' : 'Anmelden'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Noch kein Konto?{' '}
            <Link to="/signup" className="font-medium text-violet-700 hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
