import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PublishButton({ canPublish, isPublishing, hasVideo, onClick }) {
  const loadingText = hasVideo
    ? 'Publicando vídeo, isso pode levar alguns minutos...'
    : 'Publicando...'

  return (
    <Button
      className="flex-1 h-11 text-base"
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
          Publicar agora
        </>
      )}
    </Button>
  )
}

export default PublishButton
