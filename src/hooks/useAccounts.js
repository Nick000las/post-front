import { useCallback, useRef, useState } from 'react'

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

    fetch('/contas')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? `Erro HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        statusRef.current = 'success'
        const list = Array.isArray(data) ? data : data?.contas
        setAccounts(Array.isArray(list) ? list : [])
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
