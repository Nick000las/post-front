import { useState } from 'react'
import { Loader2, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AccountFormSheet from '@/components/AccountFormSheet'
import DeleteAccountDialog from '@/components/DeleteAccountDialog'
import { useAccountsManagement } from '@/hooks/useAccountsManagement'
import { PLATFORMS } from '@/lib/platforms'

function AccountsManagementPage() {
  const {
    accounts,
    status,
    error,
    isCreating,
    updatingId,
    deletingId,
    create,
    update,
    remove,
    refetch,
  } = useAccountsManagement()

  const [formSheet, setFormSheet] = useState(null) // { mode: 'create' | 'edit', account } | null
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreateSheet = () => setFormSheet({ mode: 'create', account: null })
  const openEditSheet = (account) => setFormSheet({ mode: 'edit', account })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contas conectadas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as contas de redes sociais usadas para publicar.
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="h-4 w-4 shrink-0" />
          Nova conta
        </Button>
      </header>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando contas...
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

      {status === 'success' && accounts.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhuma conta conectada ainda.
        </p>
      )}

      {status === 'success' && accounts.length > 0 && (
        <Card>
          <CardContent className="p-3 flex flex-col gap-2">
            {accounts.map((account) => {
              const platformMeta = PLATFORMS.find((p) => p.id === account.platform)
              const Icon = platformMeta?.icon
              const isUpdating = updatingId === account.id
              const isDeleting = deletingId === account.id

              return (
                <div key={account.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  {Icon && <Icon className="h-5 w-5 text-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {platformMeta?.name ?? account.platform} · {account.instagram_user_id} ·{' '}
                      {new Date(account.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditSheet(account)}
                    disabled={isUpdating || isDeleting}
                    aria-label="Editar conta"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(account)}
                    disabled={isUpdating || isDeleting}
                    aria-label="Excluir conta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <AccountFormSheet
        open={formSheet !== null}
        onOpenChange={(open) => !open && setFormSheet(null)}
        mode={formSheet?.mode ?? 'create'}
        account={formSheet?.account ?? null}
        isSubmitting={
          formSheet?.mode === 'create' ? isCreating : updatingId === formSheet?.account?.id
        }
        onCreate={create}
        onUpdate={update}
      />

      <DeleteAccountDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        account={deleteTarget}
        isDeleting={deletingId === deleteTarget?.id}
        onConfirm={remove}
      />
    </div>
  )
}

export default AccountsManagementPage
