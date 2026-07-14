import { useCallback, useEffect, useRef, useState } from 'react'
import { getFeed } from '@/api/feed'

export function useFeedManagement() {
  const [feed, setFeed] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const requestIdRef = useRef(0)

  const fetchFeed = useCallback((targetPage) => {
    const requestId = ++requestIdRef.current
    setStatus('loading')
    setError(null)

    return getFeed({ page: targetPage })
      .then((result) => {
        // Ignora respostas de páginas antigas se o usuário já navegou adiante.
        if (requestId !== requestIdRef.current) return
        setFeed(result.feed)
        setPagination(result.pagination)
        setStatus('success')
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        setError(err.message ?? 'Erro ao carregar feed')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    fetchFeed(page)
  }, [page, fetchFeed])

  const goToNextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, pagination.totalPages || p + 1))
  }, [pagination.totalPages])

  const goToPreviousPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  return {
    feed,
    pagination,
    status,
    error,
    page,
    goToNextPage,
    goToPreviousPage,
    refetch: () => fetchFeed(page),
  }
}
