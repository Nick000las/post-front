import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getDrafts, updateDraftCaption, deleteDraft, publishDraft } from '@/api/drafts'

export function useDraftsManagement(clientId) {
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

    return getDrafts(clientId)
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
  }, [clientId])

  useEffect(() => {
    statusRef.current = 'idle'
    fetchDrafts()
  }, [fetchDrafts])

  const updateCaption = useCallback(async (id, caption) => {
    setUpdatingId(id)
    try {
      const data = await updateDraftCaption(id, caption, clientId)
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
  }, [clientId])

  const remove = useCallback(async (id) => {
    setDeletingId(id)
    try {
      await deleteDraft(id, clientId)
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      toast.success('Rascunho excluído com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao excluir rascunho', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }, [clientId])

  const publish = useCallback(async (id) => {
    setPublishingId(id)
    try {
      const data = await publishDraft(id, clientId)
      // A publicação é assíncrona (fila): o 202 só confirma que os jobs foram
      // enfileirados, não o resultado por conta — isso só existe depois, via
      // GET /posts/:id/status ou no Feed.
      const total = data.detalhes?.totalContas
      toast.success(data.message ?? 'Publicado com sucesso!', {
        description: total != null ? `${total} conta(s) em processamento.` : undefined,
      })
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      return true
    } catch (err) {
      toast.error('Falha ao publicar rascunho', { description: err.message })
      return false
    } finally {
      setPublishingId(null)
    }
  }, [clientId])

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
