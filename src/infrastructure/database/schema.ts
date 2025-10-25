import {
  pgTable,
  varchar,
  decimal,
  timestamp,
  text,
  integer,
  boolean,
  json
} from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

export const customers = pgTable('customers', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  document: varchar('document', { length: 32 }).notNull().unique(),
  phone: varchar('phone', { length: 32 }),
  password: varchar('password', { length: 255 }).notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const users = pgTable('users', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const merchants = pgTable('merchants', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  website: varchar('website', { length: 255 }),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const customerMerchants = pgTable('customer_merchants', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  customerId: varchar('customer_id', { length: 25 }).references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  merchantId: varchar('merchant_id', { length: 25 }).references(() => merchants.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const charges = pgTable('charges', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  merchantId: varchar('merchant_id', { length: 25 }).references(() => merchants.id, { onDelete: 'cascade' }).notNull(),
  customerId: varchar('customer_id', { length: 25 }).references(() => customers.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL').notNull(),
  paymentMethod: varchar('payment_method', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).default('PENDING').notNull(),
  description: text('description'),
  externalId: varchar('external_id', { length: 255 }),
  metadata: json('metadata'),
  expiresAt: timestamp('expires_at'),
  paidAt: timestamp('paid_at'),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const idempotencyKeys = pgTable('idempotency_keys', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id, { onDelete: 'cascade' }).notNull(),
  requestHash: varchar('request_hash', { length: 255 }),
  responseStatus: integer('response_status'),
  responseBody: json('response_body'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const pixDetails = pgTable('pix_payment_details', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id, { onDelete: 'cascade' }).unique().notNull(),
  qrCode: text('qr_code').notNull(),
  qrCodeBase64: text('qr_code_base64'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const boletoDetails = pgTable('boleto_payment_details', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id, { onDelete: 'cascade' }).unique().notNull(),
  barcode: varchar('barcode', { length: 255 }).notNull(),
  url: text('url').notNull(),
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const creditCardDetails = pgTable('credit_card_payment_details', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id, { onDelete: 'cascade' }).unique().notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }).notNull(),
  brand: varchar('brand', { length: 50 }).notNull(),
  holderName: varchar('holder_name', { length: 255 }).notNull(),
  installments: integer('installments').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const paymentMethods = pgTable('payment_methods', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  customerId: varchar('customer_id', { length: 25 }).references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }),
  token: varchar('token', { length: 255 }).notNull(),
  last4: varchar('last4', { length: 4 }),
  brand: varchar('brand', { length: 50 }),
  metadata: json('metadata'),
  isDefault: boolean('is_default').default(false)
})

export const refunds = pgTable('refunds', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 255 }),
  status: varchar('status', { length: 32 }).default('PENDING').notNull(),
  externalId: varchar('external_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const webhooks = pgTable('webhooks', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  merchantId: varchar('merchant_id', { length: 25 }).references(() => merchants.id, { onDelete: 'cascade' }),
  targetUrl: varchar('target_url', { length: 2048 }).notNull(),
  lastStatus: integer('last_status'),
  lastResponse: text('last_response'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const webhookEvents = pgTable('webhook_events', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  webhookId: varchar('webhook_id', { length: 25 }).references(() => webhooks.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 128 }).notNull(),
  payload: json('payload').notNull(),
  deliveredAt: timestamp('delivered_at'),
  attempts: integer('attempts').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const wallets = pgTable('wallets', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  merchantId: varchar('merchant_id', { length: 25 }).references(() => merchants.id, { onDelete: 'cascade' }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL').notNull(),
  balance: decimal('balance', { precision: 14, scale: 2 }).default('0').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const walletEntries = pgTable('wallet_entries', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  walletId: varchar('wallet_id', { length: 25 }).references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  chargeId: varchar('charge_id', { length: 25 }).references(() => charges.id),
  type: varchar('type', { length: 32 }).notNull(), // CREDIT, DEBIT, FEE, REFUND
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 25 }).$defaultFn(() => createId()).primaryKey(),
  entity: varchar('entity', { length: 128 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }),
  action: varchar('action', { length: 128 }).notNull(),
  actor: varchar('actor', { length: 255 }),
  before: json('before'),
  after: json('after'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const customersRelations = relations(customers, ({ many }) => ({
  charges: many(charges),
  paymentMethods: many(paymentMethods)
}))

export const merchantsRelations = relations(merchants, ({ many }) => ({
  charges: many(charges),
  webhooks: many(webhooks),
  wallets: many(wallets)
}))

export const chargesRelations = relations(charges, ({ one, many }) => ({
  merchant: one(merchants, { fields: [charges.merchantId], references: [merchants.id] }),
  customer: one(customers, { fields: [charges.customerId], references: [customers.id] }),
  pix: one(pixDetails, { fields: [charges.id], references: [pixDetails.chargeId] }),
  boleto: one(boletoDetails, { fields: [charges.id], references: [boletoDetails.chargeId] }),
  cc: one(creditCardDetails, { fields: [charges.id], references: [creditCardDetails.chargeId] }),
  refunds: many(refunds)
}))

export const table = {
  customers,
  merchants,
  customerMerchants,
  charges,
  pixDetails,
  boletoDetails,
  creditCardDetails,
  paymentMethods,
  refunds,
  idempotencyKeys,
  webhooks,
  webhookEvents,
  wallets,
  walletEntries,
  auditLogs
} as const

export type Table = typeof table