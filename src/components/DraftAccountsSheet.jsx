import { useState } from 'react'
import { AlertCircle, Link2, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useClientAccounts } from '@/hooks/useClientAccounts'
import { PLATFORMS } from '@/lib/platforms'

// Diferente do AccountDrawer (que lista as contas de UMA plataforma no fluxo de publicação), aqui
// as contas do cliente aparecem todas juntas: um draft pode ter contas de redes diferentes.
function DraftAccountsSheet({ post, clientId, onSave, isSaving }) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const { accounts, status, error, refetch } = useClientAccounts(clientId)

  const handleOpenChange = (next) => {
    // Re-semeia a cada abertura: o modal que hospeda o sheet fica montado entre aberturas.
    if (next) setSelectedIds(post.accounts?.map((account) => account.id) ?? [])
    setOpen(next)
  }

  const toggleAccount = (accountId) => {
    setSelectedIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    )
  }

  const handleSave = async () => {
    const ok = await onSave(selectedIds)
    if (ok) setOpen(false)
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(true)}>
              <Link2 className="h-4 w-4 shrink-0" />
              Vincular contas
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vinculação de contas ainda não disponível</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Vincular contas</SheetTitle>
            <SheetDescription>
              Escolha as contas que vão receber este post quando ele for publicado.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-4">
            {status === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando contas...
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
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

            {status === 'success' && accounts.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma conta conectada para este cliente.
              </p>
            )}

            {status === 'success' && accounts.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  {accounts.map((account) => {
                    const platformMeta = PLATFORMS.find((p) => p.id === account.platform?.toLowerCase())
                    const Icon = platformMeta?.icon
                    return (
                      <label
                        key={account.id}
                        htmlFor={`draft-account-${account.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted"
                      >
                        <Checkbox
                          id={`draft-account-${account.id}`}
                          checked={selectedIds.includes(account.id)}
                          onCheckedChange={() => toggleAccount(account.id)}
                          disabled={isSaving}
                        />
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-foreground" />}
                        <span className="text-sm font-medium text-foreground">{account.name}</span>
                      </label>
                    )
                  })}
                </div>

                <Button type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar contas'
                  )}
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default DraftAccountsSheet
