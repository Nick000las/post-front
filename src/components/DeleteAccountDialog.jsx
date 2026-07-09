import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PLATFORMS } from '@/lib/platforms'

function DeleteAccountDialog({ open, onOpenChange, account, isDeleting, onConfirm }) {
  const platformMeta = PLATFORMS.find((p) => p.id === account?.platform)

  const handleConfirm = async () => {
    const ok = await onConfirm(account.id)
    if (ok) onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Excluir conta</SheetTitle>
          <SheetDescription>Essa ação não pode ser desfeita.</SheetDescription>
        </SheetHeader>

        {account && (
          <div className="mt-6 rounded-lg border px-3 py-2.5">
            <p className="text-sm font-medium text-foreground">{account.name}</p>
            <p className="text-sm text-muted-foreground">{platformMeta?.name ?? account.platform}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DeleteAccountDialog
