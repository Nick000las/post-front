import { useState } from 'react'
import { CalendarClock, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { combineDateTime, toTimeInputValue } from '@/lib/dateTime'
import { expandRecurrence, toIsoWithOffset } from '@/lib/recurrence'

// Convenção de Date.getDay(): 0=domingo .. 6=sábado — a mesma esperada por expandRecurrence.
const WEEKDAYS = [
  { value: 0, label: 'D' },
  { value: 1, label: 'S' },
  { value: 2, label: 'T' },
  { value: 3, label: 'Q' },
  { value: 4, label: 'Q' },
  { value: 5, label: 'S' },
  { value: 6, label: 'S' },
]

// Agendamento de Story: 1 data avulsa ou uma série semanal. A expansão da série em datas
// concretas é feita aqui no cliente (o backend só valida a lista pronta) — ver expandRecurrence.
function StorySchedulePicker({
  disabled,
  isScheduling,
  onConfirm,
  popoverContainer,
  label = 'Agendar',
  loadingLabel = 'Agendando...',
}) {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [time, setTime] = useState(toTimeInputValue(null))
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [weekdays, setWeekdays] = useState(new Set())
  const [endDate, setEndDate] = useState(null)

  const handleOpenChange = (next) => {
    if (next) {
      setStartDate(null)
      setTime(toTimeInputValue(null))
      setRepeatWeekly(false)
      setWeekdays(new Set())
      setEndDate(null)
    }
    setOpen(next)
  }

  const toggleWeekday = (value) => {
    setWeekdays((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const start = combineDateTime(startDate, time)
  const scheduledDates = repeatWeekly
    ? expandRecurrence({ startDate: start, weekdays: Array.from(weekdays), endDate })
    : start
      ? [toIsoWithOffset(start)]
      : []

  const isValid = repeatWeekly
    ? scheduledDates.length > 0
    : start instanceof Date && start.getTime() > Date.now()

  const handleConfirm = async () => {
    const ok = await onConfirm(scheduledDates)
    if (ok) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <CalendarClock className="h-4 w-4 shrink-0" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end" container={popoverContainer}>
        {/* Radix expõe a altura realmente disponível (calculada por colisão com a viewport)
            nessa CSS var — um max-h fixo (ex.: 70vh) não sabe se o gatilho está perto do rodapé,
            e o conteúdo (2 calendários + dias da semana quando "repetir" está marcado) passa
            fácil da tela nesse caso. Isso é o que fazia o popover "sair" da viewport. */}
        <div className="flex max-h-[var(--radix-popover-content-available-height)] flex-col gap-3 overflow-y-auto">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            disabled={{ before: new Date() }}
            required={false}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="story-schedule-time">Horário</Label>
            <Input
              id="story-schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isScheduling}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={repeatWeekly}
              onCheckedChange={(checked) => setRepeatWeekly(checked === true)}
              disabled={isScheduling}
            />
            Repetir semanalmente
          </label>

          {repeatWeekly && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Dias da semana</Label>
                <div className="flex gap-1">
                  {WEEKDAYS.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      size="sm"
                      variant={weekdays.has(day.value) ? 'default' : 'outline'}
                      onClick={() => toggleWeekday(day.value)}
                      disabled={isScheduling}
                      className="w-9 px-0"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Repetir até</Label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={{ before: startDate ?? new Date() }}
                  required={false}
                />
              </div>

              {scheduledDates.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {scheduledDates.length} ocorrência(s) serão agendadas.
                </p>
              ) : (
                <p className="text-xs text-destructive">
                  Nenhuma data cai nos dias escolhidos até o limite. Ajuste os dias ou a data final.
                </p>
              )}
            </>
          )}

          <Button type="button" onClick={handleConfirm} disabled={!isValid || isScheduling}>
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                {loadingLabel}
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default StorySchedulePicker
