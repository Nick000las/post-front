import { Loader2, AlertCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'

function AccountDrawer({
  open,
  onOpenChange,
  platformName,
  accounts,
  status,
  error,
  selectedAccountIds = [],
  onToggleAccount,
  onRetry,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Contas do {platformName}</SheetTitle>
          <SheetDescription>
            Escolha as contas que serão usadas para publicar.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
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
                onClick={onRetry}
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {status === 'success' && accounts.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma conta conectada para o {platformName}.
            </p>
          )}

          {status === 'success' && accounts.length > 0 && (
            <div className="flex flex-col gap-2">
              {accounts.map((account) => {
                const isChecked = selectedAccountIds.includes(account.id)
                return (
                  <label
                    key={account.id}
                    htmlFor={`account-${account.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted"
                  >
                    <Checkbox
                      id={`account-${account.id}`}
                      checked={isChecked}
                      onCheckedChange={() => onToggleAccount(account.id)}
                    />
                    <span className="text-sm font-medium text-foreground">{account.name}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AccountDrawer
