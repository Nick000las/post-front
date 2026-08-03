import { useEffect, useRef, useState } from 'react'
import { Loader2, Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCardComments } from '@/hooks/useCardComments'
import { useAuth } from '@/contexts/AuthContext'
import { getAttachmentUrl } from '@/lib/media'
import { cn, formatBytes } from '@/lib/utils'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime',
]
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024

// Checagem antecipada só de UX — o backend continua sendo a fonte de verdade.
function validateAttachment(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return 'Tipo de arquivo não suportado.'
  if (file.size > MAX_ATTACHMENT_SIZE) return 'O arquivo excede o limite de 50MB.'
  return null
}

function CommentBubble({ comment }) {
  const { user } = useAuth()
  const isOwn = comment.users?.id === user?.id
  const time = new Date(comment.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isOwn ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      <span className="text-xs text-muted-foreground">
        {comment.users?.name} · {time}
      </span>
      <div
        className={cn(
          'rounded-lg px-3 py-2 text-sm',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        {comment.text && <p className="whitespace-pre-wrap">{comment.text}</p>}

        {comment.attachment_path && (
          <a
            href={getAttachmentUrl(comment)}
            target="_blank"
            rel="noreferrer"
            download={comment.attachment_original_name}
            className={cn(
              'mt-1 flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs underline underline-offset-2',
              isOwn ? 'border-primary-foreground/30' : 'border-border'
            )}
          >
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{comment.attachment_original_name}</span>
            <span className="shrink-0 opacity-70">({formatBytes(comment.attachment_size)})</span>
          </a>
        )}
      </div>
    </div>
  )
}

function CardCommentsPanel({ postId, clientId, open }) {
  const { comments, status, error, sending, sendComment, refetch } = useCardComments(
    postId,
    clientId,
    open
  )

  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [comments.length])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    // Limpa o input pra que escolher o mesmo arquivo de novo volte a disparar onChange.
    e.target.value = ''
    if (!selected) return

    const problema = validateAttachment(selected)
    if (problema) {
      setFileError(problema)
      return
    }
    setFile(selected)
    setFileError(null)
  }

  const handleSend = async () => {
    const ok = await sendComment(text.trim(), file)
    if (ok) {
      setText('')
      setFile(null)
      setFileError(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Comentários</h3>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto rounded-lg border p-3">
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando comentários...
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {status === 'success' && comments.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum comentário ainda.</p>
        )}

        {comments.map((comment) => (
          <CommentBubble key={comment.id} comment={comment} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2">
        {file && (
          <div className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs">
            <span className="truncate">
              {file.name} · {formatBytes(file.size)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setFile(null)}
              aria-label="Remover anexo"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {fileError && <p className="text-xs text-destructive">{fileError}</p>}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_MIME_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="Anexar arquivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            rows={2}
            className="min-h-0 resize-none"
            disabled={sending}
          />

          <Button
            type="button"
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            aria-label="Enviar mensagem"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CardCommentsPanel
