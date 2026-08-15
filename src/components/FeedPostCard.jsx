import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ClientAvatar from '@/components/ClientAvatar'
import MediaCarousel from '@/components/MediaCarousel'
import { canRepublish, statusBadgeVariant } from '@/lib/feedStatus'
import { PLATFORMS } from '@/lib/platforms'
import { POST_FORMAT } from '@/lib/postFormat'

function FeedPostCard({ post, showAuthor = true, onRepublish, isRepublishing = false }) {
  const isStory = post.format === POST_FORMAT.STORY

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3">
        <MediaCarousel
          media={post.media ?? []}
          variant="cover"
          emptyLabel="Sem mídia"
          className="w-full rounded-lg max-h-64 object-cover"
        />

        <div className="flex items-center justify-between gap-2">
          {showAuthor ? (
            <div className="flex items-center gap-2 min-w-0">
              <ClientAvatar name={post.author?.name} size="sm" />
              <p className="text-sm font-medium text-foreground truncate">{post.author?.name}</p>
            </div>
          ) : (
            <span />
          )}
          <Badge variant={statusBadgeVariant(post.status)}>{post.status}</Badge>
        </div>

        {/* Story não tem legenda — some o campo em vez de mostrar "Sem legenda". */}
        {!isStory && (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {post.caption?.trim() ? post.caption : <span className="text-muted-foreground">Sem legenda</span>}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {post.accounts.map((account) => {
            const Icon = PLATFORMS.find((p) => p.id === account.platform?.toLowerCase())?.icon
            return (
              <Badge
                key={account.id}
                variant={account.delivery_status === 'FAILED' ? 'destructive' : 'secondary'}
                title={account.delivery_status === 'FAILED' ? account.error_message : undefined}
                className="gap-1"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {account.name}
              </Badge>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          {showAuthor ? (
            <p className="text-xs text-muted-foreground">
              Criado em {new Date(post.created_at).toLocaleDateString('pt-BR')} · Atualizado em{' '}
              {new Date(post.updated_at).toLocaleDateString('pt-BR')}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Publicado em {new Date(post.published_at ?? post.updated_at).toLocaleDateString('pt-BR')}
            </p>
          )}

          {onRepublish && canRepublish(post.status) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRepublishing}
                  onClick={() => onRepublish(post)}
                >
                  {isRepublishing ? 'Republicando...' : 'Republicar'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Republicação ainda não disponível</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedPostCard
