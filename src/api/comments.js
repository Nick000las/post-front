import { request } from './client'

export async function getComments(postId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/posts/${postId}/comments${query}`)
  return Array.isArray(data?.comentarios) ? data.comentarios : []
}

export async function postComment(postId, clientId, text, file) {
  const fd = new FormData()
  fd.append('clientId', clientId)
  // `text` vai sempre, mesmo vazio: o backend aceita texto vazio desde que haja anexo.
  fd.append('text', text ?? '')
  // O campo do arquivo aqui é `anexo` — diferente do `arquivo` usado em api/posts.js.
  if (file) fd.append('anexo', file)

  return request(`/posts/${postId}/comments`, { method: 'POST', body: fd })
}
