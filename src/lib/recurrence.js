const pad = (n) => String(n).padStart(2, '0')

// Monta "YYYY-MM-DDTHH:MM:SS±HH:MM" em horário local. Não usa toISOString(): ele converte pra
// UTC, o que muda o dia/hora em fusos negativos (mesmo motivo documentado em suggestedDate.js).
export function toIsoWithOffset(date) {
  // getTimezoneOffset() devolve os minutos a somar ao local pra chegar em UTC — sinal invertido
  // em relação ao ISO 8601 (UTC-3 → +180), por isso a negação antes de formatar.
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`
  )
}

// Expande "toda quarta e sexta até dia X" na lista concreta de datas que o backend espera —
// ele não faz nenhum cálculo de data, só valida a lista pronta. Pura: sem API, sem DOM.
// weekdays usa a convenção de Date.getDay() (0=domingo..6=sábado). A hora de cada ocorrência é
// sempre a de startDate; de endDate só a data importa (a UI nem oferece hora pra ele).
export function expandRecurrence({ startDate, weekdays, endDate }) {
  if (!startDate || !endDate || weekdays.length === 0) return []

  const results = []
  const weekdaySet = new Set(weekdays)
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const lastDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  while (cursor.getTime() <= lastDay.getTime()) {
    if (weekdaySet.has(cursor.getDay())) {
      results.push(toIsoWithOffset(new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
        startDate.getSeconds(),
      )))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return results
}
