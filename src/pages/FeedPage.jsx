import { Loader2, AlertCircle } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard'
import Pagination from '@/components/Pagination'
import { useFeedManagement } from '@/hooks/useFeedManagement'

function FeedPage() {
  const { feed, pagination, status, error, page, goToNextPage, goToPreviousPage, refetch } = useFeedManagement()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Feed</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os posts publicados pela equipe e identifique falhas de publicação.
        </p>
      </header>

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
        <p className="py-16 text-center text-sm text-muted-foreground">Nenhum post publicado ainda.</p>
      )}

      {status === 'success' && feed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feed.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {status === 'success' && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          disabled={status === 'loading'}
        />
      )}
    </div>
  )
}

export default FeedPage
