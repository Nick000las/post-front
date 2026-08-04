import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import ClientAvatar from '@/components/ClientAvatar'
import { GLOBAL_DATE_OPTIONS, GLOBAL_STATUS_OPTIONS } from '@/lib/feedFilterOptions'

const CLIENT_FILTER_ALL = 'all'

function GlobalFeedFilters({ status, clientId, date, clients, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-status">Status</Label>
        <Select value={status} onValueChange={(value) => onChange({ status: value })}>
          <SelectTrigger id="filter-status" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GLOBAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-client">Cliente</Label>
        <Select
          value={clientId || CLIENT_FILTER_ALL}
          onValueChange={(value) => onChange({ clientId: value === CLIENT_FILTER_ALL ? '' : value })}
        >
          <SelectTrigger id="filter-client" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLIENT_FILTER_ALL}>Todos os clientes</SelectItem>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-date">Data</Label>
        <Select value={date || CLIENT_FILTER_ALL} onValueChange={(value) => onChange({ date: value === CLIENT_FILTER_ALL ? '' : value })}>
          <SelectTrigger id="filter-date" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLIENT_FILTER_ALL}>Qualquer data</SelectItem>
            {GLOBAL_DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default GlobalFeedFilters
