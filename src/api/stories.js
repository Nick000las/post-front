import { request } from './client'

// Story é um recurso REST separado do Feed (família /stories/*, controller e service próprios no
// backend) — não é um `format` enviado pros endpoints de /upload ou /draft. Por isso este módulo
// existe em paralelo a posts.js/drafts.js em vez de virar um parâmetro deles.
// Todo endpoint aceita exatamente 1 arquivo (uploadStory = single('arquivo') lá atrás).
// Story não tem legenda: a API de Stories da Meta não aceita o campo.

export async function publishStory(file, accountIds, clientId) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('clientId', clientId)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/stories/publish', { method: 'POST', body: fd })
}

export async function saveStoryDraft(file, accountIds, clientId) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('clientId', clientId)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))

  return request('/stories/draft', { method: 'POST', body: fd })
}

// scheduledDates: array de ISO 8601 com fuso explícito, já expandido pelo cliente
// (ver expandRecurrence). 1 data = agendamento avulso, 2+ = série recorrente.
// Aqui vai como string JSON porque multipart não carrega array estruturado — as rotas
// JSON (scheduleStoryDraft/extendSeries) mandam o array de verdade.
export async function scheduleStory(file, accountIds, clientId, scheduledDates) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('clientId', clientId)
  fd.append('accounts', JSON.stringify(accountIds.map((id) => ({ id }))))
  fd.append('scheduled_dates', JSON.stringify(scheduledDates))

  return request('/stories/schedule', { method: 'POST', body: fd })
}

export async function getStoryDrafts(clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/stories/drafts${query}`)
  return Array.isArray(data?.drafts) ? data.drafts : []
}

// Responde em qualquer status (rascunho, agendado, publicado, com falha).
export async function getStory(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/stories/${id}${query}`)
  return data?.story
}

export async function updateStoryMedia(id, clientId, file) {
  const fd = new FormData()
  fd.append('arquivo', file)
  fd.append('clientId', clientId)
  return request(`/stories/${id}/media`, { method: 'PUT', body: fd })
}

export async function linkStoryAccounts(id, clientId, accountIds) {
  return request(`/stories/${id}/accounts`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, accountIds }),
  })
}

export async function deleteStory(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/${id}${query}`, { method: 'DELETE' })
}

export async function publishExistingStory(id, clientId) {
  return request(`/stories/${id}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
}

// Agenda um rascunho que já existe, sem reenviar arquivo. scheduledDates segue a mesma regra
// do agendamento na criação (1 data = avulso, 2+ = série). Quando vira série, a 1ª ocorrência
// reaproveita o `id` deste rascunho — só as demais ganham ids novos.
export async function scheduleStoryDraft(id, clientId, scheduledDates) {
  return request(`/stories/${id}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, scheduled_dates: scheduledDates }),
  })
}

// PUT (reagenda 1 ocorrência, campo singular `scheduled_for`) — não confundir com
// POST /stories/:id/schedule, que ainda é um stub no backend e não é chamado em lugar nenhum.
export async function rescheduleStory(id, clientId, scheduledFor) {
  return request(`/stories/${id}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, scheduled_for: scheduledFor }),
  })
}

export async function cancelStorySchedule(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/${id}/schedule${query}`, { method: 'DELETE' })
}

export async function getStoryStatus(id, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/${id}/status${query}`)
}

// Índice de séries do cliente (mais recente primeiro) — evita ter que garimpar um
// recurrence_id nos cards do Kanban pra chegar numa série.
export async function getSeriesIndex(clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const data = await request(`/stories/recurrence${query}`)
  return Array.isArray(data?.series) ? data.series : []
}

export async function getStoryRecurrence(recurrenceId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/recurrence/${recurrenceId}${query}`)
}

// Adiciona ocorrências à série existente, sem reenviar arquivo: mídia e contas são
// clonadas da ocorrência mais recente (a de maior scheduled_for).
export async function extendSeries(recurrenceId, clientId, scheduledDates) {
  return request(`/stories/recurrence/${recurrenceId}/occurrences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, scheduled_dates: scheduledDates }),
  })
}

// Cancela: colapsa as SCHEDULED numa única sobrevivente (vira rascunho solto) e preserva
// PUBLISHED/FAILED intocados — reversível na prática (sobra algo pra reagendar).
export async function cancelStoryRecurrence(recurrenceId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/recurrence/${recurrenceId}${query}`, { method: 'DELETE' })
}

// Exclui: apaga TODAS as ocorrências da série, qualquer status (mesmo já publicadas) — hard
// delete de cada post (mídia + job de fila) e por fim o próprio registro da série. Diferente
// de cancelar, não sobra rascunho nem histórico. Resposta: { totalExcluidas }.
export async function deleteStorySeries(recurrenceId, clientId) {
  const query = clientId != null ? `?clientId=${encodeURIComponent(clientId)}` : ''
  return request(`/stories/recurrence/${recurrenceId}/occurrences${query}`, { method: 'DELETE' })
}
