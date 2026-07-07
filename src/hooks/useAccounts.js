import { useCallback, useRef, useState } from 'react'
import { getAccounts } from '@/api/accounts'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const statusRef = useRef('idle')

  const ensureLoaded = useCallback(() => {
    if (statusRef.current === 'loading' || statusRef.current === 'success') return

    statusRef.current = 'loading'
    setStatus('loading')
    setError(null)

    getAccounts()
      .then((list) => {
        statusRef.current = 'success'
        setAccounts(list)
        setStatus('success')
      })
      .catch((err) => {
        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar contas')
        setStatus('error')
      })
  }, [])

  return { accounts, status, error, ensureLoaded }
}
