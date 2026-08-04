export function canRepublish(status) {
  return status === 'FAILED' || status === 'PARTIAL'
}

export function statusBadgeVariant(status) {
  return canRepublish(status) ? 'destructive' : 'secondary'
}
