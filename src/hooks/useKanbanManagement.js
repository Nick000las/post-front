import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getKanbanBoard,
  createColumn,
  renameColumn,
  deleteColumn,
  movePost,
} from '@/api/kanban'
import {
  updateDraftCaption,
  updateDraftMedia,
  removeDraftMedia,
  publishDraft,
  scheduleDraft,
} from '@/api/drafts'
import { cancelSchedule, changeScheduleDate, deletePost } from '@/api/posts'

export function useKanbanManagement(clientId) {
  const [columns, setColumns] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [creatingColumn, setCreatingColumn] = useState(false)
  const [renamingColumnId, setRenamingColumnId] = useState(null)
  const [deletingColumnId, setDeletingColumnId] = useState(null)
  const [movingPostId, setMovingPostId] = useState(null)
  const [updatingCaptionPostId, setUpdatingCaptionPostId] = useState(null)
  const [updatingMediaPostId, setUpdatingMediaPostId] = useState(null)
  const [cancellingScheduleId, setCancellingScheduleId] = useState(null)
  const [changingScheduleDateId, setChangingScheduleDateId] = useState(null)
  const [deletingPostId, setDeletingPostId] = useState(null)
  const [publishingPostId, setPublishingPostId] = useState(null)
  const [schedulingPostId, setSchedulingPostId] = useState(null)
  const statusRef = useRef('idle')

  const fetchBoard = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      statusRef.current = 'loading'
      setStatus('loading')
      setError(null)
    }

    return getKanbanBoard(clientId)
      .then((list) => {
        statusRef.current = 'success'
        setColumns(list)
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        statusRef.current = 'error'
        setError(err.message ?? 'Erro ao carregar o quadro')
        setStatus('error')
      })
  }, [clientId])

  useEffect(() => {
    statusRef.current = 'idle'
    fetchBoard()
  }, [fetchBoard])

  const addColumn = useCallback(async (name) => {
    setCreatingColumn(true)
    try {
      const data = await createColumn(clientId, name)
      // A resposta do POST não inclui `posts` — a coluna nasce vazia, então o
      // array é criado aqui pra manter o shape usado no resto da tela.
      setColumns((prev) => [...prev, { ...data.column, posts: [] }])
      toast.success('Coluna criada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao criar coluna', { description: err.message })
      return false
    } finally {
      setCreatingColumn(false)
    }
  }, [clientId])

  const renameColumnAction = useCallback(async (id, name) => {
    setRenamingColumnId(id)
    try {
      const data = await renameColumn(id, clientId, name)
      // Merge só do campo `name`: a resposta do PUT não traz `posts` e sobrescrever
      // a coluna inteira apagaria os cards já carregados.
      setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name: data.column.name } : c)))
      toast.success('Coluna renomeada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao renomear coluna', { description: err.message })
      return false
    } finally {
      setRenamingColumnId(null)
    }
  }, [clientId])

  const removeColumn = useCallback(async (id) => {
    setDeletingColumnId(id)
    try {
      await deleteColumn(id, clientId)
      // O backend reatribui os posts da coluna excluída para "Ideias". Re-buscar
      // o quadro é mais simples e à prova de divergência do que replicar isso aqui.
      await fetchBoard({ silent: true })
      toast.success('Coluna excluída com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao excluir coluna', { description: err.message })
      return false
    } finally {
      setDeletingColumnId(null)
    }
  }, [clientId, fetchBoard])

  const moveCard = useCallback(async (postId, destColumnId) => {
    const sourceColumn = columns.find((c) => c.posts.some((p) => String(p.id) === String(postId)))
    if (!sourceColumn) return false
    if (String(sourceColumn.id) === String(destColumnId)) return false

    const post = sourceColumn.posts.find((p) => String(p.id) === String(postId))

    // Move o post de `fromId` para `toId`. Usado tanto na atualização otimista
    // quanto na reversão (com origem/destino invertidos), sempre como update
    // funcional pra não sobrescrever mudanças concorrentes no estado.
    const relocate = (fromId, toId) => (prev) =>
      prev.map((c) => {
        if (String(c.id) === String(fromId)) {
          return { ...c, posts: c.posts.filter((p) => String(p.id) !== String(postId)) }
        }
        if (String(c.id) === String(toId)) {
          return c.posts.some((p) => String(p.id) === String(postId))
            ? c
            : { ...c, posts: [...c.posts, post] }
        }
        return c
      })

    // Atualização otimista: o card já aparece na coluna de destino antes da
    // resposta da API, pra que o drag pareça instantâneo.
    setColumns(relocate(sourceColumn.id, destColumnId))

    setMovingPostId(postId)
    try {
      const data = await movePost(postId, clientId, destColumnId)
      // Reconcilia o post movido com a versão autoritativa do backend (status,
      // updated_at), preservando `accounts`, que o PUT não devolve.
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.map((p) =>
            String(p.id) === String(postId) ? { ...p, ...data.post, accounts: p.accounts } : p
          ),
        }))
      )
      return true
    } catch (err) {
      setColumns(relocate(destColumnId, sourceColumn.id))
      toast.error('Falha ao mover o post', { description: err.message })
      return false
    } finally {
      setMovingPostId(null)
    }
  }, [clientId, columns])

  const updateCaptionAction = useCallback(async (postId, caption) => {
    setUpdatingCaptionPostId(postId)
    try {
      const data = await updateDraftCaption(postId, caption, clientId)
      // Patch em `columns` no lugar de refetch: só a legenda muda, e o post
      // aberto no modal é derivado desse mesmo estado.
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.map((p) =>
            String(p.id) === String(postId) ? { ...p, caption: data.draft.caption } : p
          ),
        }))
      )
      toast.success('Legenda atualizada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao atualizar legenda', { description: err.message })
      return false
    } finally {
      setUpdatingCaptionPostId(null)
    }
  }, [clientId])

  const updateDraftMediaAction = useCallback(async (postId, file) => {
    setUpdatingMediaPostId(postId)
    try {
      const data = await updateDraftMedia(postId, clientId, file)
      // Patch só dos campos de mídia: a resposta (POST_SELECT_BASE no backend)
      // não traz `accounts`, então um spread do draft inteiro apagaria isso.
      const { file_path, file_name, file_type, thumbnail_path } = data.draft
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.map((p) =>
            String(p.id) === String(postId) ? { ...p, file_path, file_name, file_type, thumbnail_path } : p
          ),
        }))
      )
      toast.success('Mídia atualizada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao atualizar mídia', { description: err.message })
      return false
    } finally {
      setUpdatingMediaPostId(null)
    }
  }, [clientId])

  const removeDraftMediaAction = useCallback(async (postId) => {
    setUpdatingMediaPostId(postId)
    try {
      const data = await removeDraftMedia(postId, clientId)
      const { file_path, file_name, file_type, thumbnail_path } = data.draft
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.map((p) =>
            String(p.id) === String(postId) ? { ...p, file_path, file_name, file_type, thumbnail_path } : p
          ),
        }))
      )
      toast.success('Mídia removida com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao remover mídia', { description: err.message })
      return false
    } finally {
      setUpdatingMediaPostId(null)
    }
  }, [clientId])

  const changeScheduleDateAction = useCallback(async (postId, scheduledFor) => {
    setChangingScheduleDateId(postId)
    try {
      const data = await changeScheduleDate(postId, clientId, scheduledFor)
      // Patch pontual: mudar a data não move o card de coluna, então recarregar
      // o quadro inteiro seria desperdício.
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.map((p) =>
            String(p.id) === String(postId) ? { ...p, scheduled_for: data.scheduled_for } : p
          ),
        }))
      )
      toast.success('Data de agendamento atualizada com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao alterar a data do agendamento', { description: err.message })
      return false
    } finally {
      setChangingScheduleDateId(null)
    }
  }, [clientId])

  const cancelScheduleAction = useCallback(async (postId) => {
    setCancellingScheduleId(postId)
    try {
      // O backend reverte o post para DRAFT (mídia e legenda preservadas) e move
      // o card de volta pra Ideias sozinho — por isso recarrega o quadro inteiro.
      await cancelSchedule(postId, clientId)
      await fetchBoard({ silent: true })
      toast.success('Agendamento cancelado — o post voltou para Ideias como rascunho.')
      return true
    } catch (err) {
      toast.error('Falha ao cancelar agendamento', { description: err.message })
      return false
    } finally {
      setCancellingScheduleId(null)
    }
  }, [clientId, fetchBoard])

  const deletePostAction = useCallback(async (postId) => {
    setDeletingPostId(postId)
    try {
      await deletePost(postId, clientId)
      // O post some do quadro sem afetar mais nada, então basta removê-lo do
      // estado local — nenhum outro card muda de posição.
      setColumns((prev) =>
        prev.map((c) => ({ ...c, posts: c.posts.filter((p) => String(p.id) !== String(postId)) }))
      )
      toast.success('Post excluído com sucesso!')
      return true
    } catch (err) {
      toast.error('Falha ao excluir post', { description: err.message })
      return false
    } finally {
      setDeletingPostId(null)
    }
  }, [clientId])

  const publishPostAction = useCallback(async (postId) => {
    setPublishingPostId(postId)
    try {
      // Reaproveita a mídia que já está no servidor — nada de reupload.
      const data = await publishDraft(postId, clientId)
      // A publicação é assíncrona (fila) e o post muda de status/coluna, então
      // recarrega o quadro em vez de adivinhar o novo estado.
      await fetchBoard({ silent: true })
      const total = data.detalhes?.totalContas
      toast.success(data.message ?? 'Publicação enviada para a fila!', {
        description: total != null ? `${total} conta(s) em processamento.` : undefined,
      })
      return true
    } catch (err) {
      toast.error('Falha ao publicar post', { description: err.message })
      return false
    } finally {
      setPublishingPostId(null)
    }
  }, [clientId, fetchBoard])

  const scheduleDraftAction = useCallback(async (postId, scheduledFor) => {
    setSchedulingPostId(postId)
    try {
      // Opera sobre o post existente (sem reupload) — o backend move o card pra
      // Agendado sozinho, então só recarrega o quadro pra refletir isso.
      const data = await scheduleDraft(postId, clientId, scheduledFor)
      await fetchBoard({ silent: true })
      const total = data.detalhes?.totalContas
      toast.success(data.message ?? 'Post agendado com sucesso!', {
        description: total != null ? `${total} conta(s) agendada(s).` : undefined,
      })
      return true
    } catch (err) {
      toast.error('Falha ao agendar post', { description: err.message })
      return false
    } finally {
      setSchedulingPostId(null)
    }
  }, [clientId, fetchBoard])

  return {
    columns,
    status,
    error,
    creatingColumn,
    renamingColumnId,
    deletingColumnId,
    movingPostId,
    updatingCaptionPostId,
    updatingMediaPostId,
    cancellingScheduleId,
    changingScheduleDateId,
    deletingPostId,
    publishingPostId,
    schedulingPostId,
    addColumn,
    renameColumnAction,
    removeColumn,
    moveCard,
    updateCaptionAction,
    updateDraftMediaAction,
    removeDraftMediaAction,
    changeScheduleDateAction,
    cancelScheduleAction,
    deletePostAction,
    publishPostAction,
    scheduleDraftAction,
    refetch: fetchBoard,
  }
}
