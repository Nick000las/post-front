import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getClients, createClient, updateClient, deleteClient } from '@/api/clients'

export function useClients() {
  const [clients, setClients] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const statusRef = useRef('idle')

  // `silent`: usado pelas mutações para re-buscar a lista sem jogar `status`
  // de volta para 'loading' — evita a lista inteira "piscar" a cada mutação.
  const fetchClients = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      statusRef.current = 'loading'
      setStatus('loading')
      setError(null)
    }

    return getClients()
      .then((list) => {
        statusRef.current = 'success'
        setClients(list)
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar clientes')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    if (statusRef.current !== 'idle') return
    fetchClients()
  }, [fetchClients])

  const create = useCallback(async (dados) => {
    setIsCreating(true)
    try {
      await createClient(dados)
      toast.success('Cliente criado com sucesso!')
      await fetchClients({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao criar cliente', { description: err.message })
      return false
    } finally {
      setIsCreating(false)
    }
  }, [fetchClients])

  const update = useCallback(async (id, dados) => {
    setUpdatingId(id)
    try {
      await updateClient(id, dados)
      toast.success('Cliente atualizado com sucesso!')
      await fetchClients({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao atualizar cliente', { description: err.message })
      return false
    } finally {
      setUpdatingId(null)
    }
  }, [fetchClients])

  const remove = useCallback(async (id) => {
    setDeletingId(id)
    try {
      await deleteClient(id)
      toast.success('Cliente excluído com sucesso!')
      await fetchClients({ silent: true })
      return true
    } catch (err) {
      toast.error('Falha ao excluir cliente', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }, [fetchClients])

  return {
    clients,
    status,
    error,
    isCreating,
    updatingId,
    deletingId,
    create,
    update,
    remove,
    refetch: fetchClients,
  }
}
