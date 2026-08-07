import { PLATFORMS } from '@/lib/platforms'

// Plataformas que NÃO aceitam carrossel (2+ mídias) com vídeo — só aceitam
// carrossel 100% imagens (vídeo isolado, fora de carrossel, publica normal).
// Único lugar que conhece essa lista; tela de publicar e popup do Kanban
// chamam getCarouselVideoConflicts já com os dados normalizados pro próprio
// formato de mídia (mediaItems locais vs. post.media já salvo).
export const NO_CAROUSEL_VIDEO_PLATFORMS = ['facebook', 'tiktok', 'linkedin']

export function getCarouselVideoConflicts({ mediaCount, hasVideo, platformIds }) {
  if (mediaCount <= 1 || !hasVideo) return []
  return platformIds.filter((id) => NO_CAROUSEL_VIDEO_PLATFORMS.includes(id))
}

export function formatCarouselVideoConflictMessage(conflictPlatformIds) {
  const names = conflictPlatformIds.map((id) => PLATFORMS.find((p) => p.id === id)?.name ?? id)
  return `Carrossel com vídeo não é aceito em: ${names.join(', ')}. Desvincule essas contas ou remova o vídeo para publicar.`
}
