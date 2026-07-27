import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// TODO: aguardando endpoint de workflow_stage por cliente no backend.
// Enquanto isso, é um mock puramente visual — estado local, sem persistência
// (recarregar a página reseta) e sem chamada de API.
const COLUMNS = [
  { id: 'ideias', title: 'Ideias' },
  { id: 'design', title: 'Design' },
  { id: 'aprovacao', title: 'Aprovação' },
  { id: 'agendado', title: 'Agendado' },
]

const INITIAL_CARDS = [
  { id: 1, title: 'Post de lançamento — coleção verão', column: 'ideias' },
  { id: 2, title: 'Reels bastidores do estúdio', column: 'ideias' },
  { id: 3, title: 'Carrossel de depoimentos', column: 'design' },
  { id: 4, title: 'Promoção de Dia dos Pais', column: 'aprovacao' },
  { id: 5, title: 'Story enquete de produtos', column: 'agendado' },
]

function nextColumn(columnId) {
  const idx = COLUMNS.findIndex((c) => c.id === columnId)
  return COLUMNS[idx + 1]?.id ?? null
}

function ClientWorkflowTab() {
  const [cards, setCards] = useState(INITIAL_CARDS)

  const moveCard = (cardId) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card
        const target = nextColumn(card.column)
        return target ? { ...card, column: target } : card
      })
    )
  }

  return (
    <div>
      <Badge variant="secondary" className="mb-4">
        Protótipo visual — sem persistência real
      </Badge>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnCards = cards.filter((c) => c.column === column.id)
          return (
            <div key={column.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                <span className="text-xs text-muted-foreground">{columnCards.length}</span>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-24">
                {columnCards.map((card) => {
                  const canMove = nextColumn(card.column) !== null
                  return (
                    <Card key={card.id}>
                      <CardContent className="p-3 flex flex-col gap-2">
                        <p className="text-sm text-foreground">{card.title}</p>
                        {canMove && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="self-end h-7 px-2 text-xs"
                            onClick={() => moveCard(card.id)}
                          >
                            Avançar
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ClientWorkflowTab
