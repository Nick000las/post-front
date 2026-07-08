export async function request(path, options) {
  const res = await fetch(path, { credentials: 'include', ...options })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro HTTP ${res.status}`)
  }
  return res.json()
}
