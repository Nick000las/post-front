import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PLATFORMS } from '@/lib/platforms'
import { getMediaUrl } from '@/lib/media'

function KanbanCardModal({ open, onOpenChange, post }) {
  if (!post) return null

  const isVideo = post.file_type?.startsWith('video/')
  const mediaUrl = getMediaUrl(post)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do post</DialogTitle>
        </DialogHeader>

        {isVideo ? (
          <video src={mediaUrl} controls className="w-full rounded-lg max-h-80 object-cover bg-black" />
        ) : (
          <img src={mediaUrl} alt={post.file_name} className="w-full rounded-lg max-h-80 object-cover" />
        )}

        <p className="text-sm text-foreground whitespace-pre-wrap">
          {post.caption?.trim() ? post.caption : <span className="text-muted-foreground">Sem legenda</span>}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{post.status}</Badge>
          {post.accounts?.map((account) => {
            // Mesma normalização do KanbanCard: a API do Kanban manda `platform`
            // em maiúsculo, PLATFORMS usa ids minúsculos.
            const platformMeta = PLATFORMS.find((p) => p.id === account.platform?.toLowerCase())
            return (
              <Badge key={account.id} variant="secondary">
                {account.name} · {platformMeta?.name ?? account.platform}
              </Badge>
            )
          })}
        </div>

        {post.scheduled_for && (
          <p className="text-xs text-muted-foreground">
            Agendado para {new Date(post.scheduled_for).toLocaleString('pt-BR')}
          </p>
        )}

        {/* Espaço reservado para o futuro chat de colaboração — sem lógica ainda. */}
        <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          Comentários (em breve)
        </div>

        <DialogFooter>
          {/* Desabilitado de propósito: a integração com a tela de Publicar Post
              é de outra tarefa, então não há onClick aqui ainda. */}
          <Button type="button" variant="outline" disabled>
            Abrir no Publicador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default KanbanCardModal
