import { createHash } from 'node:crypto'

export function sha256FileBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

export function sha256Text(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function stableProductId(source: string, sku: string, url: string): string {
  const hex = sha256Text(`${source}|${sku}|${url}`).slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
