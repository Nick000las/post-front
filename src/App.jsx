import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import MediaDropzone from './components/MediaDropzone'
import CaptionField from './components/CaptionField'
import PlatformSelector from './components/PlatformSelector'
import PublishButton from './components/PublishButton'

const VIDEO_SIZE_LIMIT = 300 * 1024 * 1024 // 300MB em bytes
const TIMEOUT_IMAGE_MS = 30_000            // 30s
const TIMEOUT_VIDEO_MS = 210_000           // 3.5min — Meta faz polling por até ~2min30

function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(['instagram']))
  const [isPublishing, setIsPublishing] = useState(false)

  const isVideo = file ? file.type.startsWith('video/') : false
  const canPublish = file !== null && selectedPlatforms.size > 0 && !isPublishing

  const handleFileAccepted = useCallback((newFile, url) => {
    if (newFile.type.startsWith('video/') && newFile.size > VIDEO_SIZE_LIMIT) {
      URL.revokeObjectURL(url)
      toast.error('Vídeo muito grande', { description: 'Limite: 300MB' })
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(newFile)
    setPreviewUrl(url)
  }, [previewUrl])

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }, [previewUrl])

  const handlePlatformToggle = useCallback((id) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handlePublish = async () => {
    if (!file || selectedPlatforms.size === 0) return
    setIsPublishing(true)

    const fileIsVideo = file.type.startsWith('video/')
    const endpoint = fileIsVideo ? '/upload/vid' : '/upload/img'
    const fieldName = fileIsVideo ? 'video' : 'image'

    const fd = new FormData()
    fd.append(fieldName, file)
    fd.append('caption', caption)


    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Erro HTTP ${res.status}`)
      }

      const data = await res.json()
      toast.success(data.message ?? 'Publicado com sucesso!', {
        description: `Post ID: ${data.postId}`,
      })

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setCaption('')
      setSelectedPlatforms(new Set(['instagram']))
    } catch (err) {
      const message = err.name === 'AbortError'
        ? 'A requisição excedeu o tempo limite. Tente novamente.'
        : err.message
      toast.error('Falha ao publicar', { description: message })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Publicar Post
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione uma imagem ou vídeo, escreva a legenda e publique nas suas redes sociais.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <MediaDropzone
              file={file}
              previewUrl={previewUrl}
              onFileAccepted={handleFileAccepted}
              onClear={handleClear}
            />
            <CaptionField value={caption} onChange={setCaption} />
          </div>

          <div className="flex flex-col gap-4">
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onToggle={handlePlatformToggle}
            />
            <PublishButton
              canPublish={canPublish}
              isPublishing={isPublishing}
              isVideo={isVideo}
              onClick={handlePublish}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
