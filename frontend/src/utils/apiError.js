const FIELD_LABELS = {
  name: 'Name',
  email: 'E-Mail',
  password: 'Passwort',
  password_confirm: 'Passwort-Wiederholung',
  current_password: 'Aktuelles Passwort',
  new_password: 'Neues Passwort',
  new_password_confirm: 'Neues Passwort (Wiederholung)'
}

/**
 * Wandelt einen Axios-Fehler der Auth-API in eine Anzeige-Nachricht plus
 * Feld-Fehler-Map um. Deckt sowohl generische Fehler ({ detail: "..." }) als
 * auch strukturierte Validierungsfehler ({ detail: [{ loc, msg }, ...] }) ab.
 */
export function parseApiError(error) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return { message: detail, fieldErrors: {} }
  }

  if (Array.isArray(detail)) {
    const fieldErrors = {}
    const messages = []

    for (const item of detail) {
      const field = item.loc?.[item.loc.length - 1]
      const label = typeof field === 'string' ? FIELD_LABELS[field] : undefined
      const msg = (item.msg || 'Ungültige Eingabe.').replace(/^Value error,\s*/, '')

      messages.push(label ? `${label}: ${msg}` : msg)
      if (label) fieldErrors[field] = msg
    }

    return { message: messages.join(' '), fieldErrors }
  }

  return { message: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.', fieldErrors: {} }
}
