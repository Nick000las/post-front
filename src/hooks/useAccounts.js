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
        // Bug conhecido do backend: usuário sem nenhuma conta cadastrada faz
        // o service lançar exception (500) em vez de devolver lista vazia.
        // Tratamos como "sem contas" em vez de estado de erro.
        if (err.status === 500) {
          statusRef.current = 'success'
          setAccounts([])
          setStatus('success')
          return
        }

        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar contas')
        setStatus('error')
      })
  }, [])

  return { accounts, status, error, ensureLoaded }
}
