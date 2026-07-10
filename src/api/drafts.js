import { request } from './client'

export async function getDrafts() {
  const data = await request('/drafts')
  return Array.isArray(data?.drafts) ? data.drafts : []
}

export async function getDraft(id) {
  const data = await request(`/draft/${id}`)
  return data?.draft
}

export async function updateDraftCaption(id, caption) {
  return request(`/draft/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  })
}

export async function deleteDraft(id) {
  return request(`/draft/${id}`, { method: 'DELETE' })
}

export async function publishDraft(id) {
  return request(`/draft/${id}/publish`, { method: 'POST' })
}
