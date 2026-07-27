import { useCallback, useEffect, useRef, useState } from 'react'
import { getAccounts } from '@/api/accounts'

// Variante de useAccounts escopada por cliente. Diferenças em relação ao hook
// legado: (1) re-busca quando `clientId` muda; (2) trata 404 como lista vazia
// — o endpoint escopado responde 404 "Nenhuma conta encontrada" quando o
// cliente não tem contas (contrato distinto do bug de 500 do endpoint antigo).
export function useClientAccounts(clientId) {
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const statusRef = useRef('idle')

  const load = useCallback(() => {
    if (clientId == null) return

    statusRef.current = 'loading'
    setStatus('loading')
    setError(null)

    getAccounts(clientId)
      .then((list) => {
        statusRef.current = 'success'
        setAccounts(list)
        setStatus('success')
      })
      .catch((err) => {
        if (err.status === 404) {
          statusRef.current = 'success'
          setAccounts([])
          setStatus('success')
          return
        }

        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar contas')
        setStatus('error')
      })
  }, [clientId])

  const ensureLoaded = useCallback(() => {
    if (statusRef.current === 'loading' || statusRef.current === 'success') return
    load()
  }, [load])

  // Força re-busca ignorando o cache de status — usado após mutações (create/
  // update/delete de conta) para refletir a lista atualizada.
  const refetch = useCallback(() => {
    load()
  }, [load])

  // Reinicia e re-busca sempre que o cliente muda (inclui limpar contas do
  // cliente anterior para não vazar seleção entre clientes).
  useEffect(() => {
    statusRef.current = 'idle'
    setAccounts([])
    if (clientId != null) load()
  }, [clientId, load])

  return { accounts, status, error, ensureLoaded, refetch }
}
