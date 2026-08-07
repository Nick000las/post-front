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

// Substitui TODA a mídia do draft — não é aditivo.
export async function updateDraftMedia(id, clientId, files) {
  const fd = new FormData()
  for (const file of files) fd.append('arquivo', file)
  fd.append('clientId', clientId)
  return request(`/draft/${id}/media`, { method: 'PUT', body: fd })
}

export async function removeDraftMediaItem(id, mediaId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/draft/${id}/media/${mediaId}${query}`, { method: 'DELETE' })
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

export async function scheduleDraft(id, clientId, scheduledFor) {
  return request(`/draft/${id}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, scheduled_for: scheduledFor }),
  })
}
