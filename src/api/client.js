const API_URL = import.meta.env.VITE_API_URL ?? ''

export async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const error = new Error(err.error ?? `Erro HTTP ${res.status}`)
    error.status = res.status
    throw error
  }
  return res.json()
}
