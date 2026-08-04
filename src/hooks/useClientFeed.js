import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getClientFeed } from '@/api/feed'

export function useClientFeed(clientId) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [feed, setFeed] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const page = Number(searchParams.get('page')) || 1
  const filters = {
    platform: searchParams.get('platform') || '',
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
  }
  // Mês/ano só filtram juntos — mês isolado (ou vice-versa) é ignorado até o par completar.
  const hasFullPeriod = Boolean(filters.month && filters.year)

  const fetchFeed = useCallback((targetClientId, targetPage, targetFilters) => {
    const requestId = ++requestIdRef.current
    setStatus('loading')
    setError(null)

    return getClientFeed({ page: targetPage, clientId: targetClientId, ...targetFilters })
      .then((result) => {
        // Ignora respostas de páginas/filtros antigos se o usuário já navegou adiante.
        if (requestId !== requestIdRef.current) return
        setFeed(result.feed)
        setPagination(result.pagination)
        setStatus('success')
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        setError(err.message ?? 'Erro ao carregar feed do cliente')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    if (clientId == null) return
    fetchFeed(clientId, page, {
      platform: filters.platform || undefined,
      month: hasFullPeriod ? filters.month : undefined,
      year: hasFullPeriod ? filters.year : undefined,
    })
  }, [clientId, page, filters.platform, filters.month, filters.year, hasFullPeriod, fetchFeed])

  // Qualquer troca de filtro reseta a paginação pra página 1.
  const setFilters = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value)
        else next.delete(key)
      })
      next.set('page', '1')
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const goToPage = useCallback(
    (targetPage) => {
      const next = new URLSearchParams(searchParams)
      next.set('page', String(targetPage))
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const goToNextPage = useCallback(() => {
    goToPage(Math.min(page + 1, pagination.totalPages || page + 1))
  }, [goToPage, page, pagination.totalPages])

  const goToPreviousPage = useCallback(() => {
    goToPage(Math.max(page - 1, 1))
  }, [goToPage, page])

  return {
    feed,
    pagination,
    status,
    error,
    page,
    filters,
    setFilters,
    goToNextPage,
    goToPreviousPage,
    refetch: () =>
      fetchFeed(clientId, page, {
        platform: filters.platform || undefined,
        month: hasFullPeriod ? filters.month : undefined,
        year: hasFullPeriod ? filters.year : undefined,
      }),
  }
}
