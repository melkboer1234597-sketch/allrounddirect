import { useSyncExternalStore } from 'react'
import type { CatalogProduct, Money } from '@/types/catalog'

export const CART_MIN_QTY = 1
export const CART_MAX_QTY = 99

export type CartLine = {
  slug: string
  name: string
  quantity: number
  price: Money | null
  image?: string
  imageFit?: 'cover' | 'contain'
  brand?: string
  href: string
}

const KEY = 'allround-cart-v1'
const EVENT = 'allround-cart-change'
const EMPTY: CartLine[] = []

let cachedRaw: string | null = null
let cachedLines: CartLine[] = EMPTY

function emit() {
  window.dispatchEvent(new Event(EVENT))
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return CART_MIN_QTY
  return Math.min(CART_MAX_QTY, Math.max(CART_MIN_QTY, Math.floor(quantity)))
}

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === cachedRaw) return cachedLines
    cachedRaw = raw
    if (!raw) {
      cachedLines = EMPTY
      return cachedLines
    }
    const parsed = JSON.parse(raw) as CartLine[]
    cachedLines = Array.isArray(parsed)
      ? parsed.map((line) => ({
          ...line,
          quantity: clampQuantity(line.quantity),
        }))
      : EMPTY
    return cachedLines
  } catch {
    cachedLines = EMPTY
    return EMPTY
  }
}

function writeCart(lines: CartLine[]) {
  const raw = JSON.stringify(lines)
  localStorage.setItem(KEY, raw)
  cachedRaw = raw
  cachedLines = lines
  emit()
}

export function addToCart(product: CatalogProduct, quantity = 1) {
  const lines = readCart()
  const existing = lines.find((line) => line.slug === product.slug)
  const nextQty = clampQuantity((existing?.quantity ?? 0) + quantity)
  if (existing) {
    existing.quantity = nextQty
    existing.brand = product.brand ?? existing.brand
    existing.image = product.images[0]?.src ?? existing.image
    existing.imageFit = product.images[0]?.fit ?? existing.imageFit
    existing.price = product.price ?? existing.price
  } else {
    lines.push({
      slug: product.slug,
      name: product.name,
      quantity: nextQty,
      price: product.price,
      image: product.images[0]?.src,
      imageFit: product.images[0]?.fit,
      brand: product.brand,
      href: `/product/${product.slug}`,
    })
  }
  writeCart(lines)
}

export function setCartQuantity(slug: string, quantity: number) {
  if (quantity <= 0) {
    writeCart(readCart().filter((line) => line.slug !== slug))
    return
  }
  const next = clampQuantity(quantity)
  writeCart(readCart().map((line) => (line.slug === slug ? { ...line, quantity: next } : line)))
}

export function removeFromCart(slug: string) {
  writeCart(readCart().filter((line) => line.slug !== slug))
}

export function cartCount(lines = readCart()): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function cartSubtotal(lines = readCart()): number {
  return lines.reduce((sum, line) => {
    const amount = line.price?.amount
    return sum + (amount ? amount * line.quantity : 0)
  }, 0)
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function clearCart() {
  writeCart([])
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, readCart, () => EMPTY)
  return {
    lines,
    count: cartCount(lines),
    subtotal: cartSubtotal(lines),
    add: addToCart,
    setQuantity: setCartQuantity,
    remove: removeFromCart,
  }
}
