import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PublishButton({ canPublish, isPublishing, isVideo, onClick }) {
  const loadingText = isVideo
    ? 'Publicando vídeo, isso pode levar alguns minutos...'
    : 'Publicando...'

  return (
    <Button
      className="w-full h-11 text-base"
      disabled={!canPublish}
      onClick={onClick}
    >
      {isPublishing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
          {loadingText}
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4 shrink-0" />
          Publicar
        </>
      )}
    </Button>
  )
}

export default PublishButton
