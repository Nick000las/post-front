import { Camera, Globe, Briefcase, Music2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Camera,    disabled: false, comingSoon: false },
  { id: 'facebook',  name: 'Facebook',  icon: Globe,     disabled: true,  comingSoon: true },
  { id: 'linkedin',  name: 'LinkedIn',  icon: Briefcase, disabled: true,  comingSoon: true },
  { id: 'tiktok',    name: 'TikTok',    icon: Music2,    disabled: true,  comingSoon: true },
]

function PlatformSelector({ selectedPlatforms, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Publicar em
      </label>
      <Card>
        <CardContent className="p-3 flex flex-col gap-2">
          {PLATFORMS.map(({ id, name, icon: Icon, disabled, comingSoon }) => (
            <div
              key={id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-muted cursor-pointer'
              )}
              onClick={() => !disabled && onToggle(id)}
            >
              <Checkbox
                id={`platform-${id}`}
                checked={selectedPlatforms.has(id)}
                onCheckedChange={() => !disabled && onToggle(id)}
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default PlatformSelector
