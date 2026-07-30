const baseUrl = import.meta.env.VITE_API_URL ?? ''

export function getMediaUrl(post) {
  return `${baseUrl}/uploads/${post.file_path}`
}

// thumbnail_path é nullable: posts criados antes dessa feature, ou geração que
// falhou silenciosamente no backend. Nesses casos cai no arquivo original.
export function getThumbnailUrl(post) {
  if (post.thumbnail_path) return `${baseUrl}/uploads/thumbs/${post.thumbnail_path}`
  return getMediaUrl(post)
}
