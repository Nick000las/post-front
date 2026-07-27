import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ClientAvatar from '@/components/ClientAvatar'
import ClientFormSheet from '@/components/ClientFormSheet'
import { useClients } from '@/hooks/useClients'

function ClientsPage() {
  const navigate = useNavigate()
  const { clients, status, error, isCreating, create, refetch } = useClients()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Seus Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os clientes da sua agência.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 shrink-0" />
          Adicionar Cliente
        </Button>
      </header>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando clientes...
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

      {status === 'success' && clients.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhum cliente cadastrado ainda.
        </p>
      )}

      {status === 'success' && clients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card
              key={client.id}
              onClick={() => navigate(`/clientes/${client.id}`)}
              className="cursor-pointer transition-colors hover:bg-muted/50"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <ClientAvatar name={client.name} size="lg" />
                <p className="text-base font-medium text-foreground truncate">{client.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
        isSubmitting={isCreating}
        onCreate={create}
      />
    </div>
  )
}

export default ClientsPage
