import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AccountFormSheet from '@/components/AccountFormSheet'
import DeleteAccountDialog from '@/components/DeleteAccountDialog'
import { useClientAccounts } from '@/hooks/useClientAccounts'
import { createAccount, updateAccount, deleteAccount } from '@/api/accounts'
import { PLATFORMS } from '@/lib/platforms'

function ClientContasTab() {
  const { clientId } = useOutletContext()
  const { accounts, status, error, refetch } = useClientAccounts(clientId)

  const [formSheet, setFormSheet] = useState(null) // { mode, account } | null
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const create = async (dados) => {
    setIsCreating(true)
    try {
      await createAccount(dados, clientId)
      toast.success('Conta criada com sucesso!')
      refetch()
      return true
    } catch (err) {
      toast.error('Falha ao criar conta', { description: err.message })
      return false
    } finally {
      setIsCreating(false)
    }
  }

  const update = async (id, dados) => {
    setUpdatingId(id)
    try {
      await updateAccount(id, dados, clientId)
      toast.success('Conta atualizada com sucesso!')
      refetch()
      return true
    } catch (err) {
      toast.error('Falha ao atualizar conta', { description: err.message })
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const remove = async (id) => {
    setDeletingId(id)
    try {
      await deleteAccount(id, clientId)
      toast.success('Conta excluída com sucesso!')
      refetch()
      return true
    } catch (err) {
      toast.error('Falha ao excluir conta', { description: err.message })
      return false
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={() => setFormSheet({ mode: 'create', account: null })}>
          <Plus className="h-4 w-4 shrink-0" />
          Conectar conta
        </Button>
      </div>

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
          Nenhuma conta conectada para este cliente.
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
                      {platformMeta?.name ?? account.platform} · {account.platform_account_id} ·{' '}
                      {new Date(account.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormSheet({ mode: 'edit', account })}
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
        isSubmitting={formSheet?.mode === 'create' ? isCreating : updatingId === formSheet?.account?.id}
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

export default ClientContasTab
