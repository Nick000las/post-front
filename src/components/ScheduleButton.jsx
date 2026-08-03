import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DateTimePickerPopover from '@/components/DateTimePickerPopover'

function ScheduleButton({ disabled, isScheduling, onConfirm, popoverContainer }) {
  return (
    <DateTimePickerPopover
      trigger={
        <Button type="button" variant="outline" disabled={disabled || isScheduling}>
          <CalendarClock className="h-4 w-4 shrink-0" />
          Agendar
        </Button>
      }
      isSubmitting={isScheduling}
      confirmText="Confirmar agendamento"
      loadingLabel="Agendando..."
      onConfirm={onConfirm}
      popoverContainer={popoverContainer}
    />
  )
}

export default ScheduleButton
