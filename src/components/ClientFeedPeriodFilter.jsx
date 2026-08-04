import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MONTH_OPTIONS, getYearOptions } from '@/lib/feedFilterOptions'

const EMPTY = ''

function triggerLabel(month, year) {
  if (!month || !year) return 'Mês e ano'
  return `${MONTH_OPTIONS.find((option) => option.value === month)?.label} de ${year}`
}

// Mês e ano só têm efeito juntos (o backend só filtra por um par específico), então esse
// popover trata os dois como uma única decisão: fica em rascunho até "Aplicar" e só então
// vira um único onChange com os dois campos — nunca aplica um sem o outro.
function ClientFeedPeriodFilter({ month, year, onChange }) {
  const [open, setOpen] = useState(false)
  const [draftMonth, setDraftMonth] = useState(month)
  const [draftYear, setDraftYear] = useState(year)
  // Repassado aos Select internos como `container` — ver comentário em ui/select.jsx.
  const [popoverContentEl, setPopoverContentEl] = useState(null)

  const handleOpenChange = (next) => {
    if (next) {
      setDraftMonth(month)
      setDraftYear(year)
    }
    setOpen(next)
  }

  const handleApply = () => {
    onChange({ month: draftMonth, year: draftYear })
    setOpen(false)
  }

  const handleClear = () => {
    onChange({ month: EMPTY, year: EMPTY })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="justify-start font-normal">
          <CalendarDays className="h-4 w-4 shrink-0" />
          {triggerLabel(month, year)}
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={setPopoverContentEl} className="w-64 p-4" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-filter-month">Mês</Label>
            <Select value={draftMonth || EMPTY} onValueChange={setDraftMonth}>
              <SelectTrigger id="period-filter-month">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent container={popoverContentEl}>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-filter-year">Ano</Label>
            <Select value={draftYear || EMPTY} onValueChange={setDraftYear}>
              <SelectTrigger id="period-filter-year">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent container={popoverContentEl}>
                {getYearOptions().map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={handleClear}>
              Limpar
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={!draftMonth || !draftYear}
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ClientFeedPeriodFilter
