import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import FormInput from './FormInput'

/**
 * FormInput speziell für Passwörter, mit Sichtbarkeits-Toggle.
 */
export default function PasswordInput({ label = 'Passwort', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <FormInput
      label={label}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
          tabIndex={-1}
        >
          {visible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      }
      {...props}
    />
  )
}
