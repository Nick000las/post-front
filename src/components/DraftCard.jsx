import { useState } from 'react'
import { Loader2, Pencil, Trash2, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ConfirmActionSheet from '@/components/ConfirmActionSheet'
import MediaCarousel from '@/components/MediaCarousel'
import { PLATFORMS } from '@/lib/platforms'

function DraftCard({ draft, isUpdating, isDeleting, isPublishing, onUpdateCaption, onDelete, onPublish, extraAction }) {
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [captionDraft, setCaptionDraft] = useState(draft.caption ?? '')
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isBusy = isUpdating || isDeleting || isPublishing
  const accountCount = draft.accounts?.length ?? 0
  // O "Finalizar Post" (extraAction) manda o rascunho de volta pro fluxo de
  // publicação principal, que tem seu próprio MediaDropzone pra anexar — aqui
  // só precisamos impedir publicar direto sem mídia.
  const hasMedia = (draft.media?.length ?? 0) > 0

  const startEditingCaption = () => {
    setCaptionDraft(draft.caption ?? '')
    setIsEditingCaption(true)
  }

  const handleSaveCaption = async () => {
    const ok = await onUpdateCaption(draft.id, captionDraft)
    if (ok) setIsEditingCaption(false)
  }

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-3">
        <MediaCarousel
          media={draft.media ?? []}
          variant="cover"
          emptyLabel="Nenhuma mídia anexada"
          className="w-full rounded-lg max-h-64 object-cover"
        />

        {isEditingCaption ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isUpdating}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCaption(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={handleSaveCaption} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-foreground whitespace-pre-wrap flex-1">
              {draft.caption?.trim() ? draft.caption : <span className="text-muted-foreground">Sem legenda</span>}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startEditingCaption}
              disabled={isBusy}
              aria-label="Editar legenda"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {draft.accounts?.map((account) => {
            const platformMeta = PLATFORMS.find((p) => p.id === account.platform)
            return (
              <Badge key={account.id} variant="secondary">
                {account.name} · {platformMeta?.name ?? account.platform}
              </Badge>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Criado em {new Date(draft.created_at).toLocaleDateString('pt-BR')} · Atualizado em{' '}
          {new Date(draft.updated_at).toLocaleDateString('pt-BR')}
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isBusy}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Excluir
          </Button>
          {extraAction}
          <Button
            type="button"
            size="sm"
            onClick={() => setShowPublishConfirm(true)}
            disabled={isBusy || !hasMedia}
            title={!hasMedia ? 'Anexe uma mídia antes de publicar' : undefined}
          >
            <Send className="h-4 w-4 shrink-0" />
            Publicar
          </Button>
        </div>
      </CardContent>

      <ConfirmActionSheet
        open={showPublishConfirm}
        onOpenChange={setShowPublishConfirm}
        title="Publicar rascunho"
        description={`Isso vai publicar o rascunho para ${accountCount} conta(s) vinculada(s).`}
        confirmText="Confirmar publicação"
        loadingText="Publicando..."
        isLoading={isPublishing}
        onConfirm={() => onPublish(draft.id, draft.accounts ?? [])}
      />

      <ConfirmActionSheet
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir rascunho"
        description="Essa ação não pode ser desfeita."
        confirmText="Excluir"
        loadingText="Excluindo..."
        isLoading={isDeleting}
        onConfirm={() => onDelete(draft.id)}
        variant="destructive"
      />
    </Card>
  )
}

export default DraftCard
