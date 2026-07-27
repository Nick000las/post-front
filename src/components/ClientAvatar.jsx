import { cn } from '@/lib/utils'

const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
]

function getInitials(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorForName(name) {
  let hash = 0
  for (let i = 0; i < (name ?? '').length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function ClientAvatar({ name, size = 'md', className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none',
        colorForName(name),
        SIZES[size] ?? SIZES.md,
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

export default ClientAvatar
