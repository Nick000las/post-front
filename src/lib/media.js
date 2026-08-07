const baseUrl = import.meta.env.VITE_API_URL ?? ''

// item é um elemento de post.media[] (ou draft.media[]), nunca o post inteiro —
// media pode ser [] (draft sem mídia ainda), então item também pode ser undefined.
// thumb: true busca a miniatura (subpasta thumbs/); se thumbnail_path for nulo
// (geração falhou no backend, ou mídia antiga), cai pro arquivo original.
export function getMediaUrl(item, { thumb = false } = {}) {
  if (!item?.file_path) return null
  if (thumb && item.thumbnail_path) return `${baseUrl}/uploads/thumbs/${item.thumbnail_path}`
  return `${baseUrl}/uploads/${item.file_path}`
}

// Sem fallback: os campos de anexo são tudo-ou-nada, então só chamamos isso
// quando `attachment_path` existe.
export function getAttachmentUrl(comment) {
  return `${baseUrl}/uploads/comment-attachments/${comment.attachment_path}`
}
