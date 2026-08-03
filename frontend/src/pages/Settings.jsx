import { useState } from 'react'
import PasswordInput from '../components/PasswordInput'
import Card from '../components/Card'
import SuccessMessage from '../components/SuccessMessage'
import { useAuth } from '../context/AuthContext'

const MIN_PASSWORD_LENGTH = 8

const EMPTY_FORM = { currentPassword: '', newPassword: '', newPasswordConfirm: '' }

export default function Settings() {
  const { user, changePassword } = useAuth()
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`)
      return
    }
    if (formData.newPassword !== formData.newPasswordConfirm) {
      setError('Neues Passwort und Wiederholung stimmen nicht überein.')
      return
    }
    if (formData.newPassword === formData.currentPassword) {
      setError('Das neue Passwort darf nicht mit dem aktuellen übereinstimmen.')
      return
    }

    setSubmitting(true)
    const result = await changePassword({
      current_password: formData.currentPassword,
      new_password: formData.newPassword,
      new_password_confirm: formData.newPasswordConfirm
    })
    setSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setFormData(EMPTY_FORM)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">Einstellungen</h1>
      <p className="text-gray-600 text-sm mb-6">Angemeldet als {user?.email}</p>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Passwort ändern</h2>

        {success && <SuccessMessage message="Dein Passwort wurde geändert." />}
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="Aktuelles Passwort"
            value={formData.currentPassword}
            onChange={updateField('currentPassword')}
            required
            autoComplete="current-password"
          />
          <PasswordInput
            label="Neues Passwort"
            value={formData.newPassword}
            onChange={updateField('newPassword')}
            required
            autoComplete="new-password"
          />
          <PasswordInput
            label="Neues Passwort bestätigen"
            value={formData.newPasswordConfirm}
            onChange={updateField('newPasswordConfirm')}
            required
            autoComplete="new-password"
          />

          <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? 'Wird geändert …' : 'Passwort ändern'}
          </button>
        </form>
      </Card>
    </div>
  )
}
