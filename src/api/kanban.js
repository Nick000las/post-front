import { request } from './client'

// GET /columns existe no backend mas não é usado aqui — GET /kanban já traz
// as colunas com os posts aninhados, suficiente pra montar a tela inteira.

export async function getKanbanBoard(clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/kanban${query}`)
  return Array.isArray(data?.columns) ? data.columns : []
}

export async function createColumn(clientId, name) {
  return request('/columns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, name }),
  })
}

export async function renameColumn(id, clientId, name) {
  return request(`/columns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, name }),
  })
}

export async function deleteColumn(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/columns/${id}${query}`, { method: 'DELETE' })
}

export async function movePost(postId, clientId, columnId) {
  return request(`/posts/${postId}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, columnId }),
  })
}
