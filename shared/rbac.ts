/** Rollen. Publieke registratie mag uitsluitend `customer` krijgen. */

export const USER_ROLES = [
  'customer',
  'admin',
  'super_admin',
  'catalog_manager',
  'order_manager',
  'support',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const STAFF_ROLES = [
  'admin',
  'super_admin',
  'catalog_manager',
  'order_manager',
  'support',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export const PERMISSIONS = [
  'admin.access',
  'catalog.write',
  'orders.write',
  'orders.read',
  'customers.read',
  'marketing.write',
  'users.roles',
  'settings.write',
  'audit.read',
  'imports.write',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [],
  support: ['admin.access', 'orders.read', 'customers.read'],
  order_manager: ['admin.access', 'orders.read', 'orders.write', 'customers.read'],
  catalog_manager: ['admin.access', 'catalog.write', 'imports.write'],
  admin: [
    'admin.access',
    'catalog.write',
    'orders.write',
    'orders.read',
    'customers.read',
    'marketing.write',
    'settings.write',
    'audit.read',
    'imports.write',
  ],
  super_admin: [
    'admin.access',
    'catalog.write',
    'orders.write',
    'orders.read',
    'customers.read',
    'marketing.write',
    'users.roles',
    'settings.write',
    'audit.read',
    'imports.write',
  ],
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value)
}

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value)
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (!isUserRole(role)) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export const RETURN_STATUSES = [
  'requested',
  'approved',
  'in_transit',
  'received',
  'inspected',
  'refund_pending',
  'refunded',
  'rejected',
] as const

export type ReturnStatus = (typeof RETURN_STATUSES)[number]

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: 'Aangevraagd',
  approved: 'Goedgekeurd',
  in_transit: 'Onderweg',
  received: 'Ontvangen',
  inspected: 'Geïnspecteerd',
  refund_pending: 'Terugbetaling in behandeling',
  refunded: 'Terugbetaald',
  rejected: 'Afgewezen',
}

export const QUOTE_STATUSES = [
  'lead',
  'in_review',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'converted_to_order',
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  lead: 'Aanvraag',
  in_review: 'In beoordeling',
  quoted: 'Offerte verstuurd',
  accepted: 'Geaccepteerd',
  rejected: 'Afgewezen',
  expired: 'Verlopen',
  converted_to_order: 'Omgezet naar order',
}

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const SUPPLIER_FEED_TYPES = ['manual', 'csv', 'xml', 'api'] as const
export type SupplierFeedType = (typeof SUPPLIER_FEED_TYPES)[number]
