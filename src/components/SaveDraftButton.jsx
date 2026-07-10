import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SaveDraftButton({ canSave, isSavingDraft, onClick }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="flex-1 h-11 text-base"
      disabled={!canSave}
      onClick={onClick}
    >
      {isSavingDraft ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
          Salvando rascunho...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4 shrink-0" />
          Salvar como rascunho
        </>
      )}
    </Button>
  )
}

export default SaveDraftButton
