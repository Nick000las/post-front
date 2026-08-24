import { useMemo } from 'react'
import { PLATFORM_CAPTION_LIMITS } from '@/lib/platforms'

const DEFAULT_LIMIT = PLATFORM_CAPTION_LIMITS.instagram
const WARN_RATIO = 0.95

// Publicar em várias redes de uma vez manda a MESMA legenda pra todas, então o limite que vale é
// o da rede mais restrita — passar dele quebraria a publicação nessa rede, não só nela ficaria
// truncado. selectedPlatformIds aceita Set ou array de ids minúsculos.
export function useCharacterLimit(selectedPlatformIds, captionLength) {
  return useMemo(() => {
    const candidates = Array.from(selectedPlatformIds ?? [])
      .map((id) => ({ id, limit: PLATFORM_CAPTION_LIMITS[id] }))
      .filter(({ limit }) => typeof limit === 'number')

    const strictest = candidates.reduce(
      (tightest, candidate) => (tightest === null || candidate.limit < tightest.limit ? candidate : tightest),
      null
    )

    const limit = strictest?.limit ?? DEFAULT_LIMIT
    const warnThreshold = Math.floor(limit * WARN_RATIO)

    return {
      limit,
      warnThreshold,
      // Qual rede está ditando o limite — o contador mostra isso, senão o usuário não tem como
      // saber por que o número muda ao marcar/desmarcar uma rede.
      strictestPlatformId: strictest?.id ?? null,
      isWarning: captionLength >= warnThreshold,
      isOverLimit: captionLength > limit,
      remaining: limit - captionLength,
    }
  }, [selectedPlatformIds, captionLength])
}
