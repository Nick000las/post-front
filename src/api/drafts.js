import { request } from './client'

export async function getDrafts(clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/drafts${query}`)
  return Array.isArray(data?.drafts) ? data.drafts : []
}

export async function getDraft(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/draft/${id}${query}`)
  return data?.draft
}

export async function updateDraftCaption(id, caption, clientId) {
  return request(`/draft/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption, clientId }),
  })
}

export async function deleteDraft(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/draft/${id}${query}`, { method: 'DELETE' })
}

export async function publishDraft(id, clientId) {
  return request(`/draft/${id}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
}
