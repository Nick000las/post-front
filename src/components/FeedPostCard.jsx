import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function FeedPostCard({ post }) {
  const isVideo = post.file_type?.startsWith('video/')
  const mediaUrl = `${import.meta.env.VITE_API_URL ?? ''}/uploads/${post.file_path}`

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3">
        {isVideo ? (
          <video src={mediaUrl} controls className="w-full rounded-lg max-h-64 object-cover bg-black" />
        ) : (
          <img src={mediaUrl} alt={post.file_name} className="w-full rounded-lg max-h-64 object-cover" />
        )}

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Publicado por {post.author.name}</p>
          <Badge variant={post.status === 'PARTIAL' ? 'destructive' : 'secondary'}>{post.status}</Badge>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap">
          {post.caption?.trim() ? post.caption : <span className="text-muted-foreground">Sem legenda</span>}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {post.accounts.map((account) => (
            <Badge
              key={account.id}
              variant={account.delivery_status === 'FAILED' ? 'destructive' : 'secondary'}
              title={account.delivery_status === 'FAILED' ? account.error_message : undefined}
            >
              {account.name}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Criado em {new Date(post.created_at).toLocaleDateString('pt-BR')} · Atualizado em{' '}
          {new Date(post.updated_at).toLocaleDateString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  )
}

export default FeedPostCard
