import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import Card from '../components/Card'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    setError(null)
    // Kein echtes Multi-User-Backend vorhanden – Registrierung dient nur als
    // UI-Einstiegspunkt ins Dashboard.
    setSubmitting(true)
    setTimeout(() => navigate('/dashboard'), 400)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 px-4 py-12">
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
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">Konto erstellen</h1>
          <p className="text-gray-600 text-sm mb-6">Kostenlos, in unter zwei Minuten startklar.</p>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />
            <FormInput
              label="E-Mail"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="du@beispiel.de"
              required
              autoComplete="email"
            />
            <FormInput
              label="Passwort"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <FormInput
              label="Passwort bestätigen"
              type="password"
              value={formData.passwordConfirm}
              onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={submitting}>
              {submitting ? 'Konto wird erstellt …' : 'Registrieren'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Schon ein Konto?{' '}
            <Link to="/login" className="font-medium text-violet-700 hover:underline">
              Anmelden
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
