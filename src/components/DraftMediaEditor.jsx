import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMediaUrl, getThumbnailUrl } from '@/lib/media'

const ACCEPTED_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
  'video/quicktime': [],
}

// Editor de mídia inline do popup do Kanban — só usado com post.status === 'DRAFT'.
// Diferente de MediaDropzone.jsx (que junta um File local pra um upload que ainda
// não existe): aqui o post já está salvo, então cada troca/remoção chama a API na
// hora (onReplace/onRemove), sem estado de arquivo local pra manter.
function DraftMediaEditor({ post, onReplace, onRemove, isUpdating }) {
  const hasMedia = !!post.file_path
  const isVideo = post.file_type?.startsWith('video/')

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) onReplace(file)
  }, [onReplace])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: isUpdating,
  })

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          'group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-transparent',
          !hasMedia && 'border-border bg-muted/30 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />

        {hasMedia ? (
          isVideo ? (
            <video src={getMediaUrl(post)} controls className="w-full rounded-lg max-h-80 object-cover bg-black" />
          ) : (
            <img src={getMediaUrl(post)} alt={post.file_name} className="w-full rounded-lg max-h-80 object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-muted-foreground pointer-events-none">
            <ImageOff className="h-8 w-8" />
            <p className="text-sm font-medium">Nenhuma mídia anexada</p>
            <p className="text-xs">Arraste um arquivo aqui ou use o + abaixo</p>
          </div>
        )}

        {hasMedia && !isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={open}
              aria-label="Substituir mídia"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground transition-colors hover:bg-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remover mídia"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-destructive transition-colors hover:bg-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Mini-galeria: por enquanto só substitui (1 mídia por post). O quadradinho
          e o [+] já ficam prontos pro dia em que houver mais de uma mídia por post. */}
      <div className="flex gap-2">
        {hasMedia && (
          <button
            type="button"
            onClick={open}
            disabled={isUpdating}
            aria-label="Substituir mídia"
            className="h-12 w-12 shrink-0 overflow-hidden rounded-md border"
          >
            <img src={getThumbnailUrl(post)} alt="" className="h-full w-full object-cover" />
          </button>
        )}
        <button
          type="button"
          onClick={open}
          disabled={isUpdating}
          aria-label="Adicionar mídia"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default DraftMediaEditor
