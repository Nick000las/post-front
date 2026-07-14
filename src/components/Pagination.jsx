import { Button } from '@/components/ui/button'

function Pagination({ page, totalPages, onPrevious, onNext, disabled }) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={disabled || page <= 1}>
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={disabled || page >= totalPages}>
        Próxima
      </Button>
    </div>
  )
}

export default Pagination
