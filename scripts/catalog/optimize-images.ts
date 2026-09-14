import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

export type ImageVariantSet = {
  full: Buffer
  card: Buffer
  thumb: Buffer
  width: number
  height: number
  mimeType: string
}

export async function inspectImage(absPath: string) {
  const image = sharp(absPath, { failOn: 'none' }).rotate()
  const meta = await image.metadata()
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    mimeType: meta.format ? `image/${meta.format}` : 'application/octet-stream',
    corrupt: !meta.width || !meta.height,
  }
}

export async function optimizeImage(absPath: string): Promise<ImageVariantSet> {
  const base = sharp(absPath, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  const full = await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer()
  const card = await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
  const thumb = await sharp(absPath, { failOn: 'none' })
    .rotate()
    .resize({ width: 240, height: 240, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer()
  return { full, card, thumb, width, height, mimeType: 'image/webp' }
}

export function cacheDir(root: string) {
  const dir = path.join(root, '.cache', 'catalog-images')
  mkdirSync(dir, { recursive: true })
  return dir
}
