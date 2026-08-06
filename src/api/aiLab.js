import { request } from './client'

export async function extrairPostsDoPdf(file, clientId) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('clientId', clientId)

  const data = await request('/ai-lab/extrair', { method: 'POST', body: fd })
  return Array.isArray(data?.posts) ? data.posts : []
}

export async function importarPostsExtraidos(clientId, posts) {
  return request('/ai-lab/importar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, posts }),
  })
}
