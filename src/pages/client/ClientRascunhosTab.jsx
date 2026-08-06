import { useNavigate, useOutletContext } from 'react-router-dom'
import { Loader2, AlertCircle, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DraftCard from '@/components/DraftCard'
import { useDraftsManagement } from '@/hooks/useDraftsManagement'

function ClientRascunhosTab() {
  const { clientId } = useOutletContext()
  const navigate = useNavigate()
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
  } = useDraftsManagement(clientId)

  const finalizarPost = (draft) => {
    navigate('/publicar', { state: { draftId: draft.id, caption: draft.caption, clientId } })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando rascunhos...
      </div>
    )
  }

  if (status === 'error') {
    return (
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
    )
  }

  if (drafts.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Nenhum rascunho salvo para este cliente.
      </p>
    )
  }

  return (
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
          extraAction={
            <Button type="button" variant="outline" size="sm" onClick={() => finalizarPost(draft)}>
              <Wand2 className="h-4 w-4 shrink-0" />
              Finalizar Post
            </Button>
          }
        />
      ))}
    </div>
  )
}

export default ClientRascunhosTab
