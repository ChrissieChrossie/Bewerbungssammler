import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import Card from '../components/Card'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Es gibt aktuell kein echtes Multi-User-Login/Backend dafür – der Login
    // dient nur als UI-Einstiegspunkt ins Dashboard.
    setSubmitting(true)
    setTimeout(() => navigate('/dashboard'), 400)
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
            <FormInput
              label="Passwort"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

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
