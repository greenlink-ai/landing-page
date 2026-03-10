import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core'

// ─── Leads ──────────────────────────────────────────────────────────────────
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

  // Informação de Contacto
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),

  // Qualificação de Necessidades
  needs: text('needs').array(),
  message: text('message'),

  // Contexto de Aquisição
  source: text('source').default('website'),
  locale: text('locale').default('pt'),

  // Gestão Interna
  status: text('status').default('new'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert

// ─── Newsletter Subscribers ─────────────────────────────────────────────────
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  locale: text('locale').default('pt'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
})

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert
