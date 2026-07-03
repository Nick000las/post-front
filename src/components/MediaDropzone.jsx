import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
  'video/quicktime': [],
}

function MediaDropzone({ file, previewUrl, onFileAccepted, onClear }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    const newFile = acceptedFiles[0]
    const url = URL.createObjectURL(newFile)
    onFileAccepted(newFile, url)
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: false,
    noClick: !!file,
  })

  const isVideo = file ? file.type.startsWith('video/') : false

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex items-center justify-center rounded-xl border-2 border-dashed transition-colors overflow-hidden',
          'min-h-[280px] cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
          file && 'border-solid border-border cursor-default'
        )}
      >
        <input {...getInputProps()} />

        {previewUrl && isVideo ? (
          <video
            src={previewUrl}
            controls
            className="absolute inset-0 w-full h-full object-contain rounded-xl bg-black"
          />
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview da imagem selecionada"
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-8 text-center pointer-events-none">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste uma imagem ou vídeo, ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG · MP4, MOV (máx. 300MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear() }}
          className="absolute top-2 right-2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          aria-label="Remover arquivo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default MediaDropzone
