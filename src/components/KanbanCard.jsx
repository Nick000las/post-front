import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CalendarDays, ImageOff, Repeat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MediaCarousel from '@/components/MediaCarousel'
import { PLATFORMS } from '@/lib/platforms'
import { formatSuggestedDate } from '@/lib/suggestedDate'
import { getMediaUrl } from '@/lib/media'
import { POST_FORMAT } from '@/lib/postFormat'

// Conteúdo visual do card, isolado pra ser reaproveitado pelo DragOverlay sem
// arrastar junto a lógica de drag (o overlay é um clone estático).
// memo: durante o arrasto o `isOver` da coluna muda a cada movimento do ponteiro
// e re-renderiza a coluna inteira — sem isso, todos os cards seriam redesenhados
// junto, a cada frame.
export const KanbanCardContent = memo(function KanbanCardContent({ post, seriesCount = 1 }) {
  // Só informativo (vem do Lab de IA) — não agenda nada, quem agenda é scheduled_for.
  const suggestedDate = formatSuggestedDate(post.suggested_date)
  const isStory = post.format === POST_FORMAT.STORY
  // Story tem sempre 1 mídia — o MediaCarousel existe pra navegar entre N itens, então
  // aqui vai a imagem direto (mesmo placeholder visual dele quando não há mídia).
  const storyMedia = isStory ? post.media?.[0] : null

  return (
    <Card>
      <CardContent className="p-2 flex flex-col gap-2">
        {isStory ? (
          storyMedia ? (
            <img
              src={getMediaUrl(storyMedia, { thumb: true })}
              alt={storyMedia.file_name}
              draggable={false}
              className="w-full rounded-md max-h-28 object-cover pointer-events-none"
            />
          ) : (
            <div className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-md bg-muted/50 text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              <span className="text-xs">Sem mídia</span>
            </div>
          )
        ) : (
          <MediaCarousel
            media={post.media ?? []}
            variant="cover"
            emptyLabel="Sem mídia"
            className="w-full rounded-md max-h-28 object-cover"
          />
        )}

        {/* Story não tem legenda — some o campo em vez de mostrar "Sem legenda". */}
        {!isStory && (
          <p className="text-sm text-foreground line-clamp-2">
            {post.caption?.trim() ? post.caption : <span className="text-muted-foreground">Sem legenda</span>}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{post.status}</Badge>
          {isStory && (
            <Badge className="border-transparent bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400">
              Story
            </Badge>
          )}
          {post.recurrence_id != null && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Repeat className="h-3 w-3" />
              {seriesCount > 1 ? `Série (${seriesCount} posts)` : 'Série'}
            </Badge>
          )}
          {suggestedDate && (
            <Badge variant="outline" className="gap-1 border-dashed text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Sugestão: {suggestedDate}
            </Badge>
          )}
          {post.accounts?.map((account) => {
            // A API do Kanban devolve `platform` em maiúsculo (ex: INSTAGRAM),
            // enquanto PLATFORMS usa ids minúsculos.
            const platformMeta = PLATFORMS.find((p) => p.id === account.platform?.toLowerCase())
            return (
              <Badge key={account.id} variant="secondary">
                {account.name} · {platformMeta?.name ?? account.platform}
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

const KanbanCard = memo(function KanbanCard({ post, seriesCount = 1, onOpen, dragDisabled }) {
  // useDraggable (e não useSortable): não há reordenação dentro da coluna — o
  // backend não tem campo de ordem — então o cálculo de sort a cada movimento
  // seria custo puro. Quem segue o cursor é o DragOverlay no componente pai.
  // disabled: colunas automáticas (Agendado/Finalizado) não aceitam mover o
  // card manualmente pra fora — quem tira o post de lá é uma ação (cancelar
  // agendamento, etc.), não o drag. Card mestre de série também não arrasta:
  // mover "uma série" não existe no backend, que move um post por vez.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    disabled: dragDisabled,
  })

  return (
    // O clique simples chega no onClick porque o PointerSensor do DndContext pai
    // usa activationConstraint de 8px — abaixo disso o drag nem começa.
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(post)}
      // O card original vira só um "buraco" enquanto o overlay é arrastado.
      // touch-none evita o scroll do navegador competir com o gesto no mobile.
      className={`touch-none ${dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'opacity-40' : ''}`}
    >
      <KanbanCardContent post={post} seriesCount={seriesCount} />
    </div>
  )
})

export default KanbanCard
