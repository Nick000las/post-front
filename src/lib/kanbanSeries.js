// Agrupamento de ocorrências de série no Kanban — uma série vira N posts reais no quadro (um
// por ocorrência), e cuspir todos poluiria as colunas. Enquanto QUALQUER ocorrência da série
// ainda está SCHEDULED, ela é representada por UM card mestre na coluna Agendado; quando
// nenhuma sobra SCHEDULED (tudo publicou ou falhou), vira UM card mestre em Finalizado. Por
// isso o agrupamento olha pro quadro inteiro (todas as colunas de uma vez) — se olhasse só a
// coluna sendo desenhada, a mesma série apareceria espalhada, um card em cada coluna onde
// tem ocorrência.

function isSooner(a, b) {
  if (!a.scheduled_for) return false
  if (!b.scheduled_for) return true
  return new Date(a.scheduled_for) < new Date(b.scheduled_for)
}

function isMoreRecent(a, b) {
  const av = a.scheduled_for ?? a.published_at ?? a.updated_at
  const bv = b.scheduled_for ?? b.published_at ?? b.updated_at
  if (!av) return false
  if (!bv) return true
  return new Date(av) > new Date(bv)
}

// Varre todas as colunas e resolve cada série (recurrence_id) num único grupo: quem a
// representa visualmente e em qual coluna fixa o card mestre deve aparecer.
export function resolveSeriesGroups(columns) {
  const byRecurrence = new Map()
  for (const column of columns) {
    for (const post of column.posts) {
      if (post.recurrence_id == null) continue
      const list = byRecurrence.get(post.recurrence_id) ?? []
      list.push(post)
      byRecurrence.set(post.recurrence_id, list)
    }
  }

  const groups = new Map()
  for (const [recurrenceId, posts] of byRecurrence) {
    const scheduled = posts.filter((p) => p.status === 'SCHEDULED')
    const anyScheduled = scheduled.length > 0
    // Representante: a próxima ocorrência agendada se ainda tem alguma; senão, a mais
    // recente (pra refletir o desfecho final da série já concluída).
    const pool = anyScheduled ? scheduled : posts
    const representative = pool.reduce((best, post) => {
      if (!best) return post
      return anyScheduled
        ? (isSooner(post, best) ? post : best)
        : (isMoreRecent(post, best) ? post : best)
    }, null)

    groups.set(recurrenceId, {
      posts,
      representative,
      targetFixedKey: anyScheduled ? 'AGENDADO' : 'FINALIZADO',
    })
  }
  return groups
}

// Lista o que uma coluna específica deve renderizar: posts soltos (sem série) passam direto;
// ocorrências de série só aparecem aqui se esta for a coluna-alvo do grupo — nas demais
// colunas onde a série também tem ocorrências físicas, elas somem (o card mestre já está
// representando a série alhures).
export function groupColumnPosts(column, seriesGroups) {
  const seen = new Set()
  const result = []
  for (const post of column.posts) {
    if (post.recurrence_id == null) {
      result.push({ key: `post-${post.id}`, post, seriesCount: 1 })
      continue
    }

    const group = seriesGroups.get(post.recurrence_id)
    if (!group || group.targetFixedKey !== column.fixed_key) continue
    if (seen.has(post.recurrence_id)) continue
    seen.add(post.recurrence_id)
    result.push({ key: `series-${post.recurrence_id}`, post: group.representative, seriesCount: group.posts.length })
  }
  return result
}
