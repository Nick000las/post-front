import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  getSeriesIndex,
  getStoryRecurrence,
  extendSeries,
  cancelStoryRecurrence,
  deleteStorySeries,
} from '@/api/stories'

// Séries de Story do cliente (POST /stories/schedule com 2+ datas cria uma). Segue o mesmo
// formato dos outros hooks de tela: lista + status/error + uma ação por operação.
export function useStorySeries(clientId) {
  const [series, setSeries] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [extendingId, setExtendingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchSeries = useCallback(({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading')
      setError(null)
    }

    return getSeriesIndex(clientId)
      .then((list) => {
        setSeries(list)
        setStatus('success')
        setError(null)
      })
      .catch((err) => {
        setError(err.message ?? 'Erro ao carregar séries')
        setStatus('error')
      })
  }, [clientId])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  // Ocorrências de uma série — buscadas sob demanda (só quando o usuário expande a linha),
  // por isso não moram no estado da lista.
  const loadOccurrences = useCallback(async (recurrenceId) => {
    try {
      const data = await getStoryRecurrence(recurrenceId, clientId)
      // A chave exata do array na resposta é a única do contrato de Story que não foi
      // confirmada — aceita as duas grafias prováveis e a resposta já como array.
      const list = data?.ocorrencias ?? data?.occurrences ?? data
      return Array.isArray(list) ? list : []
    } catch (err) {
      toast.error('Falha ao carregar ocorrências', { description: err.message })
      return null
    }
  }, [clientId])

  const extend = useCallback(async (recurrenceId, scheduledDates) => {
    setExtendingId(recurrenceId)
    try {
      const data = await extendSeries(recurrenceId, clientId, scheduledDates)
      // A contagem e a próxima ocorrência da série mudam — rebusca o índice.
      await fetchSeries({ silent: true })
      toast.success(data.message ?? 'Série estendida com sucesso!', {
        description: `${data.detalhes?.totalNovasOcorrencias ?? scheduledDates.length} nova(s) ocorrência(s).`,
      })
      return true
    } catch (err) {
      toast.error('Falha ao estender série', { description: err.message })
      return false
    } finally {
      setExtendingId(null)
    }
  }, [clientId, fetchSeries])

  const cancelSeries = useCallback(async (recurrenceId) => {
    setCancellingId(recurrenceId)
    try {
      // O backend colapsa a série: mantém só 1 ocorrência como rascunho solto (draftId) e
      // exclui de vez as demais — não sobra mais um rascunho por ocorrência cancelada.
      const data = await cancelStoryRecurrence(recurrenceId, clientId)
      await fetchSeries({ silent: true })
      toast.success('Agendamentos cancelados', {
        description: `${data.totalCanceladas} ocorrência(s) removida(s) — 1 rascunho disponível para reagendar.`,
      })
      return true
    } catch (err) {
      toast.error('Falha ao cancelar a série', { description: err.message })
      return false
    } finally {
      setCancellingId(null)
    }
  }, [clientId, fetchSeries])

  // Exclui a série inteira (qualquer status, sem deixar rascunho) — distinta de cancelSeries,
  // que colapsa preservando 1 rascunho e o histórico já publicado. As duas coexistem.
  const deleteSeries = useCallback(async (recurrenceId) => {
    setDeletingId(recurrenceId)
    try {
      const data = await deleteStorySeries(recurrenceId, clientId)
      // O registro da série some por completo (não fica como marco histórico igual o
      // cancelamento deixa) — rebusca o índice pra tirar da lista.
      await fetchSeries({ silent: true })
      toast.success('Série excluída', {
        description: `${data.totalExcluidas} ocorrência(s) removida(s) definitivamente.`,
      })
      return true
    } catch (err) {
      toast.error('Falha ao excluir série', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }, [clientId, fetchSeries])

  return {
    series,
    status,
    error,
    extendingId,
    cancellingId,
    deletingId,
    loadOccurrences,
    extend,
    cancelSeries,
    deleteSeries,
    refetch: fetchSeries,
  }
}
