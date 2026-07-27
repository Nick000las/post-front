import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ClientFormSheet({ open, onOpenChange, mode, client, isSubmitting, onCreate, onUpdate }) {
  const isEdit = mode === 'edit'

  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) return
    setName(isEdit && client ? client.name ?? '' : '')
  }, [open, isEdit, client])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Informe o nome do cliente')
      return
    }

    if (!isEdit) {
      const ok = await onCreate({ name: trimmed })
      if (ok) onOpenChange(false)
      return
    }

    if (trimmed === client.name) {
      onOpenChange(false)
      return
    }

    const ok = await onUpdate(client.id, { name: trimmed })
    if (ok) onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar cliente' : 'Novo cliente'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Altere o nome do cliente.' : 'Adicione um novo cliente à sua agência.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="client-name">Nome</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ex: Padaria do João"
              autoFocus
            />
          </div>

          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default ClientFormSheet
