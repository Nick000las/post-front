import { request } from './client'

export async function publishPost(file, caption, accountIds) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('caption', caption)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/upload/lote', { method: 'POST', body: fd })
}

export async function saveDraft(file, caption, accountIds) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('caption', caption)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/upload/draft', { method: 'POST', body: fd })
}
