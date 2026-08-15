import { ImageOff, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CardCommentsPanel from '@/components/CardCommentsPanel'
import StorySeriesCard from '@/components/StorySeriesCard'
import { useStorySeries } from '@/hooks/useStorySeries'
import { getMediaUrl } from '@/lib/media'

// Aberto a partir do card mestre no Kanban — clicar num post de série abre a série inteira,
// não o popup de post único (não tem "esta ocorrência" fazendo sentido isolada quando o card
// já representa o grupo). Fica enxuto de propósito: só badges informativas + mídia + chat do
// post representante — gerenciar a série (estender/cancelar/excluir/ver ocorrências) é tudo
// na aba Séries de Story, pra onde "Gerenciar esta série" leva.
function SeriesDetailModal({ open, onOpenChange, post, clientId }) {
  const { series, status } = useStorySeries(clientId)
  const serie = series.find((s) => s.id === post?.recurrence_id)
  const navigate = useNavigate()

  const media = post?.media?.[0]
  const mediaUrl = media ? getMediaUrl(media) : null

  const handleManage = (recurrenceId) => {
    onOpenChange(false)
    // Passa o id via state pra aba de séries poder rolar até a linha certa e já abrir o
    // sanfonado de ocorrências dela, sem o usuário precisar procurar.
    navigate(`/clientes/${clientId}/series`, { state: { focusSeriesId: recurrenceId } })
  }

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="flex max-h-[calc(90vh-3rem)] flex-col gap-4 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do post</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              {mediaUrl ? (
                <img src={mediaUrl} alt={media.file_name} className="w-full rounded-lg max-h-80 object-cover" />
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-lg bg-muted/50 text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                  <span className="text-sm">Sem mídia</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {status === 'loading' || !serie ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando série...
                </div>
              ) : (
                <StorySeriesCard serie={serie} onManage={handleManage} bare showThumbnail={false} />
              )}
            </div>
          </div>

          <CardCommentsPanel postId={post.id} clientId={clientId} open={open} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SeriesDetailModal
