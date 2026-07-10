import { Loader2, AlertCircle } from 'lucide-react'
import DraftCard from '@/components/DraftCard'
import { useDraftsManagement } from '@/hooks/useDraftsManagement'

function DraftsPage() {
  const {
    drafts,
    status,
    error,
    updatingId,
    deletingId,
    publishingId,
    updateCaption,
    remove,
    publish,
    refetch,
  } = useDraftsManagement()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Rascunhos</h1>
        <p className="text-muted-foreground mt-1">
          Continue de onde parou ou publique um rascunho salvo.
        </p>
      </header>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando rascunhos...
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

      {status === 'success' && drafts.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhum rascunho salvo ainda.
        </p>
      )}

      {status === 'success' && drafts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              isUpdating={updatingId === draft.id}
              isDeleting={deletingId === draft.id}
              isPublishing={publishingId === draft.id}
              onUpdateCaption={updateCaption}
              onDelete={remove}
              onPublish={publish}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DraftsPage
