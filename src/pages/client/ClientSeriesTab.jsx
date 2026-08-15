import { useEffect, useRef } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import StorySeriesCard from '@/components/StorySeriesCard'
import { useStorySeries } from '@/hooks/useStorySeries'

function ClientSeriesTab() {
  const { clientId } = useOutletContext()
  const location = useLocation()
  // Vem do "Gerenciar esta série" no popup do Kanban — rola até a linha certa e já abre o
  // sanfonado de ocorrências dela, sem o usuário precisar procurar entre as séries do cliente.
  const focusSeriesId = location.state?.focusSeriesId ?? null
  const hasScrolledRef = useRef(false)
  const cardRefs = useRef({})

  const {
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
    refetch,
  } = useStorySeries(clientId)

  useEffect(() => {
    if (focusSeriesId == null || hasScrolledRef.current || status !== 'success') return
    const el = cardRefs.current[focusSeriesId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      hasScrolledRef.current = true
    }
  }, [focusSeriesId, status, series])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando séries...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // totalOcorrencias: 0 é uma série cancelada por completo — o backend preserva o registro
  // como marco histórico, mas não sobra nada pra gerenciar (nem ocorrência pra estender a
  // partir dela), então some da lista ativa.
  const activeSeries = series.filter((serie) => serie.totalOcorrencias > 0)

  if (activeSeries.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Nenhuma série ainda. Agende um Story em mais de uma data para criar uma.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {activeSeries.map((serie) => (
        <div key={serie.id} ref={(el) => { cardRefs.current[serie.id] = el }}>
          <StorySeriesCard
            serie={serie}
            isExtending={extendingId === serie.id}
            isCancelling={cancellingId === serie.id}
            isDeleting={deletingId === serie.id}
            onLoadOccurrences={loadOccurrences}
            onExtend={extend}
            onCancel={cancelSeries}
            onDelete={deleteSeries}
            autoExpand={serie.id === focusSeriesId}
          />
        </div>
      ))}
    </div>
  )
}

export default ClientSeriesTab
