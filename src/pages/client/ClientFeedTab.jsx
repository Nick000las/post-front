import { useOutletContext } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard'
import ClientFeedFilters from '@/components/ClientFeedFilters'
import Pagination from '@/components/Pagination'
import { useClientFeed } from '@/hooks/useClientFeed'

function ClientFeedTab() {
  const { clientId } = useOutletContext()
  const { feed, pagination, status, error, page, filters, setFilters, goToNextPage, goToPreviousPage, refetch } =
    useClientFeed(clientId)

  return (
    <div>
      <div className="mb-6">
        <ClientFeedFilters
          platform={filters.platform}
          month={filters.month}
          year={filters.year}
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
        <p className="py-16 text-center text-sm text-muted-foreground">Nenhum post encontrado para este cliente.</p>
      )}

      {status === 'success' && feed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feed.map((post) => (
            <FeedPostCard key={post.id} post={post} showAuthor={false} />
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

export default ClientFeedTab
