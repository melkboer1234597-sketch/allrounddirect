import { describe, expect, it } from 'vitest'
import {
  createScrollPositionStore,
  isCatalogQueryOnlyChange,
} from '../src/lib/scroll'

describe('scroll navigation helpers', () => {
  it('detects same-path catalog query updates', () => {
    expect(
      isCatalogQueryOnlyChange('/meubels', '/meubels', '', '?page=2&sort=price_asc'),
    ).toBe(true)
    expect(isCatalogQueryOnlyChange('/meubels', '/vloeren', '', '?page=2')).toBe(false)
    expect(isCatalogQueryOnlyChange('/meubels', '/meubels', '?page=1', '?page=1')).toBe(false)
    expect(
      isCatalogQueryOnlyChange('/zoeken', '/zoeken', '?q=stoel', '?q=stoel&sort=newest'),
    ).toBe(true)
  })

  it('stores and restores scroll positions by history key', () => {
    const store = createScrollPositionStore(3)
    store.save('a', { y: 120, pathname: '/meubels' })
    store.save('b', { y: 40, pathname: '/product/x' })
    expect(store.get('a')?.y).toBe(120)
    expect(store.get('b')?.pathname).toBe('/product/x')

    store.save('c', { y: 1, pathname: '/' })
    store.save('d', { y: 2, pathname: '/contact' })
    // Limit 3 → oldest 'a' evicted
    expect(store.get('a')).toBeUndefined()
    expect(store.get('b')?.y).toBe(40)
    expect(store.get('d')?.y).toBe(2)
  })

  it('updates existing keys without growing unbounded', () => {
    const store = createScrollPositionStore(2)
    store.save('a', { y: 10, pathname: '/' })
    store.save('a', { y: 99, pathname: '/' })
    store.save('b', { y: 20, pathname: '/cart' })
    expect(store.get('a')?.y).toBe(99)
    store.save('c', { y: 30, pathname: '/x' })
    expect(store.get('a')).toBeUndefined()
  })
})
