import { useEffect, useRef, useState } from 'react'
import { CalendarClock, ChevronDown, ChevronUp, ImageOff, Loader2, Repeat, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmActionSheet from '@/components/ConfirmActionSheet'
import StorySchedulePicker from '@/components/StorySchedulePicker'
import { getMediaUrl } from '@/lib/media'

function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

function StorySeriesCard({
  serie,
  isExtending,
  isCancelling,
  isDeleting,
  onLoadOccurrences,
  onExtend,
  onCancel,
  onDelete,
  // onManage presente = modo enxuto (usado no popup do Kanban): só as badges + um link pra
  // aba Séries de Story, sem os botões de ação aqui — mantém o popup rápido de ler, e evita
  // duplicar toda a superfície de gerenciamento de série em dois lugares.
  onManage,
  // autoExpand: usado pela aba Séries de Story quando chega com foco numa série específica
  // (vindo do link "Gerenciar esta série") — já abre o sanfonado de ocorrências sozinho.
  autoExpand = false,
  // bare: usado dentro do SeriesDetailModal, que já mostra a mídia grande e envolve tudo
  // no próprio Dialog — sem o <Card> aninhado nem a miniatura, que ficariam redundantes.
  bare = false,
  showThumbnail = !bare,
  // Repassado pro StorySchedulePicker e pros ConfirmActionSheet: sem isso, esses Popover/Sheet
  // portariam pro <body> em vez do Dialog, e o clique dentro deles seria lido como "fora do
  // modal" pelo Radix — fechando o Dialog sozinho (mesmo problema que ScheduleButton/
  // DateTimePickerPopover já resolvem em KanbanCardModal.jsx com esse mesmo prop).
  popoverContainer,
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [occurrences, setOccurrences] = useState(null)
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false)
  const hasAutoExpandedRef = useRef(false)

  const nextOccurrence = formatDateTime(serie.proximaOcorrencia)
  const isBusy = isExtending || isCancelling || isDeleting
  // A resposta do índice usa filePath/thumbnailPath (mesmo arquivo de qualquer ocorrência da
  // série) — remapeia pro formato que getMediaUrl já espera em todo o resto do app.
  const thumbnailUrl = serie.filePath
    ? getMediaUrl({ file_path: serie.filePath, thumbnail_path: serie.thumbnailPath }, { thumb: true })
    : null

  const toggleOccurrences = async () => {
    if (occurrences) {
      setOccurrences(null)
      return
    }
    setIsLoadingOccurrences(true)
    const list = await onLoadOccurrences(serie.id)
    setIsLoadingOccurrences(false)
    if (list) setOccurrences(list)
  }

  useEffect(() => {
    if (autoExpand && !hasAutoExpandedRef.current) {
      hasAutoExpandedRef.current = true
      toggleOccurrences()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExpand])

  const badges = (
    <div className="flex flex-wrap items-center gap-2">
      {showThumbnail && (
        thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
            <ImageOff className="h-4 w-4" />
          </div>
        )
      )}
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Repeat className="h-3 w-3" />
        Série #{serie.id}
      </Badge>
      <Badge variant="secondary">{serie.totalOcorrencias} ocorrência(s)</Badge>
      {nextOccurrence ? (
        <Badge variant="secondary" className="gap-1">
          <CalendarClock className="h-3 w-3" />
          Próxima: {nextOccurrence}
        </Badge>
      ) : (
        <Badge variant="outline" className="border-dashed text-muted-foreground">
          Sem ocorrências pendentes
        </Badge>
      )}
    </div>
  )

  // Modo enxuto: só as badges informativas + a ponte pra aba Séries, onde vive o
  // gerenciamento de verdade (estender, cancelar, excluir, ver ocorrências).
  if (onManage) {
    const minimalBody = (
      <>
        {badges}
        <Button
          type="button"
          variant="link"
          className="h-auto self-start px-0"
          onClick={() => onManage(serie.id)}
        >
          Gerenciar esta série
        </Button>
      </>
    )
    return bare ? <div className="flex flex-col gap-3">{minimalBody}</div> : (
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">{minimalBody}</CardContent>
      </Card>
    )
  }

  const body = (
    <>
      {badges}

      <div className="flex flex-wrap gap-2">
        <StorySchedulePicker
          disabled={isBusy}
          isScheduling={isExtending}
          onConfirm={(scheduledDates) => onExtend(serie.id, scheduledDates)}
          label="Estender série"
          loadingLabel="Estendendo..."
          popoverContainer={popoverContainer}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleOccurrences}
          disabled={isLoadingOccurrences}
        >
          {isLoadingOccurrences ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : occurrences ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
          Ver ocorrências
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setShowCancelConfirm(true)}
          disabled={isBusy || !nextOccurrence}
          title={!nextOccurrence ? 'Esta série não tem ocorrências agendadas' : undefined}
        >
          Cancelar agendamentos
        </Button>

        {/* Ação separada de "Cancelar agendamentos": cancelar preserva histórico e deixa
            1 rascunho; excluir apaga tudo (mesmo já publicado), sem deixar nada. */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isBusy}
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          Excluir série
        </Button>
      </div>

      {occurrences && (
        <div className="flex flex-col gap-1.5 rounded-lg border p-3">
          {occurrences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma ocorrência encontrada.</p>
          ) : (
            occurrences.map((occurrence) => (
              <div key={occurrence.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground">
                  {formatDateTime(occurrence.scheduled_for ?? occurrence.published_at) ?? 'Sem data'}
                </span>
                <Badge variant="outline" className="text-xs">{occurrence.status}</Badge>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )

  return (
    <>
      {bare ? <div className="flex flex-col gap-3">{body}</div> : (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">{body}</CardContent>
        </Card>
      )}

      <ConfirmActionSheet
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancelar agendamentos da série"
        description="As ocorrências ainda agendadas são removidas, sobrando 1 rascunho pronto pra reagendar do zero. O que já foi publicado não é afetado."
        confirmText="Cancelar agendamentos"
        loadingText="Cancelando..."
        isLoading={isCancelling}
        onConfirm={() => onCancel(serie.id)}
        container={popoverContainer}
      />

      <ConfirmActionSheet
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir série"
        description="Apaga TODAS as ocorrências desta série, mesmo as já publicadas — mídia, histórico e agendamentos, tudo de vez. Essa ação não pode ser desfeita."
        confirmText="Excluir série"
        loadingText="Excluindo..."
        isLoading={isDeleting}
        onConfirm={() => onDelete(serie.id)}
        variant="destructive"
        container={popoverContainer}
      />
    </>
  )
}

export default StorySeriesCard
