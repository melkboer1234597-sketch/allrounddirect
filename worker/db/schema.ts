import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

/**
 * Better Auth kern-tabellen (snake_case kolommen, camelCase velden).
 * Aanvullende tabellen: klantprofiel, adressen, wishlist, rate-limit, orders (later checkout).
 */

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  firstName: text('first_name').notNull().default(''),
  lastName: text('last_name').notNull().default(''),
  marketingOptIn: integer('marketing_opt_in', { mode: 'boolean' }).default(false).notNull(),
  role: text('role').notNull().default('customer'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const customerProfiles = sqliteTable(
  'customer_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    companyName: text('company_name'),
    kvk: text('kvk'),
    vatNumber: text('vat_number'),
    marketingOptIn: integer('marketing_opt_in', { mode: 'boolean' }).default(false).notNull(),
    termsAcceptedAt: integer('terms_accepted_at', { mode: 'timestamp_ms' }).notNull(),
    accountStatus: text('account_status').default('active').notNull(),
    deletionRequestedAt: integer('deletion_requested_at', { mode: 'timestamp_ms' }),
    twoFactorPending: integer('two_factor_pending', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch() * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch() * 1000 as integer))`),
  },
  (table) => [uniqueIndex('customer_profiles_userId_uidx').on(table.userId)],
)

export const addresses = sqliteTable(
  'addresses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    label: text('label'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    companyName: text('company_name'),
    street: text('street').notNull(),
    houseNumber: text('house_number').notNull(),
    addition: text('addition'),
    postalCode: text('postal_code').notNull(),
    city: text('city').notNull(),
    country: text('country').notNull().default('NL'),
    phone: text('phone'),
    isDefaultShipping: integer('is_default_shipping', { mode: 'boolean' }).default(false).notNull(),
    isDefaultBilling: integer('is_default_billing', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch() * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch() * 1000 as integer))`),
  },
  (table) => [index('addresses_userId_idx').on(table.userId)],
)

export const wishlistItems = sqliteTable(
  'wishlist_items',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    productSlug: text('product_slug').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch() * 1000 as integer))`),
  },
  (table) => [
    uniqueIndex('wishlist_user_product_uidx').on(table.userId, table.productSlug),
    index('wishlist_userId_idx').on(table.userId),
  ],
)

export const rateLimitHits = sqliteTable(
  'rate_limit_hits',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bucket: text('bucket').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('rate_limit_bucket_created_idx').on(table.bucket, table.createdAt)],
)

export const authKv = sqliteTable('auth_kv', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
})

export const accountDeletionRequests = sqliteTable(
  'account_deletion_requests',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('pending'),
    note: text('note'),
    requestedAt: integer('requested_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('deletion_requests_userId_idx').on(table.userId)],
)

export const devEmailOutbox = sqliteTable('dev_email_outbox', {
  id: text('id').primaryKey(),
  toEmail: text('to_email').notNull(),
  subject: text('subject').notNull(),
  type: text('type').notNull(),
  actionUrl: text('action_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

/**
 * Orderadministratie (checkout volgt). Blijft bestaan bij accountverwijdering
 * via userId-ontkoppeling; guestEmail/snapshots blijven voor wettelijke bewaarplicht.
 */
export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    guestEmail: text('guest_email').notNull(),
    customerType: text('customer_type').notNull().default('consumer'),
    status: text('status').notNull(),
    currency: text('currency').notNull().default('EUR'),
    subtotalCents: integer('subtotal_cents').notNull(),
    vatCents: integer('vat_cents').notNull(),
    shippingCents: integer('shipping_cents').notNull(),
    totalCents: integer('total_cents').notNull(),
    paymentMethod: text('payment_method'),
    paymentStatus: text('payment_status').notNull().default('pending'),
    molliePaymentId: text('mollie_payment_id'),
    confirmationToken: text('confirmation_token').notNull().default(''),
    guestPhone: text('guest_phone'),
    shippingCountry: text('shipping_country').notNull().default('NL'),
    discountCents: integer('discount_cents').notNull().default(0),
    idempotencyKey: text('idempotency_key'),
    inventoryAdjustedAt: integer('inventory_adjusted_at', { mode: 'timestamp_ms' }),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
    internalNotes: text('internal_notes'),
    billingSnapshot: text('billing_snapshot').notNull(),
    shippingSnapshot: text('shipping_snapshot').notNull(),
    placedAt: integer('placed_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('orders_userId_idx').on(table.userId),
    index('orders_guestEmail_idx').on(table.guestEmail),
    uniqueIndex('orders_idempotency_key_uidx').on(table.idempotencyKey),
  ],
)

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    sku: text('sku'),
    productId: text('product_id'),
    productSlug: text('product_slug'),
    variantName: text('variant_name'),
    variantOptionsJson: text('variant_options_json'),
    imageRef: text('image_ref'),
    quantity: integer('quantity').notNull(),
    unitPriceCents: integer('unit_price_cents').notNull(),
    vatRate: integer('vat_rate').notNull().default(21),
    vatCents: integer('vat_cents').notNull().default(0),
    lineTotalCents: integer('line_total_cents').notNull().default(0),
    snapshotJson: text('snapshot_json'),
  },
  (table) => [index('order_items_orderId_idx').on(table.orderId)],
)

export const shipments = sqliteTable(
  'shipments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    publicLabel: text('public_label').notNull(),
    supplierCode: text('supplier_code'),
    supplierPublicName: text('supplier_public_name'),
    showSupplierToCustomer: integer('show_supplier_to_customer', { mode: 'boolean' })
      .default(false)
      .notNull(),
    status: text('status').notNull(),
    carrier: text('carrier'),
    trackingCode: text('tracking_code'),
    trackingUrl: text('tracking_url'),
    shippedAt: integer('shipped_at', { mode: 'timestamp_ms' }),
    deliveredAt: integer('delivered_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('shipments_orderId_idx').on(table.orderId)],
)

export const shipmentItems = sqliteTable('shipment_items', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id')
    .notNull()
    .references(() => shipments.id, { onDelete: 'cascade' }),
  orderItemId: text('order_item_id')
    .notNull()
    .references(() => orderItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
})

export const orderNotes = sqliteTable('order_notes', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  authorUserId: text('author_user_id'),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const refunds = sqliteTable(
  'refunds',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    paymentId: text('payment_id'),
    providerRefundId: text('provider_refund_id'),
    amountCents: integer('amount_cents').notNull(),
    reason: text('reason'),
    status: text('status').notNull(),
    requestedByAdmin: text('requested_by_admin'),
    idempotencyKey: text('idempotency_key'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('refunds_order_idx').on(table.orderId),
    uniqueIndex('refunds_idempotency_key_uidx').on(table.idempotencyKey),
    uniqueIndex('refunds_provider_refund_id_uidx').on(table.providerRefundId),
  ],
)

export const brands = sqliteTable('brands', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const catalogCategories = sqliteTable(
  'catalog_categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    parentId: text('parent_id'),
    sortOrder: integer('sort_order').default(0).notNull(),
    active: integer('active', { mode: 'boolean' }).default(true).notNull(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    description: text('description'),
    robots: text('robots').default('index,follow').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('catalog_categories_parent_idx').on(table.parentId)],
)

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  internalCode: text('internal_code').notNull().unique(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  orderEmail: text('order_email'),
  notes: text('notes'),
  defaultLeadTime: text('default_lead_time'),
  feedType: text('feed_type').notNull().default('manual'),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    sku: text('sku'),
    ean: text('ean'),
    brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
    categoryId: text('category_id').references(() => catalogCategories.id, {
      onDelete: 'set null',
    }),
    subcategoryId: text('subcategory_id').references(() => catalogCategories.id, {
      onDelete: 'set null',
    }),
    status: text('status').notNull().default('draft'),
    priceInclCents: integer('price_incl_cents'),
    vatPercent: integer('vat_percent').notNull().default(21),
    compareAtInclCents: integer('compare_at_incl_cents'),
    costPriceCents: integer('cost_price_cents'),
    supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
    supplierSku: text('supplier_sku'),
    stockStatus: text('stock_status').notNull().default('unknown'),
    stockQuantity: integer('stock_quantity'),
    leadTimeMinDays: integer('lead_time_min_days'),
    leadTimeMaxDays: integer('lead_time_max_days'),
    deliveryType: text('delivery_type'),
    isOutlet: integer('is_outlet', { mode: 'boolean' }).default(false).notNull(),
    isBusinessOnly: integer('is_business_only', { mode: 'boolean' }).default(false).notNull(),
    specificationsJson: text('specifications_json'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    canonicalOverride: text('canonical_override'),
    robots: text('robots').default('index,follow').notNull(),
    ogImage: text('og_image'),
    sourceName: text('source_name'),
    sourceUrl: text('source_url'),
    sourceProductId: text('source_product_id'),
    sourceRightsStatus: text('source_rights_status').default('needs_review'),
    currency: text('currency').default('EUR'),
    originalSourceName: text('original_source_name'),
    priceOnRequest: integer('price_on_request', { mode: 'boolean' }).default(false).notNull(),
    reviewStatus: text('review_status').default('ok').notNull(),
    qualityFlags: text('quality_flags').default('[]').notNull(),
    isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('products_status_idx').on(table.status),
    index('products_sku_idx').on(table.sku),
    index('products_category_idx').on(table.categoryId),
    index('products_brand_idx').on(table.brandId),
    index('products_review_status_idx').on(table.reviewStatus),
    uniqueIndex('products_source_url_uidx').on(table.sourceUrl),
  ],
)

export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt'),
    sortOrder: integer('sort_order').default(0).notNull(),
    r2Key: text('r2_key'),
    originalFilename: text('original_filename'),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false).notNull(),
    width: integer('width'),
    height: integer('height'),
    mimeType: text('mime_type'),
    fileSize: integer('file_size'),
    contentHash: text('content_hash'),
    imageStatus: text('image_status').default('ok').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('product_images_product_idx').on(table.productId),
    index('product_images_hash_idx').on(table.contentHash),
    index('product_images_status_idx').on(table.imageStatus),
  ],
)

export const productSpecifications = sqliteTable(
  'product_specifications',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    value: text('value').notNull(),
    groupName: text('group_name'),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [index('product_specs_product_idx').on(table.productId)],
)

export const importRuns = sqliteTable('import_runs', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
  status: text('status').notNull(),
  productsScanned: integer('products_scanned').default(0).notNull(),
  productsValid: integer('products_valid').default(0).notNull(),
  productsImported: integer('products_imported').default(0).notNull(),
  productsSkipped: integer('products_skipped').default(0).notNull(),
  imagesScanned: integer('images_scanned').default(0).notNull(),
  imagesUploaded: integer('images_uploaded').default(0).notNull(),
  imagesDuplicate: integer('images_duplicate').default(0).notNull(),
  errors: integer('errors').default(0).notNull(),
})

export const importErrors = sqliteTable(
  'import_errors',
  {
    id: text('id').primaryKey(),
    importRunId: text('import_run_id')
      .notNull()
      .references(() => importRuns.id, { onDelete: 'cascade' }),
    sourcePath: text('source_path'),
    productSourceId: text('product_source_id'),
    severity: text('severity').notNull(),
    code: text('code').notNull(),
    message: text('message').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('import_errors_run_idx').on(table.importRunId)],
)

export const productVariants = sqliteTable(
  'product_variants',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    optionsJson: text('options_json').notNull().default('{}'),
    sku: text('sku'),
    priceInclCents: integer('price_incl_cents'),
    stockStatus: text('stock_status').default('unknown'),
    stockQuantity: integer('stock_quantity'),
    imageUrl: text('image_url'),
    supplierSku: text('supplier_sku'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('product_variants_product_idx').on(table.productId)],
)

export const returns = sqliteTable(
  'returns',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('requested'),
    reason: text('reason'),
    customerNotes: text('customer_notes'),
    adminNotes: text('admin_notes'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('returns_order_idx').on(table.orderId)],
)

export const returnItems = sqliteTable('return_items', {
  id: text('id').primaryKey(),
  returnId: text('return_id')
    .notNull()
    .references(() => returns.id, { onDelete: 'cascade' }),
  orderItemId: text('order_item_id').references(() => orderItems.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  name: text('name').notNull(),
})

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  status: text('status').notNull().default('lead'),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const quoteItems = sqliteTable('quote_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
})

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(),
  valueCents: integer('value_cents'),
  percent: integer('percent'),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  startsAt: integer('starts_at', { mode: 'timestamp_ms' }),
  endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const siteContent = sqliteTable('site_content', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  updatedBy: text('updated_by'),
})

export const seoOverrides = sqliteTable(
  'seo_overrides',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    canonicalOverride: text('canonical_override'),
    robots: text('robots'),
    ogImage: text('og_image'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [uniqueIndex('seo_overrides_entity_uidx').on(table.entityType, table.entityId)],
)

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  filename: text('filename'),
  alt: text('alt'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const importJobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  status: text('status').notNull().default('uploaded'),
  mappingJson: text('mapping_json'),
  headersJson: text('headers_json'),
  previewJson: text('preview_json'),
  reportJson: text('report_json'),
  rowCount: integer('row_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actorUserId: text('actor_user_id').notNull(),
    actorEmail: text('actor_email').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    summary: text('summary').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('audit_logs_created_idx').on(table.createdAt)],
)

/**
 * Herroepingsverzoeken (consumentenrecht). Geen account verplicht:
 * verificatie via ordernummer + e-mail. recordedAt is het juridisch relevante moment.
 */
export const withdrawalRequests = sqliteTable(
  'withdrawal_requests',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    orderNumber: text('order_number').notNull(),
    email: text('email').notNull(),
    scope: text('scope').notNull(),
    status: text('status').notNull().default('received'),
    customerNote: text('customer_note'),
    confirmationCode: text('confirmation_code').notNull().unique(),
    recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('withdrawal_order_idx').on(table.orderId),
    index('withdrawal_email_idx').on(table.email),
  ],
)

export const withdrawalItems = sqliteTable(
  'withdrawal_items',
  {
    id: text('id').primaryKey(),
    withdrawalId: text('withdrawal_id')
      .notNull()
      .references(() => withdrawalRequests.id, { onDelete: 'cascade' }),
    orderItemId: text('order_item_id').references(() => orderItems.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [index('withdrawal_items_withdrawal_idx').on(table.withdrawalId)],
)

export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('contact_messages_created_idx').on(table.createdAt)],
)

/** Betalingen los van de order. Ordernummer is geen security-id. */
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('mollie'),
    providerPaymentId: text('provider_payment_id').notNull().unique(),
    status: text('status').notNull(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('EUR'),
    checkoutUrl: text('checkout_url'),
    method: text('method'),
    mode: text('mode').notNull().default('test'),
    metadataJson: text('metadata_json'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
  },
  (table) => [index('payments_order_idx').on(table.orderId)],
)

export const orderStatusHistory = sqliteTable(
  'order_status_history',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    source: text('source').notNull(),
    actorUserId: text('actor_user_id'),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('order_status_history_order_idx').on(table.orderId)],
)

export const orderNumberCounters = sqliteTable('order_number_counters', {
  year: integer('year').primaryKey(),
  lastValue: integer('last_value').notNull(),
})

/**
 * Idempotente webhook/statusverwerking: dezelfde providerstatus wordt één keer toegepast.
 */
export const processedWebhooks = sqliteTable('processed_webhooks', {
  externalKey: text('external_key').primaryKey(),
  provider: text('provider').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

/** Voorkomt dubbele e-mails/notificaties per event + entiteit. */
export const orderEventDeliveries = sqliteTable(
  'order_event_deliveries',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    channel: text('channel').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('order_event_deliveries_uidx').on(
      table.eventType,
      table.entityType,
      table.entityId,
      table.channel,
    ),
  ],
)

/** E-maillog zonder volledige body. */
export const emailLogs = sqliteTable(
  'email_logs',
  {
    id: text('id').primaryKey(),
    template: text('template').notNull(),
    recipient: text('recipient').notNull(),
    relatedEntityType: text('related_entity_type'),
    relatedEntityId: text('related_entity_id'),
    eventKey: text('event_key'),
    status: text('status').notNull(),
    providerMessageId: text('provider_message_id'),
    errorCode: text('error_code'),
    sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('email_logs_created_idx').on(table.createdAt)],
)

/** Idempotente e-mailgebeurtenissen (webhook-veilig). */
export const emailEvents = sqliteTable(
  'email_events',
  {
    id: text('id').primaryKey(),
    eventKey: text('event_key').notNull().unique(),
    template: text('template').notNull(),
    orderId: text('order_id'),
    recipient: text('recipient').notNull(),
    status: text('status').notNull(),
    providerMessageId: text('provider_message_id'),
    errorCode: text('error_code'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('email_events_order_idx').on(table.orderId),
    index('email_events_created_idx').on(table.createdAt),
  ],
)

/** Alleen development: nagebootste Mollie-betalingen, nooit live. */
export const devMolliePayments = sqliteTable('dev_mollie_payments', {
  id: text('id').primaryKey(),
  status: text('status').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('EUR'),
  metadataJson: text('metadata_json').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
