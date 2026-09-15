import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { hasPermission, isStaffRole } from '../shared/rbac'

describe('admin bootstrap credential hashing', () => {
  it('uses Better Auth hash/verify roundtrip (no plaintext storage shape)', async () => {
    const password = `test-only-${crypto.randomUUID()}`
    const hash = await hashPassword(password)
    expect(hash).toBeTruthy()
    expect(hash).not.toContain(password)
    expect(await verifyPassword({ hash, password })).toBe(true)
    expect(await verifyPassword({ hash, password: `${password}-wrong` })).toBe(false)
  })
})

describe('admin route authorization model', () => {
  it('grants super_admin full staff permissions including users.roles', () => {
    expect(isStaffRole('super_admin')).toBe(true)
    expect(hasPermission('super_admin', 'admin.access')).toBe(true)
    expect(hasPermission('super_admin', 'users.roles')).toBe(true)
  })

  it('blocks customers from admin.access and users.roles', () => {
    expect(isStaffRole('customer')).toBe(false)
    expect(hasPermission('customer', 'admin.access')).toBe(false)
    expect(hasPermission('customer', 'users.roles')).toBe(false)
    expect(hasPermission('customer', 'orders.write')).toBe(false)
  })
})
