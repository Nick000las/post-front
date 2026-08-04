import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PLATFORMS } from '@/lib/platforms'
import ClientFeedPeriodFilter from '@/components/ClientFeedPeriodFilter'

const PLATFORM_FILTER_ALL = 'all'

function ClientFeedFilters({ platform, month, year, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-platform">Rede social</Label>
        <Select
          value={platform || PLATFORM_FILTER_ALL}
          onValueChange={(value) => onChange({ platform: value === PLATFORM_FILTER_ALL ? '' : value })}
        >
          <SelectTrigger id="filter-platform" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PLATFORM_FILTER_ALL}>Todas as redes</SelectItem>
            {PLATFORMS.map((platformOption) => (
              <SelectItem key={platformOption.id} value={platformOption.id}>
                {platformOption.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Período</Label>
        <ClientFeedPeriodFilter month={month} year={year} onChange={onChange} />
      </div>
    </div>
  )
}

export default ClientFeedFilters
