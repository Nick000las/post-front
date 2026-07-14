import { request } from './client'

export async function getFeed({ page = 1, limit = 10 } = {}) {
  const data = await request(`/feed?page=${page}&limit=${limit}`)
  return {
    feed: Array.isArray(data?.feed) ? data.feed : [],
    pagination: data?.pagination ?? { page, limit, total: 0, totalPages: 0 },
  }
}
