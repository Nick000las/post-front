const baseUrl = import.meta.env.VITE_API_URL ?? ''

// file_path é nullable: um draft pode ficar sem mídia (removida no editor do
// Kanban, ou nunca anexada). null é estado normal, não erro — quem chama trata.
export function getMediaUrl(post) {
  if (!post.file_path) return null
  return `${baseUrl}/uploads/${post.file_path}`
}

// thumbnail_path também é nullable (posts criados antes dessa feature, ou
// geração que falhou silenciosamente no backend) — nesses casos cai no
// arquivo original, que por sua vez cai em null se o post não tiver mídia.
export function getThumbnailUrl(post) {
  if (post.thumbnail_path) return `${baseUrl}/uploads/thumbs/${post.thumbnail_path}`
  return getMediaUrl(post)
}

// Sem fallback: os campos de anexo são tudo-ou-nada, então só chamamos isso
// quando `attachment_path` existe.
export function getAttachmentUrl(comment) {
  return `${baseUrl}/uploads/comment-attachments/${comment.attachment_path}`
}
