import { useState } from 'react'
import { AlertTriangle, CalendarClock, Loader2, Pencil, Send, Trash2, Video } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ConfirmActionSheet from '@/components/ConfirmActionSheet'
import ScheduleButton from '@/components/ScheduleButton'
import DateTimePickerPopover from '@/components/DateTimePickerPopover'
import DraftMediaEditor from '@/components/DraftMediaEditor'
import MediaCarousel from '@/components/MediaCarousel'
import WarningBanner from '@/components/WarningBanner'
import CardCommentsPanel from '@/components/CardCommentsPanel'
import DraftAccountsSheet from '@/components/DraftAccountsSheet'
import { PLATFORMS } from '@/lib/platforms'
import { suggestedDateToLocalMidnight } from '@/lib/suggestedDate'
import { getFormatBehavior } from '@/lib/postFormat'
import { getCarouselVideoConflicts, formatCarouselVideoConflictMessage } from '@/lib/platformCompat'

const STATUS_LABELS = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  PARTIAL: 'Publicado parcialmente',
  FAILED: 'Falha ao publicar',
  PROCESSING: 'Publicando...',
}

function getStatusVariant(status) {
  if (status === 'FAILED' || status === 'PARTIAL') return 'destructive'
  if (status === 'PUBLISHED') return 'secondary'
  return 'outline'
}

function KanbanCardModal({
  open,
  onOpenChange,
  post,
  clientId,
  onUpdateCaption,
  onReplaceMedia,
  onRemoveMediaItem,
  onChangeScheduleDate,
  onCancelSchedule,
  onDeletePost,
  onPublish,
  onSchedule,
  onLinkAccounts,
  isUpdatingCaption,
  isUpdatingMedia,
  removingMediaId,
  isChangingScheduleDate,
  isCancellingSchedule,
  isDeletingPost,
  isPublishing,
  isScheduling,
  isLinkingAccounts,
}) {
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  // Nó real do DialogContent, repassado ao ScheduleButton pra portar o Popover
  // de agendamento pra dentro dele — ver comentário em ui/popover.jsx.
  const [dialogContentEl, setDialogContentEl] = useState(null)

  if (!post) return null

  // Os dois modos do popup. Rascunho é o único status editável (o backend
  // recusa edição de legenda em qualquer outro); agendado abre em modo
  // protegido, só com alterar data / cancelar / excluir.
  const isDraft = post.status === 'DRAFT'
  const isScheduled = post.status === 'SCHEDULED'
  // O backend recusa publicar um post sem contas vinculadas — avisa antes.
  const accountCount = post.accounts?.length ?? 0
  // Idem pra mídia: excluir o último item pode deixar o draft vazio, e
  // publicar/agendar sem arquivo é rejeitado (400) lá atrás.
  const hasMedia = (post.media?.length ?? 0) > 0
  const formatBehavior = getFormatBehavior(post.format)
  const carouselVideoConflicts = getCarouselVideoConflicts({
    mediaCount: post.media?.length ?? 0,
    hasVideo: post.media?.some((item) => item.file_type?.startsWith('video/')) ?? false,
    platformIds: post.accounts?.map((account) => account.platform?.toLowerCase()) ?? [],
  })
  const hasCarouselVideoConflict = carouselVideoConflicts.length > 0

  const startEditingCaption = () => {
    setCaptionDraft(post.caption ?? '')
    setIsEditingCaption(true)
  }

  const handleSaveCaption = async () => {
    const ok = await onUpdateCaption(post.id, captionDraft)
    if (ok) setIsEditingCaption(false)
  }

  return (
    // ConfirmActionSheet fica fora do <Dialog>: é outro Root do Radix, e aninhar
    // um dentro do outro embaralha o focus trap dos dois overlays.
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent ref={setDialogContentEl} className="max-w-3xl">
          {/* max-h/overflow ficam aqui, não no DialogContent: ele é o ancestral
          transformado que serve de containing block pro Popover portado (ver
          ScheduleButton), e overflow-y-auto nele recortaria o Popover junto. */}
          <div className="flex max-h-[calc(90vh-3rem)] flex-col gap-4 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do post</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                {isDraft ? (
                  <DraftMediaEditor
                    post={post}
                    onReplaceAll={(files) => onReplaceMedia(post.id, files)}
                    onRemoveItem={(mediaId) => onRemoveMediaItem(post.id, mediaId)}
                    isReplacing={isUpdatingMedia}
                    removingMediaId={removingMediaId}
                  />
                ) : (
                  <MediaCarousel media={post.media ?? []} variant="detail" className="w-full max-h-80 object-cover" />
                )}
              </div>

              <div className="flex flex-col gap-3">
                {isEditingCaption ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={captionDraft}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                      rows={3}
                      className="resize-none"
                      disabled={isUpdatingCaption}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingCaption(false)}
                        disabled={isUpdatingCaption}
                      >
                        Cancelar
                      </Button>
                      <Button type="button" size="sm" onClick={handleSaveCaption} disabled={isUpdatingCaption}>
                        {isUpdatingCaption ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm text-foreground whitespace-pre-wrap">
                      {post.caption?.trim() ? post.caption : <span className="text-muted-foreground">Sem legenda</span>}
                    </p>
                    {isDraft && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={startEditingCaption}
                        aria-label="Editar legenda"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={getStatusVariant(post.status)}>
                    {STATUS_LABELS[post.status] ?? post.status}
                  </Badge>
                  {formatBehavior.showStoryComingSoon && (
                    <Badge variant="secondary" className="text-xs">
                      Story · Em breve
                    </Badge>
                  )}
                  {post.accounts?.map((account) => {
                    // A API do Kanban manda `platform` em maiúsculo, PLATFORMS usa ids minúsculos.
                    const platformMeta = PLATFORMS.find((p) => p.id === account.platform?.toLowerCase())
                    return (
                      <Badge key={account.id} variant="secondary">
                        {account.name} · {platformMeta?.name ?? account.platform}
                      </Badge>
                    )
                  })}
                </div>

                {formatBehavior.showReelsWarning && (
                  <WarningBanner icon={Video}>
                    Lembre-se de anexar um vídeo vertical.
                  </WarningBanner>
                )}

                {hasCarouselVideoConflict && (
                  <WarningBanner icon={AlertTriangle}>
                    {formatCarouselVideoConflictMessage(carouselVideoConflicts)}
                  </WarningBanner>
                )}

                {/* Gated em `isScheduled`, não só em `scheduled_for`: um post já
                    publicado carrega a data antiga e não está mais agendado. */}
                {isScheduled && post.scheduled_for && (
                  <Badge variant="secondary" className="w-fit">
                    Agendado para {new Date(post.scheduled_for).toLocaleDateString('pt-BR')}, às{' '}
                    {new Date(post.scheduled_for).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Badge>
                )}

                <div className="flex flex-wrap gap-2">
                  {isDraft && (
                    <Button
                      type="button"
                      onClick={() => setShowPublishConfirm(true)}
                      disabled={isPublishing || accountCount === 0 || !hasMedia || hasCarouselVideoConflict}
                      title={accountCount === 0 ? 'Vincule ao menos uma conta para publicar' : undefined}
                    >
                      <Send className="h-4 w-4 shrink-0" />
                      Publicar agora
                    </Button>
                  )}
                  {isDraft && (
                    <ScheduleButton
                      disabled={accountCount === 0 || !hasMedia || hasCarouselVideoConflict}
                      isScheduling={isScheduling}
                      // Só pré-seleciona o calendário: o que vai pro backend é a data que o
                      // usuário confirmar, não a sugestão da IA.
                      initialDate={suggestedDateToLocalMidnight(post.suggested_date)}
                      onConfirm={(date) => onSchedule(post.id, date.toISOString())}
                      popoverContainer={dialogContentEl}
                    />
                  )}
                  {isDraft && (
                    <DraftAccountsSheet
                      post={post}
                      clientId={clientId}
                      onSave={(accountIds) => onLinkAccounts(post.id, accountIds)}
                      isSaving={isLinkingAccounts}
                    />
                  )}
                  {isDraft && accountCount === 0 && (
                    <p className="w-full text-xs text-muted-foreground">
                      Vincule ao menos uma conta a este post para poder publicá-lo.
                    </p>
                  )}
                  {isDraft && !hasMedia && (
                    <p className="w-full text-xs text-muted-foreground">
                      Anexe uma mídia a este post para poder publicá-lo ou agendá-lo.
                    </p>
                  )}
                  {isScheduled && (
                    <>
                      <DateTimePickerPopover
                        trigger={
                          <Button type="button" variant="outline" disabled={isChangingScheduleDate}>
                            <CalendarClock className="h-4 w-4 shrink-0" />
                            Alterar Data
                          </Button>
                        }
                        initialDate={post.scheduled_for ? new Date(post.scheduled_for) : null}
                        isSubmitting={isChangingScheduleDate}
                        confirmText="Confirmar nova data"
                        loadingLabel="Salvando..."
                        onConfirm={(date) => onChangeScheduleDate(post.id, date.toISOString())}
                        popoverContainer={dialogContentEl}
                      />
                      {/* `outline` e não `destructive`: cancelar não apaga nada,
                          só devolve o post pra Ideias como rascunho. */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isCancellingSchedule}
                      >
                        Cancelar Agendamento
                      </Button>
                    </>
                  )}
                  {/* Excluir vale pra post em qualquer status, não só agendado —
                      o backend já trata isso (cancela job em fila se precisar). */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeletingPost}
                    aria-label="Excluir post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <CardCommentsPanel postId={post.id} clientId={clientId} open={open} />
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionSheet
        open={showPublishConfirm}
        onOpenChange={setShowPublishConfirm}
        title="Publicar post"
        description={`O post será publicado em ${accountCount} conta(s) vinculada(s). A publicação é processada em fila e pode levar alguns instantes.`}
        confirmText="Confirmar publicação"
        loadingText="Publicando..."
        isLoading={isPublishing}
        onConfirm={() => onPublish(post.id)}
      />

      <ConfirmActionSheet
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancelar agendamento"
        description="O post voltará para a coluna Ideias como rascunho. A mídia e a legenda são preservadas — nada é apagado."
        confirmText="Cancelar agendamento"
        loadingText="Cancelando..."
        isLoading={isCancellingSchedule}
        onConfirm={() => onCancelSchedule(post.id)}
      />

      <ConfirmActionSheet
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir post"
        description="Tem certeza? O post será apagado definitivamente, junto com o arquivo de mídia e os comentários. Essa ação não pode ser desfeita."
        confirmText="Excluir post"
        loadingText="Excluindo..."
        isLoading={isDeletingPost}
        onConfirm={() => onDeletePost(post.id)}
        variant="destructive"
      />
    </>
  )
}

export default KanbanCardModal
