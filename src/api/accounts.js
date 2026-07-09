import { request } from './client'

export async function getAccounts() {
  const data = await request('/contas')
  const list = Array.isArray(data) ? data : data?.contas
  return Array.isArray(list) ? list : []
}

export async function createAccount(dados) {
  return request('/contas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export async function updateAccount(id, dados) {
  return request(`/contas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export async function deleteAccount(id) {
  return request(`/contas/${id}`, { method: 'DELETE' })
}
