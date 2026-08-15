import { Button } from '@/components/ui/button'
import { POST_FORMAT } from '@/lib/postFormat'

const OPTIONS = [
  { value: POST_FORMAT.FEED, label: 'Publicação' },
  { value: POST_FORMAT.STORY, label: 'Story' },
]

// Não é só um campo do payload: o formato escolhido aqui decide qual família de endpoints o
// PublishContext chama (/upload/* pra Feed, /stories/* pra Story).
function PostFormatToggle({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'outline'}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className="flex-1"
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

export default PostFormatToggle
