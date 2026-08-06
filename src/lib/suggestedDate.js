// suggested_date é gravado no backend como meia-noite UTC (new Date("YYYY-MM-DD")). Ler os
// componentes em horário local (UTC-3) cairia no dia anterior, então tudo aqui usa getUTC*.

export function suggestedDateToLocalMidnight(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function formatSuggestedDate(value) {
  const local = suggestedDateToLocalMidnight(value)
  if (!local) return null
  return local.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Inverso de suggestedDateToLocalMidnight: o backend só aceita "YYYY-MM-DD", e toISOString()
// converteria pra UTC (voltando um dia em fusos negativos).
export function localDateToIsoDay(date) {
  if (!date) return null
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
