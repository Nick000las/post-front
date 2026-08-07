import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMediaUrl } from '@/lib/media'

// Único componente de carrossel de mídia do app: modo "cover" (card do Kanban/Feed,
// só a capa + selo de contagem) e modo "detail" (popup — imagem principal + faixa de
// miniaturas). O índice selecionado vive só aqui, nunca no componente pai. Edição
// (excluir item / adicionar) só aparece se o pai passar onRemoveItem/onAddClick —
// o componente não sabe (nem precisa saber) se o post é rascunho ou não.
function MediaCarousel({
  media,
  variant,
  className,
  emptyLabel = 'Sem mídia',
  emptyHint,
  onRemoveItem,
  removingItemId,
  onAddClick,
  disabled = false,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  // Deriva em vez de sincronizar via efeito: some um item removido não deixa
  // o índice apontando pra fora do array por um render sequer.
  const safeIndex = Math.min(selectedIndex, Math.max(media.length - 1, 0))
  const current = media[safeIndex]

  if (variant === 'cover') {
    if (media.length === 0) {
      // Placeholder vazio precisa de uma altura fixa pra ocupar o mesmo espaço
      // que a imagem ocuparia — className só traz max-h-* (teto, não piso),
      // que não força altura nenhuma numa div sem conteúdo com essa altura.
      const emptyClassName = className?.replace(/max-h-/g, 'h-')
      return (
        <div className={cn('flex flex-col items-center justify-center gap-1 bg-muted/50 text-muted-foreground', emptyClassName)}>
          <ImageOff className="h-5 w-5" />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      )
    }

    return (
      <div className="relative">
        <img
          src={getMediaUrl(media[0], { thumb: true })}
          alt={media[0].file_name}
          draggable={false}
          className={cn('pointer-events-none', className)}
        />
        {media.length > 1 && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            1/{media.length}
          </span>
        )}
      </div>
    )
  }

  const isVideo = current?.file_type?.startsWith('video/')
  const showNav = media.length > 1
  const showThumbStrip = media.length > 0 || !!onAddClick

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg',
          !current && 'border-2 border-dashed border-border bg-muted/30'
        )}
      >
        {current ? (
          isVideo ? (
            <video src={getMediaUrl(current)} controls className={cn('rounded-lg bg-black', className)} />
          ) : (
            <img src={getMediaUrl(current)} alt={current.file_name} className={cn('rounded-lg', className)} />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <p className="text-sm font-medium">{emptyLabel}</p>
            {emptyHint && <p className="text-xs">{emptyHint}</p>}
          </div>
        )}

        {showNav && (
          <>
            <button
              type="button"
              onClick={() => setSelectedIndex((safeIndex - 1 + media.length) % media.length)}
              disabled={disabled}
              aria-label="Mídia anterior"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex((safeIndex + 1) % media.length)}
              disabled={disabled}
              aria-label="Próxima mídia"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {showThumbStrip && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              disabled={disabled}
              aria-label={`Selecionar mídia ${index + 1}`}
              className={cn(
                'group/thumb relative h-12 w-12 shrink-0 overflow-hidden rounded-md border',
                index === safeIndex && 'ring-2 ring-primary'
              )}
            >
              <img src={getMediaUrl(item, { thumb: true })} alt="" className="h-full w-full object-cover" />

              {onRemoveItem && removingItemId !== item.id && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemoveItem(item.id) } }}
                  aria-label="Remover mídia"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-destructive-foreground opacity-0 transition-opacity group-hover/thumb:opacity-100"
                >
                  <X className="h-5 w-5 rounded-full bg-destructive p-0.5" />
                </span>
              )}

              {removingItemId === item.id && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </span>
              )}
            </button>
          ))}

          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              disabled={disabled}
              aria-label="Adicionar mídia"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaCarousel
