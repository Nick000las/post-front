import { request } from './client'

function buildFeedQuery(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  return query.toString()
}

function normalizeFeedResponse(data, page, limit) {
  return {
    feed: Array.isArray(data?.feed) ? data.feed : [],
    pagination: data?.pagination ?? { page, limit, total: 0, totalPages: 0 },
  }
}

export async function getGlobalFeed({ page = 1, limit = 10, status, clientId, date } = {}) {
  const query = buildFeedQuery({ page, limit, status, clientId, date })
  const data = await request(`/feed?${query}`)
  return normalizeFeedResponse(data, page, limit)
}

export async function getClientFeed({ page = 1, limit = 10, clientId, platform, month, year } = {}) {
  const query = buildFeedQuery({ page, limit, clientId, platform, month, year })
  const data = await request(`/feed/cliente?${query}`)
  return normalizeFeedResponse(data, page, limit)
}
