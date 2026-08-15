import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
  'video/quicktime': [],
}

// items: [{ key, file, previewUrl }] — estado 100% local até o envio (ver
// PublishContext.handleFilesAdded/handleRemoveFile). A posição no array vira
// `order` do carrossel no backend, por isso o badge numerado usa o índice
// atual, não algo salvo em cada item.
function MediaDropzone({ items, onFilesAdded, onRemoveItem, maxFiles = 10 }) {
  const isSingle = maxFiles === 1
  const isFull = items.length >= maxFiles

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onFilesAdded(acceptedFiles)
  }, [onFilesAdded])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: !isSingle,
    maxFiles,
    noClick: items.length > 0,
  })

  if (items.length === 0) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          'relative flex items-center justify-center rounded-xl border-2 border-dashed transition-colors overflow-hidden',
          'min-h-[280px] cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center pointer-events-none">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragActive
                ? 'Solte aqui'
                : isSingle
                  ? 'Arraste uma imagem ou vídeo, ou clique para selecionar'
                  : 'Arraste imagens ou vídeos, ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG · MP4, MOV (máx. 300MB)
              {isSingle ? ' · Sugerimos mídia vertical (9:16)' : ' · Solte mais de um arquivo para criar um carrossel'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => {
          const isVideo = item.file.type.startsWith('video/')
          return (
            <div key={item.key} className="relative aspect-square overflow-hidden rounded-lg border">
              {isVideo ? (
                <video src={item.previewUrl} className="h-full w-full object-cover" />
              ) : (
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-white">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.key) }}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Remover arquivo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}

        {!isFull && (
          <button
            type="button"
            onClick={open}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Adicionar mais arquivos"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Adicionar</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MediaDropzone
