import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import ClientAvatar from '@/components/ClientAvatar'

function PublishAsClientSelect({ clients, clientsStatus, selectedClientId, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="publish-as-client">Publicar como:</Label>
      <Select
        value={selectedClientId != null ? String(selectedClientId) : undefined}
        onValueChange={(value) => onChange(value)}
        disabled={clientsStatus === 'loading'}
      >
        <SelectTrigger id="publish-as-client" className="w-full max-w-sm">
          <SelectValue
            placeholder={clientsStatus === 'loading' ? 'Carregando clientes...' : 'Selecione um cliente'}
          />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={String(client.id)}>
              <span className="flex items-center gap-2">
                <ClientAvatar name={client.name} size="sm" />
                {client.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default PublishAsClientSelect
