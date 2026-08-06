import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Trash2, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_SIZE = 50 * 1024 * 1024

function rejectionMessage(rejection) {
  const code = rejection?.errors?.[0]?.code
  if (code === 'file-too-large') return 'O arquivo passa de 50MB. Envie um PDF menor.'
  if (code === 'file-invalid-type') return 'Apenas arquivos PDF são aceitos.'
  return 'Não foi possível usar esse arquivo. Envie um PDF de até 50MB.'
}

// Irmão do MediaDropzone (imagem/vídeo, com preview): aqui o arquivo é um PDF que só serve de
// entrada pra extração, então não há preview — só o nome do arquivo e validação local de
// tipo/tamanho antes de gastar uma chamada à IA.
function PdfDropzone({ file, onFileAccepted, onClear, disabled }) {
  const onDrop = useCallback((acceptedFiles) => {
    const accepted = acceptedFiles[0]
    if (accepted) onFileAccepted(accepted)
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
    noClick: !!file,
  })

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          'flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed transition-colors',
          file ? 'border-solid border-border cursor-default' : 'cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
          !file && !isDragActive && 'hover:border-primary/50 hover:bg-muted/50',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex items-center gap-3 px-4 py-6">
            <FileText className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              disabled={disabled}
              aria-label="Remover arquivo"
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="pointer-events-none flex flex-col items-center gap-3 px-6 py-8 text-center">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Solte o PDF aqui' : 'Arraste o cronograma em PDF, ou clique para selecionar'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF (máx. 50MB)</p>
            </div>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="text-sm text-destructive">{rejectionMessage(fileRejections[0])}</p>
      )}
    </div>
  )
}

export default PdfDropzone
