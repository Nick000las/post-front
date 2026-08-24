import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ClientAvatar from '@/components/ClientAvatar'
import MediaCarousel from '@/components/MediaCarousel'
import { canRepublish, statusBadgeVariant } from '@/lib/feedStatus'
import { PLATFORMS } from '@/lib/platforms'
import { POST_FORMAT } from '@/lib/postFormat'
import { formatExactDateTime } from '@/lib/dateTime'

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
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {/* Feed e Story convivem no mesmo grid temporal — a distinção é só visual, por badge. */}
            {isStory && (
              <Badge className="border-transparent bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400">
                Story
              </Badge>
            )}
            <Badge variant={statusBadgeVariant(post.status)}>{post.status}</Badge>
          </div>
        </div>

        {/* Story não tem legenda — some o campo em vez de mostrar "Sem legenda". */}
        {!isStory && (
          <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-2">
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
              Criado em {formatExactDateTime(post.created_at)} · Atualizado em{' '}
              {formatExactDateTime(post.updated_at)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Publicado em {formatExactDateTime(post.published_at ?? post.updated_at)}
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
