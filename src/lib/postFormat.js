// Espelha os valores válidos de `format` do backend (FEED/STORY/REELS/null — um carrossel também
// é FEED, já que a distinção vem da quantidade de arquivos anexados no upload, não da IA).
// getFormatBehavior é a ÚNICA fonte do comportamento condicional por formato: tela de publicar
// (dropzone, legenda, seletor de plataforma, agendamento) e edição no Kanban (popup, editor de
// mídia, vínculo de contas) leem tudo daqui — nunca `if (format === 'STORY')` solto na UI.
export const POST_FORMAT = {
  FEED: 'FEED',
  STORY: 'STORY',
  REELS: 'REELS',
}

// TikTok e LinkedIn não têm publicação de Story via API. O backend NÃO tem uma segunda barreira
// pra isso (os adapters dessas redes nem sabem que `format` existe), então o bloqueio no
// frontend é obrigatório, não decorativo — ver getStoryPlatformConflicts em platformCompat.js.
export const STORY_DISABLED_PLATFORMS = ['tiktok', 'linkedin']

export const FORMAT_OPTIONS = [
  { value: POST_FORMAT.FEED, label: 'Feed' },
  { value: POST_FORMAT.STORY, label: 'Story' },
  { value: POST_FORMAT.REELS, label: 'Reels' },
]

export function getFormatBehavior(format) {
  const isReels = format === POST_FORMAT.REELS
  const isStory = format === POST_FORMAT.STORY
  return {
    showReelsWarning: isReels,
    suggestedAspectRatio: isReels || isStory ? '9:16' : null,
    // Story aceita 1 arquivo só (uploadStory = single('arquivo') no backend — mandar mais seria
    // descartado silenciosamente pelo multer).
    maxFiles: isStory ? 1 : 10,
    disabledPlatforms: isStory ? STORY_DISABLED_PLATFORMS : [],
    // Story não tem legenda: a API de Stories da Meta não aceita o campo, e o backend removeu
    // as rotas de edição. `caption` ainda vem nas leituras, mas sempre null pra Story — é
    // ausência de campo, não campo vazio a preencher.
    showCaptionField: !isStory,
    showRecurrencePanel: isStory,
  }
}
