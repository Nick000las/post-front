import { useState } from 'react'
import { CalendarClock, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function combineDateTime(date, time) {
  if (!date) return null
  const [hours, minutes] = (time || '').split(':').map(Number)
  const result = new Date(date)
  result.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0)
  return result
}

function ScheduleButton({ disabled, isScheduling, onConfirm }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState('12:00')

  const scheduledDate = combineDateTime(date, time)
  const isValid = scheduledDate instanceof Date && scheduledDate.getTime() > Date.now()

  const handleConfirm = async () => {
    const ok = await onConfirm(scheduledDate)
    if (ok) {
      setOpen(false)
      setDate(null)
      setTime('12:00')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled || isScheduling}>
          <CalendarClock className="h-4 w-4 shrink-0" />
          Agendar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="flex flex-col gap-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: new Date() }}
            required={false}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-time">Horário</Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isScheduling}
            />
          </div>

          <Button type="button" onClick={handleConfirm} disabled={!isValid || isScheduling}>
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Agendando...
              </>
            ) : (
              'Confirmar agendamento'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ScheduleButton
