import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PLATFORMS } from '@/lib/platforms'

function PlatformSelector({
  selectedPlatforms,
  onToggle,
  onOpenDrawer,
  accountLabels,
  disabled: disabledAll = false,
  disabledPlatformIds = [],
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Publicar em
      </label>
      <Card>
        <CardContent className="p-3 flex flex-col gap-2">
          {PLATFORMS.map(({ id, name, icon: Icon, disabled: platformDisabled, comingSoon }) => {
            const isChecked = selectedPlatforms.has(id)
            // Rede sem suporte ao formato atual (ex.: TikTok/LinkedIn em Story) — o bloqueio
            // real acontece no submit (getStoryPlatformConflicts), aqui é o aviso visual.
            const unsupported = disabledPlatformIds.includes(id)
            const disabled = platformDisabled || disabledAll || unsupported

            return (
              <div
                key={id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted cursor-pointer'
                )}
                onClick={() => {
                  if (disabled) return
                  if (isChecked) onOpenDrawer(id)
                  else onToggle(id)
                }}
              >
                <Checkbox
                  id={`platform-${id}`}
                  checked={isChecked}
                  onCheckedChange={() => !disabled && onToggle(id)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={disabled}
                  aria-label={name}
                />
                <Icon className="h-5 w-5 text-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">
                  {name}
                </span>
                {comingSoon && (
                  <Badge variant="secondary" className="text-xs">
                    Em breve
                  </Badge>
                )}
                {unsupported && (
                  <Badge variant="secondary" className="text-xs">
                    Sem suporte a Story
                  </Badge>
                )}
                {!disabled && isChecked && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {accountLabels[id] ?? 'Selecionar conta'}
                  </span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default PlatformSelector
