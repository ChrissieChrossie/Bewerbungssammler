import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * Lässt nur eingeloggte Nutzer durch. Nicht eingeloggte werden zum Login
 * umgeleitet, der die Zielseite nach erfolgreichem Login wieder anspringt.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) {
    return <LoadingSpinner text="Sitzung wird geprüft..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
