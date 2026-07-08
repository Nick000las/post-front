import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '@/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const statusRef = useRef('idle')

  const ensureSessionChecked = useCallback(() => {
    if (statusRef.current === 'loading' || statusRef.current === 'success') return

    statusRef.current = 'loading'
    setStatus('loading')
    setError(null)

    getMe()
      .then((data) => {
        statusRef.current = 'success'
        setUser(data.user ?? null)
        setStatus('success')
      })
      .catch(() => {
        // 401 aqui é o caminho normal de quem não tem sessão — não é erro
        // a reportar, por isso não disparamos toast nem populamos `error`.
        statusRef.current = 'error'
        setUser(null)
        setError(null)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    ensureSessionChecked()
  }, [ensureSessionChecked])

  const login = useCallback(async (email, password) => {
    statusRef.current = 'loading'
    setStatus('loading')
    setError(null)

    try {
      const data = await apiLogin(email, password)
      statusRef.current = 'success'
      setUser(data.user ?? null)
      setStatus('success')
    } catch (err) {
      statusRef.current = 'error'
      setUser(null)
      setError(err.message ?? 'Falha ao entrar')
      setStatus('error')
      toast.error('Falha ao entrar', { description: err.message })
    }
  }, [])

  const register = useCallback(async (username, email, password) => {
    statusRef.current = 'loading'
    setStatus('loading')
    setError(null)

    try {
      const data = await apiRegister(username, email, password)
      // Resposta de /register usa a chave literal "usuário", não "user".
      const registeredUser = data.user ?? data['usuário'] ?? null

      statusRef.current = 'error' // registrar não autentica: sem Set-Cookie
      setUser(null)
      setError(null)
      setStatus('error')

      toast.success(data.message ?? 'Cadastro realizado com sucesso!', {
        description: registeredUser?.email ? `Você já pode entrar com ${registeredUser.email}.` : undefined,
      })
      return true
    } catch (err) {
      statusRef.current = 'error'
      setError(err.message ?? 'Falha ao cadastrar')
      setStatus('error')
      toast.error('Falha ao cadastrar', { description: err.message })
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignorado de propósito: a única fonte de verdade é o cookie httpOnly,
      // que o JS não inspeciona. A sessão local é sempre zerada aqui.
    } finally {
      statusRef.current = 'error'
      setUser(null)
      setError(null)
      setStatus('error')
    }
  }, [])

  const value = { user, status, error, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
