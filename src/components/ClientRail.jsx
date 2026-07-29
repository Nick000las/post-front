import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import ClientAvatar from '@/components/ClientAvatar'
import ClientFormSheet from '@/components/ClientFormSheet'
import { useClients } from '@/hooks/useClients'
import { cn } from '@/lib/utils'

function ClientRail() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const { clients, status, isCreating, create } = useClients()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <aside className="w-16 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0 items-center py-4 gap-3">
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto w-full items-center">
        {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}

        <TooltipProvider delayDuration={200}>
          {clients.map((client) => {
            const isActive = String(client.id) === String(clientId)
            return (
              <Tooltip key={client.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => navigate(`/clientes/${client.id}`)}
                    className={cn(
                      'flex items-center justify-center rounded-full p-0.5 border-2 transition-all',
                      isActive ? 'border-primary' : 'border-transparent opacity-80 hover:opacity-100'
                    )}
                  >
                    <ClientAvatar name={client.name} size="md" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{client.name}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>

      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        aria-label="Adicionar cliente"
      >
        <Plus className="h-5 w-5" />
      </button>

      <ClientFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
        isSubmitting={isCreating}
        onCreate={create}
      />
    </aside>
  )
}

export default ClientRail
