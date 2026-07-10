import { toast } from 'sonner'

export function summarizePublishResult(detalhes, accounts) {
  const successCount = detalhes.filter((d) => d.status === 'success').length
  const failCount = detalhes.length - successCount

  const description = detalhes
    .map((d) => {
      const label = accounts.find((acc) => acc.id === d.accountId)?.name ?? d.accountId
      return d.status === 'success' ? `✓ ${label}` : `✗ ${label}: ${d.error ?? 'Falha desconhecida'}`
    })
    .join('\n')

  return { successCount, failCount, description }
}

export function toastPublishResult({ successCount, failCount, description, successMessage = 'Publicado com sucesso!' }) {
  if (failCount === 0) {
    toast.success(successMessage, { description })
  } else if (successCount === 0) {
    toast.error('Falha ao publicar', { description })
  } else {
    toast.warning('Publicado parcialmente', { description })
  }
}
