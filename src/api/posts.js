import { request } from './client'

export async function publishPost(file, caption, accountIds, clientId) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('caption', caption)
  fd.append('clientId', clientId)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/upload/lote', { method: 'POST', body: fd })
}

export async function saveDraft(file, caption, accountIds, clientId) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('caption', caption)
  fd.append('clientId', clientId)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/upload/draft', { method: 'POST', body: fd })
}

export async function schedulePost(file, caption, accountIds, clientId, scheduledFor) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('caption', caption)
  fd.append('clientId', clientId)
  fd.append('scheduled_for', scheduledFor)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/upload/schedule', { method: 'POST', body: fd })
}

export async function changeScheduleDate(postId, clientId, scheduledFor) {
  return request(`/schedule/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, scheduled_for: scheduledFor }),
  })
}

// Reverte o post para DRAFT (mídia e legenda preservadas) — não exclui nada.
export async function cancelSchedule(postId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/schedule/${postId}${query}`, { method: 'DELETE' })
}

// Exclusão definitiva, válida em qualquer status. Não confundir com
// deleteDraft (DELETE /draft/:id), que só aceita posts em DRAFT.
export async function deletePost(postId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/posts/${postId}${query}`, { method: 'DELETE' })
}

export async function getPostStatus(postId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/posts/${postId}/status${query}`)
}
