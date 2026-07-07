import { request } from './client'

const TIMEOUT_IMAGE_MS = 30_000            // 30s
const TIMEOUT_VIDEO_MS = 210_000           // 3.5min — Meta faz polling por até ~2min30

export async function publishPost(file, caption) {
  const isVideo = file.type.startsWith('video/')
  const endpoint = isVideo ? '/upload/vid' : '/upload/img'
  const fieldName = isVideo ? 'video' : 'image'

  const fd = new FormData()
  fd.append(fieldName, file)
  fd.append('caption', caption)

  return request(endpoint, { method: 'POST', body: fd })
}
