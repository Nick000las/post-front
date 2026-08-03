import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getComments, postComment } from '@/api/comments'

export function useCardComments(postId, clientId, enabled) {
  const [comments, setComments] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  // Guarda o postId já buscado: o histórico é carregado uma única vez por post,
  // sem polling nem revalidação automática.
  const fetchedForRef = useRef(null)

  const loadComments = useCallback(() => {
    if (postId == null) return
    fetchedForRef.current = postId
    setStatus('loading')
    setError(null)

    return getComments(postId, clientId)
      .then((list) => {
        setComments(list)
        setStatus('success')
      })
      .catch((err) => {
        setError(err.message ?? 'Erro ao carregar os comentários')
        setStatus('error')
        // Libera o guard pra permitir "tentar novamente" sem trocar de post.
        fetchedForRef.current = null
      })
  }, [postId, clientId])

  useEffect(() => {
    if (!enabled || postId == null) return
    if (fetchedForRef.current === postId) return
    loadComments()
  }, [enabled, postId, loadComments])

  const sendComment = useCallback(async (text, file) => {
    setSending(true)
    try {
      const data = await postComment(postId, clientId, text, file)
      // A lista vem em ordem cronológica crescente, então o novo vai no fim.
      setComments((prev) => [...prev, data.comentario])
      return true
    } catch (err) {
      toast.error('Falha ao enviar mensagem', { description: err.message })
      return false
    } finally {
      setSending(false)
    }
  }, [postId, clientId])

  return {
    comments,
    status,
    error,
    sending,
    sendComment,
    refetch: loadComments,
  }
}
