import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/accounts'

export function useAccountsManagement() {
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const statusRef = useRef('idle')

  // `silent`: usado pelas mutações (create/update/remove) para re-buscar a lista
  // sem jogar `status` de volta para 'loading' — evita a lista inteira "piscar"
  // (spinner substituindo tudo) a cada edição/exclusão. A carga inicial e o
  // "Tentar novamente" manual continuam usando o caminho não-silencioso.
  const fetchAccounts = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      statusRef.current = 'loading'
      setStatus('loading')
      setError(null)
    }

    return getAccounts()
      .then((list) => {
        statusRef.current = 'success'
        setAccounts(list)
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar contas')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    if (statusRef.current !== 'idle') return
    fetchAccounts()
  }, [fetchAccounts])

  const create = useCallback(async (dados) => {
    setIsCreating(true)
    try {
      await createAccount(dados)
      toast.success('Conta criada com sucesso!')
      await fetchAccounts({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao criar conta', { description: err.message })
      return false
    } finally {
      setIsCreating(false)
    }
  }, [fetchAccounts])

  const update = useCallback(async (id, dados) => {
    setUpdatingId(id)
    try {
      await updateAccount(id, dados)
      toast.success('Conta atualizada com sucesso!')
      await fetchAccounts({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao atualizar conta', { description: err.message })
      return false
    } finally {
      setUpdatingId(null)
    }
  }, [fetchAccounts])

  const remove = useCallback(async (id) => {
    setDeletingId(id)
    try {
      await deleteAccount(id)
      toast.success('Conta excluída com sucesso!')
      await fetchAccounts({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao excluir conta', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }, [fetchAccounts])

  return {
    accounts,
    status,
    error,
    isCreating,
    updatingId,
    deletingId,
    create,
    update,
    remove,
    refetch: fetchAccounts,
  }
}
