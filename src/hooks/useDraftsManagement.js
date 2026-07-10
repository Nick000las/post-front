import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getDrafts, updateDraftCaption, deleteDraft, publishDraft } from '@/api/drafts'
import { summarizePublishResult, toastPublishResult } from '@/lib/publishResult'

export function useDraftsManagement() {
  const [drafts, setDrafts] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const statusRef = useRef('idle')

  const fetchDrafts = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      statusRef.current = 'loading'
      setStatus('loading')
      setError(null)
    }

    return getDrafts()
      .then((list) => {
        statusRef.current = 'success'
        setDrafts(list)
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar rascunhos')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    if (statusRef.current !== 'idle') return
    fetchDrafts()
  }, [fetchDrafts])

  const updateCaption = useCallback(async (id, caption) => {
    setUpdatingId(id)
    try {
      const data = await updateDraftCaption(id, caption)
      // A resposta do PUT não inclui `accounts` — faz merge só do campo caption
      // para não sumir a lista de contas vinculadas já carregada.
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, caption: data.draft.caption } : d)))
      toast.success('Legenda atualizada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao atualizar legenda', { description: err.message })
      return false
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const remove = useCallback(async (id) => {
    setDeletingId(id)
    try {
      await deleteDraft(id)
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast.success('Rascunho excluído com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao excluir rascunho', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }, [])

  const publish = useCallback(async (id, accounts) => {
    setPublishingId(id)
    try {
      const data = await publishDraft(id)
      const { successCount, failCount, description } = summarizePublishResult(data.detalhes ?? [], accounts ?? [])
      toastPublishResult({ successCount, failCount, description, successMessage: data.message ?? 'Publicado com sucesso!' })

      if (failCount === 0) {
        setDrafts((prev) => prev.filter((d) => d.id !== id))
        return true
      }

      // Falha parcial ou total: o contrato não garante o estado do rascunho
      // no back-end nesse caso, então busca de novo em vez de assumir.
      await fetchDrafts({ silent: true })
      return false
    } catch (err) {
      toast.error('Falha ao publicar rascunho', { description: err.message })
      return false
    } finally {
      setPublishingId(null)
    }
  }, [fetchDrafts])

  return {
    drafts,
    status,
    error,
    updatingId,
    deletingId,
    publishingId,
    updateCaption,
    remove,
    publish,
    refetch: fetchDrafts,
  }
}
