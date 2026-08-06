// Espelha os valores válidos de `format` do backend (agora só FEED/STORY/REELS/null — um
// carrossel também é FEED, já que a distinção vem da quantidade de arquivos anexados no upload,
// não da IA). Único lugar que conhece esses valores e o que cada um significa para a UI.
export const POST_FORMAT = {
  FEED: 'FEED',
  STORY: 'STORY',
  REELS: 'REELS',
}

export const FORMAT_OPTIONS = [
  { value: POST_FORMAT.FEED, label: 'Feed' },
  { value: POST_FORMAT.STORY, label: 'Story' },
  { value: POST_FORMAT.REELS, label: 'Reels' },
]

export function getFormatBehavior(format) {
  const isReels = format === POST_FORMAT.REELS
  const isStory = format === POST_FORMAT.STORY
  return {
    showCaptionBox: true,
    showReelsWarning: isReels,
    showStoryComingSoon: isStory,
    suggestedAspectRatio: isReels || isStory ? '9:16' : null,
  }
}
