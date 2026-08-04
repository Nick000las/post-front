import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard'
import GlobalFeedFilters from '@/components/GlobalFeedFilters'
import Pagination from '@/components/Pagination'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useFeedManagement } from '@/hooks/useFeedManagement'
import { useClients } from '@/hooks/useClients'
import { republishPost } from '@/api/posts'

function FeedPage() {
  const { feed, pagination, status, error, page, filters, setFilters, goToNextPage, goToPreviousPage, refetch } =
    useFeedManagement()
  const { clients } = useClients()
  const [republishingId, setRepublishingId] = useState(null)

  const handleRepublish = async (post) => {
    setRepublishingId(post.id)
    try {
      await republishPost(post.id, post.author?.id)
      toast.success('Post republicado com sucesso!')
      refetch()
    } catch (err) {
      toast.error('Falha ao republicar post', { description: err.message })
    } finally {
      setRepublishingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Feed Global</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os posts publicados de todos os clientes e identifique falhas de publicação.
        </p>
      </header>

      <div className="mb-6">
        <GlobalFeedFilters
          status={filters.status}
          clientId={filters.clientId}
          date={filters.date}
          clients={clients}
          onChange={setFilters}
        />
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando feed...
        </div>
      )}

      {status === 'error' && (
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
      )}

      {status === 'success' && feed.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Nenhum post encontrado.</p>
      )}

      {status === 'success' && feed.length > 0 && (
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feed.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onRepublish={handleRepublish}
                isRepublishing={republishingId === post.id}
              />
            ))}
          </div>
        </TooltipProvider>
      )}

      {status === 'success' && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          disabled={status === 'loading' || republishingId !== null}
        />
      )}
    </div>
  )
}

export default FeedPage
