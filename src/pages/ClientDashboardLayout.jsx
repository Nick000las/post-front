import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ClientAvatar from '@/components/ClientAvatar'
import ClientFormSheet from '@/components/ClientFormSheet'
import { useClients } from '@/hooks/useClients'
import { cn } from '@/lib/utils'

const TABS = [
  { to: 'workflow', label: 'Workflow' },
  { to: 'rascunhos', label: 'Rascunhos' },
  { to: 'lab-ia', label: 'Lab de IA' },
  { to: 'contas', label: 'Contas Conectadas' },
]

function ClientDashboardLayout() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { clients, status, updatingId, update } = useClients()
  const [editOpen, setEditOpen] = useState(false)

  const client = clients.find((c) => String(c.id) === String(clientId))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      <header className="mb-6 flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate('/clientes')}
          aria-label="Voltar para clientes"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {status === 'loading' && !client ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <ClientAvatar name={client?.name} size="lg" />
            <h1 className="flex-1 text-2xl font-bold tracking-tight text-foreground truncate">
              {client?.name ?? 'Cliente'}
            </h1>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              disabled={!client}
              aria-label="Editar cliente"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </>
        )}
      </header>

      <nav className="mb-6 flex gap-1 border-b overflow-x-auto">
        {TABS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ clientId, client }} />

      <ClientFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        client={client}
        isSubmitting={updatingId === client?.id}
        onUpdate={update}
      />
    </div>
  )
}

export default ClientDashboardLayout
