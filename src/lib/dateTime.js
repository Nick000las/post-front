// Combina a data escolhida no Calendar com o horário do <input type="time">.
// Compartilhado por DateTimePickerPopover (agendamento de Feed) e StorySchedulePicker.
export function combineDateTime(date, time) {
  if (!date) return null
  const [hours, minutes] = (time || '').split(':').map(Number)
  const result = new Date(date)
  result.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0)
  return result
}

export function toTimeInputValue(date) {
  if (!date) return '12:00'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// Data + horário exato, pra exibição. Diferente de formatSuggestedDate (suggestedDate.js), que
// mostra só DD/MM porque a sugestão da IA não tem hora nenhuma.
export function formatExactDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
