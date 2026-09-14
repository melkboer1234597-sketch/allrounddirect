import { Hono } from 'hono'
import { mediaKeyFromPath } from '../../shared/media'
import type { AppEnv } from '../types'

export const mediaRoutes = new Hono<AppEnv>()

mediaRoutes.get('/*', async (c) => {
  const key = mediaKeyFromPath(new URL(c.req.url).pathname)
  if (!key) return c.body('Not found', 404)

  const object = await c.env.MEDIA.get(key)
  if (object) {
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    if (!headers.get('Content-Type')) {
      headers.set('Content-Type', guessContentType(key))
    }
    return new Response(object.body, { headers })
  }

  if (c.env.ASSETS) {
    const asset = await c.env.ASSETS.fetch(c.req.raw)
    const type = asset.headers.get('Content-Type') ?? ''
    if (asset.ok && type.startsWith('image/')) return asset
  }
  return c.body('Not found', 404)
})

function guessContentType(key: string) {
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'
  if (key.endsWith('.avif')) return 'image/avif'
  if (key.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}
