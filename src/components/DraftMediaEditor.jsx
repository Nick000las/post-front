import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import MediaCarousel from '@/components/MediaCarousel'
import { getMediaUrl } from '@/lib/media'

const ACCEPTED_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'video/mp4': [],
  'video/quicktime': [],
}

// Referência estável: `post.media ?? []` criaria um array novo a cada render,
// invalidando à toa o useCallback de onDrop abaixo.
const EMPTY_MEDIA = []

// PUT /draft/:id/media substitui TODA a mídia do draft (não é aditivo) — não
// existe endpoint de "adicionar 1 item". Pra o [+] parecer aditivo pro
// usuário, rebaixamos cada item já salvo de volta a File (buscando o arquivo
// original pela própria URL) e reenviamos junto com o(s) novo(s).
async function mediaItemToFile(item) {
  const response = await fetch(getMediaUrl(item))
  if (!response.ok) throw new Error(`Falha ao carregar "${item.file_name}"`)
  const blob = await response.blob()
  return new File([blob], item.file_name, { type: item.file_type })
}

// Editor de mídia inline do popup do Kanban — só usado com post.status === 'DRAFT'.
// Dono só da parte de arquivo (dropzone + reconstrução do conjunto completo);
// toda a renderização do carrossel/miniaturas é do MediaCarousel.
function DraftMediaEditor({ post, maxFiles = 10, onReplaceAll, onRemoveItem, isReplacing, removingMediaId }) {
  const [isPreparing, setIsPreparing] = useState(false)
  const media = post.media ?? EMPTY_MEDIA
  // Story: 1 mídia só, e não existe endpoint de exclusão por item — trocar o arquivo já
  // substitui o único que havia, então o merge-fetch abaixo não faz sentido aqui.
  const isSingleMedia = maxFiles === 1

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    if (isSingleMedia) {
      await onReplaceAll([acceptedFiles[0]])
      return
    }
    setIsPreparing(true)
    try {
      const existingFiles = await Promise.all(media.map(mediaItemToFile))
      await onReplaceAll([...existingFiles, ...acceptedFiles])
    } catch (err) {
      toast.error('Falha ao adicionar mídia', { description: err.message })
    } finally {
      setIsPreparing(false)
    }
  }, [media, onReplaceAll, isSingleMedia])

  const busy = isReplacing || isPreparing

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: !isSingleMedia,
    noClick: true,
    noKeyboard: true,
    disabled: busy,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'rounded-lg border-2 border-dashed transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-transparent'
      )}
    >
      <input {...getInputProps()} />
      <MediaCarousel
        media={media}
        variant="detail"
        className="w-full max-h-80 object-cover"
        emptyLabel="Nenhuma mídia anexada"
        emptyHint="Arraste um arquivo aqui ou use o + abaixo"
        onRemoveItem={isSingleMedia ? undefined : (mediaId) => onRemoveItem(mediaId)}
        removingItemId={removingMediaId}
        onAddClick={open}
        disabled={busy}
      />
    </div>
  )
}

export default DraftMediaEditor
