import { request } from './client'

export async function getAccounts() {
  const data = await request('/contas')
  const list = Array.isArray(data) ? data : data?.contas
  return Array.isArray(list) ? list : []
}
