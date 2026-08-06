import { useState } from 'react'
import { CalendarDays, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FORMAT_OPTIONS } from '@/lib/postFormat'
import { localDateToIsoDay, suggestedDateToLocalMidnight } from '@/lib/suggestedDate'

const FORMAT_NONE = 'none'

// Tudo é editável direto, sem modo "editar/salvar": nada aqui está persistido — a lista só vira
// post de verdade no "Importar" da tela.
function AiLabReviewItem({ item, onChange, onRemove, disabled }) {
  const [dateOpen, setDateOpen] = useState(false)
  const selectedDate = suggestedDateToLocalMidnight(item.suggestedDate)

  const handleSelectDate = (date) => {
    onChange({ suggestedDate: localDateToIsoDay(date) })
    setDateOpen(false)
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3">
        <Textarea
          value={item.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          rows={4}
          className="resize-none"
          disabled={disabled}
          aria-label="Legenda do post"
        />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`format-${item.localId}`}>Formato</Label>
            <Select
              value={item.format ?? FORMAT_NONE}
              onValueChange={(value) => onChange({ format: value === FORMAT_NONE ? null : value })}
              disabled={disabled}
            >
              <SelectTrigger id={`format-${item.localId}`} className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FORMAT_NONE}>Sem formato</SelectItem>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Data sugerida</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="font-normal" disabled={disabled}>
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Sem data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="flex flex-col gap-2">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleSelectDate} required={false} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { onChange({ suggestedDate: null }); setDateOpen(false) }}
                  >
                    Limpar data
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remover post da lista"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AiLabReviewItem
