import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const eventCategories = sqliteTable(
  'event_categories',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    nameEn: text('name_en').notNull(),
    nameNe: text('name_ne').notNull(),
    icon: text('icon'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('event_categories_active_sort_idx').on(t.isActive, t.sortOrder)]
);

export const eventSubcategories = sqliteTable(
  'event_subcategories',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => eventCategories.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    nameEn: text('name_en').notNull(),
    nameNe: text('name_ne').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [
    uniqueIndex('event_subcategories_category_slug_uidx').on(t.categoryId, t.slug),
    index('event_subcategories_category_active_idx').on(t.categoryId, t.isActive),
  ]
);

export const vendors = sqliteTable(
  'vendors',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    nameNe: text('name_ne'),
    description: text('description'),
    category: text('category').notNull(),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    address: text('address'),
    city: text('city'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    priceMin: real('price_min'),
    priceMax: real('price_max'),
    rating: real('rating').notNull().default(0),
    reviewCount: integer('review_count').notNull().default(0),
    isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
    isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [
    index('vendors_category_available_idx').on(t.category, t.isAvailable),
    index('vendors_featured_idx').on(t.isFeatured),
    index('vendors_name_idx').on(t.name),
  ]
);

export const vendorMedia = sqliteTable(
  'vendor_media',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index('vendor_media_vendor_idx').on(t.vendorId)]
);

export const vendorReviews = sqliteTable(
  'vendor_reviews',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    deviceId: text('device_id').notNull(),
    rating: integer('rating').notNull(),
    title: text('title'),
    comment: text('comment'),
    authorName: text('author_name'),
    status: text('status').notNull().default('PENDING'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [
    index('vendor_reviews_vendor_status_idx').on(t.vendorId, t.status),
    index('vendor_reviews_device_idx').on(t.deviceId),
  ]
);

export const festivals = sqliteTable(
  'festivals',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    nameEn: text('name_en').notNull(),
    nameNe: text('name_ne').notNull(),
    descriptionEn: text('description_en'),
    descriptionNe: text('description_ne'),
    gregorianDate: text('gregorian_date').notNull(),
    bikramDate: text('bikram_date'),
    tithiLabel: text('tithi_label'),
    muhurtaNote: text('muhurta_note'),
    isNational: integer('is_national', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('festivals_gregorian_idx').on(t.gregorianDate)]
);

export const banners = sqliteTable(
  'banners',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    titleNe: text('title_ne'),
    imageUrl: text('image_url').notNull(),
    linkUrl: text('link_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    startsAt: text('starts_at'),
    endsAt: text('ends_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('banners_active_sort_idx').on(t.isActive, t.sortOrder)]
);

export const featuredEvents = sqliteTable(
  'featured_events',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    titleNe: text('title_ne'),
    description: text('description'),
    imageUrl: text('image_url'),
    linkUrl: text('link_url'),
    vendorId: text('vendor_id'),
    festivalId: text('festival_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    startsAt: text('starts_at'),
    endsAt: text('ends_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text('deleted_at'),
  },
  (t) => [index('featured_active_sort_idx').on(t.isActive, t.sortOrder)]
);

export const notificationJobs = sqliteTable(
  'notification_jobs',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    channel: text('channel').notNull().default('PUSH'),
    status: text('status').notNull().default('PENDING'),
    scheduledAt: text('scheduled_at'),
    sentAt: text('sent_at'),
    error: text('error'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index('notification_jobs_status_scheduled_idx').on(t.status, t.scheduledAt)]
);

export const deviceTokens = sqliteTable(
  'device_tokens',
  {
    id: text('id').primaryKey(),
    deviceId: text('device_id').notNull(),
    fcmToken: text('fcm_token').notNull(),
    platform: text('platform'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex('device_tokens_device_fcm_uidx').on(t.deviceId, t.fcmToken),
    index('device_tokens_device_idx').on(t.deviceId),
  ]
);

export const mediaFiles = sqliteTable('media_files', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  url: text('url').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  folder: text('folder').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const eventCategoriesRelations = relations(eventCategories, ({ many }) => ({
  subcategories: many(eventSubcategories),
}));

export const eventSubcategoriesRelations = relations(eventSubcategories, ({ one }) => ({
  category: one(eventCategories, {
    fields: [eventSubcategories.categoryId],
    references: [eventCategories.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  media: many(vendorMedia),
  reviews: many(vendorReviews),
}));

export const vendorMediaRelations = relations(vendorMedia, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorMedia.vendorId], references: [vendors.id] }),
}));

export const vendorReviewsRelations = relations(vendorReviews, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorReviews.vendorId], references: [vendors.id] }),
}));
