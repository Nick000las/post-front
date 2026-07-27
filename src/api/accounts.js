import { request } from './client'

export async function getAccounts(clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/contas${query}`)
  const list = Array.isArray(data) ? data : data?.contas
  return Array.isArray(list) ? list : []
}

export async function createAccount(dados, clientId) {
  return request('/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dados, clientId }),
  })
}

export async function updateAccount(id, dados, clientId) {
  return request(`/contas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dados, clientId }),
  })
}

export async function deleteAccount(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/contas/${id}${query}`, { method: 'DELETE' })
}
