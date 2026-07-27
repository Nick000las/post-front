import { FileText, Sparkles, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Protótipo visual: não há backend para processar documentos ou gerar
// sugestões de IA. Nenhuma chamada de API — conteúdo estático apenas.
const SUGGESTIONS = [
  {
    id: 1,
    title: 'Legenda para post de lançamento',
    text: 'Chegou o que você esperava! Nossa nova coleção une conforto e estilo em cada peça. Corre garantir a sua 🛍️✨ #NovaColeção',
  },
  {
    id: 2,
    title: 'Ideia de reels',
    text: 'Mostre os bastidores da produção em um vídeo rápido de 15s com música em alta, revelando o produto no final.',
  },
  {
    id: 3,
    title: 'Sugestão de hashtags',
    text: '#moda #tendência #lookdodia #estilo #novidade #coleção2026',
  },
]

function ClientLabIaTab() {
  return (
    <div>
      <Badge variant="secondary" className="mb-4">
        Protótipo visual — recurso ainda não disponível
      </Badge>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">Documento base</h3>
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste um PDF ou Word aqui para gerar sugestões
            </p>
            <Button type="button" variant="outline" size="sm" disabled>
              <FileText className="h-4 w-4 shrink-0" />
              Selecionar arquivo
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Sugestões geradas
          </h3>
          <div className="flex flex-col gap-3">
            {SUGGESTIONS.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-3 flex flex-col gap-1.5">
                  <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientLabIaTab
