import { PLATFORMS } from '@/lib/platforms'
import { STORY_DISABLED_PLATFORMS } from '@/lib/postFormat'

// Plataformas que NÃO aceitam carrossel (2+ mídias) com vídeo — só aceitam
// carrossel 100% imagens (vídeo isolado, fora de carrossel, publica normal).
export const NO_CAROUSEL_VIDEO_PLATFORMS = ['facebook', 'tiktok', 'linkedin']

function platformNames(platformIds) {
  return platformIds.map((id) => PLATFORMS.find((p) => p.id === id)?.name ?? id).join(', ')
}

export function getCarouselVideoConflicts({ mediaCount, hasVideo, platformIds }) {
  if (mediaCount <= 1 || !hasVideo) return []
  return platformIds.filter((id) => NO_CAROUSEL_VIDEO_PLATFORMS.includes(id))
}

export function formatCarouselVideoConflictMessage(conflictPlatformIds) {
  return `Carrossel com vídeo não é aceito em: ${platformNames(conflictPlatformIds)}. Desvincule essas contas ou remova o vídeo para publicar.`
}

export function getStoryPlatformConflicts({ platformIds }) {
  return platformIds.filter((id) => STORY_DISABLED_PLATFORMS.includes(id))
}

export function formatStoryPlatformConflictMessage(conflictPlatformIds) {
  return `Story não é publicado em: ${platformNames(conflictPlatformIds)}. Desvincule essas contas para publicar ou agendar.`
}
