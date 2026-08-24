import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PLATFORMS } from '@/lib/platforms'
import { useCharacterLimit } from '@/hooks/useCharacterLimit'

function CaptionField({ value, onChange, selectedPlatforms }) {
  const length = value.length
  const { limit, strictestPlatformId, isWarning, isOverLimit } = useCharacterLimit(selectedPlatforms, length)
  const strictestName = PLATFORMS.find((p) => p.id === strictestPlatformId)?.name

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
        {/* Sem maxLength no textarea: o limite muda conforme as redes marcadas, e cortar o texto
            que o usuário já escreveu ao marcar uma rede mais restrita seria perda de trabalho.
            Quem barra o envio é o canPublish. */}
        <span
          className={cn(
            'absolute bottom-2 right-3 text-xs select-none',
            isOverLimit
              ? 'text-destructive font-semibold'
              : isWarning
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {length}/{limit}
          {strictestName && <span className="ml-1 opacity-70">({strictestName})</span>}
        </span>
      </div>
    </div>
  )
}

export default CaptionField
