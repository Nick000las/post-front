import { request } from './client'

export async function getClients() {
  const data = await request('/clients')
  const list = Array.isArray(data) ? data : data?.clients
  return Array.isArray(list) ? list : []
}

export async function createClient(dados) {
  return request('/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export async function updateClient(id, dados) {
  return request(`/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export async function deleteClient(id) {
  return request(`/clients/${id}`, { method: 'DELETE' })
}
