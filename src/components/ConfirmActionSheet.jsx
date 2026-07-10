import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

function ConfirmActionSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  loadingText = 'Processando...',
  isLoading,
  onConfirm,
  variant = 'default',
}) {
  const handleConfirm = async () => {
    const ok = await onConfirm()
    if (ok) onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {children && <div className="mt-6">{children}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant={variant} onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ConfirmActionSheet
