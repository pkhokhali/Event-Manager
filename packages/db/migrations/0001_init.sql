-- D1 initial schema for Event Manager
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS event_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS event_categories_active_sort_idx ON event_categories (is_active, sort_order);

CREATE TABLE IF NOT EXISTS event_subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS event_subcategories_category_slug_uidx ON event_subcategories (category_id, slug);
CREATE INDEX IF NOT EXISTS event_subcategories_category_active_idx ON event_subcategories (category_id, is_active);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ne TEXT,
  description TEXT,
  category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,
  price_min REAL,
  price_max REAL,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS vendors_category_available_idx ON vendors (category, is_available);
CREATE INDEX IF NOT EXISTS vendors_featured_idx ON vendors (is_featured);
CREATE INDEX IF NOT EXISTS vendors_name_idx ON vendors (name);

CREATE TABLE IF NOT EXISTS vendor_media (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS vendor_media_vendor_idx ON vendor_media (vendor_id);

CREATE TABLE IF NOT EXISTS vendor_reviews (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS vendor_reviews_vendor_status_idx ON vendor_reviews (vendor_id, status);
CREATE INDEX IF NOT EXISTS vendor_reviews_device_idx ON vendor_reviews (device_id);

CREATE TABLE IF NOT EXISTS festivals (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  gregorian_date TEXT NOT NULL,
  bikram_date TEXT,
  tithi_label TEXT,
  muhurta_note TEXT,
  is_national INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS festivals_gregorian_idx ON festivals (gregorian_date);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ne TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS banners_active_sort_idx ON banners (is_active, sort_order);

CREATE TABLE IF NOT EXISTS featured_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ne TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  vendor_id TEXT,
  festival_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS featured_active_sort_idx ON featured_events (is_active, sort_order);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id TEXT PRIMARY KEY,
  template_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'PUSH',
  status TEXT NOT NULL DEFAULT 'PENDING',
  scheduled_at TEXT,
  sent_at TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS notification_jobs_status_scheduled_idx ON notification_jobs (status, scheduled_at);

CREATE TABLE IF NOT EXISTS device_tokens (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  fcm_token TEXT NOT NULL,
  platform TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS device_tokens_device_fcm_uidx ON device_tokens (device_id, fcm_token);
CREATE INDEX IF NOT EXISTS device_tokens_device_idx ON device_tokens (device_id);

CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  folder TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
