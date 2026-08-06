import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function validate(formData) {
  const errors = {}

  if (!formData.name.trim()) {
    errors.name = 'Bitte gib deinen Namen ein.'
  }
  if (!formData.email.trim()) {
    errors.email = 'Bitte gib deine E-Mail-Adresse ein.'
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    errors.email = 'Das sieht nicht nach einer gültigen E-Mail-Adresse aus.'
  }
  if (!formData.password) {
    errors.password = 'Bitte gib ein Passwort ein.'
  } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`
  }
  if (formData.password && formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Die Passwörter stimmen nicht überein.'
  }

  return errors
}

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '' })
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(formData)

  const updateField = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const markTouched = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, passwordConfirm: true })
    setFormError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitting(true)
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password_confirm: formData.passwordConfirm
    })
    setSubmitting(false)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setFormError(result.message)
    }
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

          {formError && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Name"
              value={formData.name}
              onChange={updateField('name')}
              onBlur={markTouched('name')}
              error={touched.name ? errors.name : undefined}
              placeholder="Max Mustermann"
              required
              autoComplete="name"
            />
            <FormInput
              label="E-Mail"
              type="email"
              value={formData.email}
              onChange={updateField('email')}
              onBlur={markTouched('email')}
              error={touched.email ? errors.email : undefined}
              placeholder="du@beispiel.de"
              required
              autoComplete="email"
            />
            <PasswordInput
              value={formData.password}
              onChange={updateField('password')}
              onBlur={markTouched('password')}
              error={touched.password ? errors.password : undefined}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <PasswordInput
              label="Passwort bestätigen"
              value={formData.passwordConfirm}
              onChange={updateField('passwordConfirm')}
              onBlur={markTouched('passwordConfirm')}
              error={touched.passwordConfirm ? errors.passwordConfirm : undefined}
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
