import { useSyncExternalStore } from 'react'
import type { CatalogProduct, Money } from '@/types/catalog'

export type CartLine = {
  slug: string
  name: string
  quantity: number
  price: Money | null
  image?: string
  href: string
}

const KEY = 'allround-cart-v1'
const EVENT = 'allround-cart-change'

function emit() {
  window.dispatchEvent(new Event(EVENT))
}

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines))
  emit()
}

export function addToCart(product: CatalogProduct, quantity = 1) {
  const lines = readCart()
  const existing = lines.find((line) => line.slug === product.slug)
  if (existing) existing.quantity += quantity
  else {
    lines.push({
      slug: product.slug,
      name: product.name,
      quantity,
      price: product.price,
      image: product.images[0]?.src,
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
  writeCart(readCart().map((line) => (line.slug === slug ? { ...line, quantity } : line)))
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

export function useCart() {
  const lines = useSyncExternalStore(subscribe, readCart, () => [])
  return {
    lines,
    count: cartCount(lines),
    subtotal: cartSubtotal(lines),
    add: addToCart,
    setQuantity: setCartQuantity,
  }
}
