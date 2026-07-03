import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MAX_CHARS = 2200
const WARN_THRESHOLD = 2100

function CaptionField({ value, onChange }) {
  const length = value.length
  const isWarning = length >= WARN_THRESHOLD
  const isAtLimit = length >= MAX_CHARS

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">
        Legenda
      </label>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escreva a legenda do seu post..."
          rows={5}
          className="resize-none pr-2 pb-6"
        />
        <span
          className={cn(
            'absolute bottom-2 right-3 text-xs select-none',
            isAtLimit
              ? 'text-destructive font-semibold'
              : isWarning
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  )
}

export default CaptionField
