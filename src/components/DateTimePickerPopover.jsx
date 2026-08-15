import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { combineDateTime, toTimeInputValue } from '@/lib/dateTime'

function DateTimePickerPopover({
  trigger,
  initialDate = null,
  isSubmitting,
  confirmText = 'Confirmar',
  loadingLabel = 'Enviando...',
  onConfirm,
  popoverContainer,
  align = 'end',
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(toTimeInputValue(initialDate))

  const handleOpenChange = (next) => {
    // Re-semeia a cada abertura, não só na montagem: o modal que hospeda esse
    // popover fica montado entre aberturas e o `initialDate` pode ter mudado.
    if (next) {
      setDate(initialDate)
      setTime(toTimeInputValue(initialDate))
    }
    setOpen(next)
  }

  const scheduledDate = combineDateTime(date, time)
  // Validação de UX apenas — o backend recusa data no passado de qualquer forma.
  const isValid = scheduledDate instanceof Date && scheduledDate.getTime() > Date.now()

  const handleConfirm = async () => {
    const ok = await onConfirm(scheduledDate)
    if (ok) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-4" align={align} container={popoverContainer}>
        <div className="flex flex-col gap-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: new Date() }}
            required={false}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="datetime-picker-time">Horário</Label>
            <Input
              id="datetime-picker-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button type="button" onClick={handleConfirm} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                {loadingLabel}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DateTimePickerPopover
