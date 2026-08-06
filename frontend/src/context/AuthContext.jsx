import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/client'
import { parseApiError } from '../utils/apiError'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "checking" (Session-Check beim Laden der App läuft), "authenticated", "guest"
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false
    authApi
      .me()
      .then(({ data }) => {
        if (!cancelled) {
          setUser(data)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setStatus('guest')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const register = useCallback(async (payload) => {
    try {
      const { data } = await authApi.register(payload)
      setUser(data)
      setStatus('authenticated')
      return { success: true }
    } catch (error) {
      return { success: false, ...parseApiError(error) }
    }
  }, [])

  const login = useCallback(async (payload) => {
    try {
      const { data } = await authApi.login(payload)
      setUser(data)
      setStatus('authenticated')
      return { success: true }
    } catch (error) {
      return { success: false, ...parseApiError(error) }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('guest')
    }
  }, [])

  const changePassword = useCallback(async (payload) => {
    try {
      const { data } = await authApi.changePassword(payload)
      setUser(data)
      return { success: true }
    } catch (error) {
      return { success: false, ...parseApiError(error) }
    }
  }, [])

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isChecking: status === 'checking',
    register,
    login,
    logout,
    changePassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth muss innerhalb eines <AuthProvider> verwendet werden.')
  }
  return context
}
