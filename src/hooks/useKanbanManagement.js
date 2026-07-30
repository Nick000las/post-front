import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  getKanbanBoard,
  createColumn,
  renameColumn,
  deleteColumn,
  movePost,
} from '@/api/kanban'

export function useKanbanManagement(clientId) {
  const [columns, setColumns] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [creatingColumn, setCreatingColumn] = useState(false)
  const [renamingColumnId, setRenamingColumnId] = useState(null)
  const [deletingColumnId, setDeletingColumnId] = useState(null)
  const [movingPostId, setMovingPostId] = useState(null)
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

  return {
    columns,
    status,
    error,
    creatingColumn,
    renamingColumnId,
    deletingColumnId,
    movingPostId,
    addColumn,
    renameColumnAction,
    removeColumn,
    moveCard,
    refetch: fetchBoard,
  }
}
