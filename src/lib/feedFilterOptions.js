export const GLOBAL_STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'falhas', label: 'Falhas' },
  { value: 'publicados', label: 'Publicados' },
]

export const GLOBAL_DATE_OPTIONS = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7dias', label: 'Últimos 7 dias' },
  { value: 'mes', label: 'Este mês' },
]

export const MONTH_OPTIONS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const YEAR_WINDOW = 5

// Não há endpoint que informe os anos com posts — janela fixa a partir do ano atual.
export function getYearOptions() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: YEAR_WINDOW }, (_, i) => String(currentYear - i))
}
