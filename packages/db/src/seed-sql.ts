/**
 * Generates seed SQL for D1 (stdout). Pipe into wrangler d1 execute.
 * Usage: npm run seed:sql -w @event-manager/db > /tmp/seed.sql
 */
import { CATEGORY_SEED } from '@event-manager/shared';
import { randomUUID } from 'node:crypto';

function esc(v: string | null | undefined) {
  if (v == null) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

const lines: string[] = ['PRAGMA foreign_keys = ON;'];

for (const cat of CATEGORY_SEED) {
  const catId = randomUUID();
  lines.push(
    `INSERT OR IGNORE INTO event_categories (id, slug, name_en, name_ne, icon, sort_order, is_active) VALUES (${esc(catId)}, ${esc(cat.slug)}, ${esc(cat.nameEn)}, ${esc(cat.nameNe)}, ${esc(cat.icon)}, ${cat.sortOrder}, 1);`
  );
  // Use subquery by slug for subcategory FK so re-runs work with OR IGNORE on categories
  for (const sub of cat.subcategories) {
    const subId = randomUUID();
    lines.push(
      `INSERT OR IGNORE INTO event_subcategories (id, category_id, slug, name_en, name_ne, sort_order, is_active)
       SELECT ${esc(subId)}, id, ${esc(sub.slug)}, ${esc(sub.nameEn)}, ${esc(sub.nameNe)}, ${sub.sortOrder}, 1
       FROM event_categories WHERE slug = ${esc(cat.slug)};`
    );
  }
}

const festivals = [
  {
    slug: 'dashain-2026',
    nameEn: 'Dashain',
    nameNe: 'दशैं',
    gregorianDate: '2026-10-20T00:00:00.000Z',
    bikramDate: '2083 Ashwin',
    tithiLabel: 'Ghatasthapana',
    descriptionEn: 'Greatest festival of Nepal',
    descriptionNe: 'नेपालको सबैभन्दा ठूलो पर्व',
  },
  {
    slug: 'tihar-2026',
    nameEn: 'Tihar',
    nameNe: 'तिहार',
    gregorianDate: '2026-11-04T00:00:00.000Z',
    bikramDate: '2083 Kartik',
    tithiLabel: 'Laxmi Puja',
    descriptionEn: 'Festival of lights',
    descriptionNe: 'प्रकाशको पर्व',
  },
  {
    slug: 'holi-2026',
    nameEn: 'Holi',
    nameNe: 'होली',
    gregorianDate: '2026-03-14T00:00:00.000Z',
    bikramDate: '2082 Falgun',
    tithiLabel: 'Phagu Purnima',
  },
  {
    slug: 'teej-2026',
    nameEn: 'Teej',
    nameNe: 'तीज',
    gregorianDate: '2026-09-05T00:00:00.000Z',
    bikramDate: '2083 Bhadra',
  },
] as const;

for (const f of festivals) {
  lines.push(
    `INSERT OR IGNORE INTO festivals (id, slug, name_en, name_ne, description_en, description_ne, gregorian_date, bikram_date, tithi_label, is_national)
     VALUES (${esc(randomUUID())}, ${esc(f.slug)}, ${esc(f.nameEn)}, ${esc(f.nameNe)}, ${esc('descriptionEn' in f ? f.descriptionEn : null)}, ${esc('descriptionNe' in f ? f.descriptionNe : null)}, ${esc(f.gregorianDate)}, ${esc(f.bikramDate)}, ${esc('tithiLabel' in f ? f.tithiLabel : null)}, 1);`
  );
}

const vendors = [
  {
    name: 'Himalayan Catering',
    nameNe: 'हिमालयन खाना',
    category: 'CATERING',
    city: 'Kathmandu',
    phone: '+9779800000001',
    rating: 4.5,
    priceMin: 50000,
    priceMax: 500000,
    isFeatured: 1,
    description: 'Premium Nepali and continental catering for weddings and events.',
  },
  {
    name: 'Everest Photography',
    nameNe: 'एभरेस्ट फोटोग्राफी',
    category: 'PHOTOGRAPHY',
    city: 'Pokhara',
    phone: '+9779800000002',
    rating: 4.8,
    priceMin: 25000,
    priceMax: 150000,
    isFeatured: 1,
    description: null,
  },
  {
    name: 'Mandala Decorators',
    nameNe: 'मण्डला सजावट',
    category: 'DECORATOR',
    city: 'Kathmandu',
    phone: '+9779800000003',
    rating: 4.3,
    priceMin: 30000,
    priceMax: 300000,
    isFeatured: 0,
    description: null,
  },
  {
    name: 'Pashupati Pandit Services',
    nameNe: 'पशुपति पण्डित',
    category: 'PANDIT',
    city: 'Kathmandu',
    phone: '+9779800000004',
    rating: 4.9,
    priceMin: 5000,
    priceMax: 50000,
    isFeatured: 0,
    description: null,
  },
];

for (const v of vendors) {
  lines.push(
    `INSERT OR IGNORE INTO vendors (id, name, name_ne, description, category, phone, city, price_min, price_max, rating, is_featured, is_available)
     SELECT ${esc(randomUUID())}, ${esc(v.name)}, ${esc(v.nameNe)}, ${esc(v.description)}, ${esc(v.category)}, ${esc(v.phone)}, ${esc(v.city)}, ${v.priceMin}, ${v.priceMax}, ${v.rating}, ${v.isFeatured}, 1
     WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = ${esc(v.name)});`
  );
}

lines.push(
  `INSERT OR IGNORE INTO banners (id, title, title_ne, image_url, sort_order, is_active)
   SELECT ${esc(randomUUID())}, 'Plan Your Dream Wedding', 'सपनाको विवाह योजना', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 1, 1
   WHERE NOT EXISTS (SELECT 1 FROM banners WHERE title = 'Plan Your Dream Wedding');`
);

console.log(lines.join('\n'));
