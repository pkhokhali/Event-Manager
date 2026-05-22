import { PrismaClient, VendorCategoryType } from '@prisma/client';
import { CATEGORY_SEED } from '@event-manager/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const cat of CATEGORY_SEED) {
    const category = await prisma.eventCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        nameEn: cat.nameEn,
        nameNe: cat.nameNe,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
      update: {
        nameEn: cat.nameEn,
        nameNe: cat.nameNe,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });

    for (const sub of cat.subcategories) {
      await prisma.eventSubcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        create: {
          categoryId: category.id,
          slug: sub.slug,
          nameEn: sub.nameEn,
          nameNe: sub.nameNe,
          sortOrder: sub.sortOrder,
        },
        update: {
          nameEn: sub.nameEn,
          nameNe: sub.nameNe,
          sortOrder: sub.sortOrder,
        },
      });
    }
  }

  const festivals = [
    {
      slug: 'dashain-2026',
      nameEn: 'Dashain',
      nameNe: 'दशैं',
      gregorianDate: new Date('2026-10-20'),
      bikramDate: '2083 Ashwin',
      tithiLabel: 'Ghatasthapana',
      descriptionEn: 'Greatest festival of Nepal',
      descriptionNe: 'नेपालको सबैभन्दा ठूलो पर्व',
    },
    {
      slug: 'tihar-2026',
      nameEn: 'Tihar',
      nameNe: 'तिहार',
      gregorianDate: new Date('2026-11-04'),
      bikramDate: '2083 Kartik',
      tithiLabel: 'Laxmi Puja',
      descriptionEn: 'Festival of lights',
      descriptionNe: 'प्रकाशको पर्व',
    },
    {
      slug: 'holi-2026',
      nameEn: 'Holi',
      nameNe: 'होली',
      gregorianDate: new Date('2026-03-14'),
      bikramDate: '2082 Falgun',
      tithiLabel: 'Phagu Purnima',
    },
    {
      slug: 'teej-2026',
      nameEn: 'Teej',
      nameNe: 'तीज',
      gregorianDate: new Date('2026-09-05'),
      bikramDate: '2083 Bhadra',
    },
  ];

  for (const f of festivals) {
    await prisma.festival.upsert({
      where: { slug: f.slug },
      create: f,
      update: f,
    });
  }

  const vendors = [
    {
      name: 'Himalayan Catering',
      nameNe: 'हिमालयन खाना',
      category: VendorCategoryType.CATERING,
      city: 'Kathmandu',
      phone: '+9779800000001',
      rating: 4.5,
      priceMin: 50000,
      priceMax: 500000,
      isFeatured: true,
      description: 'Premium Nepali and continental catering for weddings and events.',
    },
    {
      name: 'Everest Photography',
      nameNe: 'एभरेस्ट फोटोग्राफी',
      category: VendorCategoryType.PHOTOGRAPHY,
      city: 'Pokhara',
      phone: '+9779800000002',
      rating: 4.8,
      priceMin: 25000,
      priceMax: 150000,
      isFeatured: true,
    },
    {
      name: 'Mandala Decorators',
      nameNe: 'मण्डला सजावट',
      category: VendorCategoryType.DECORATOR,
      city: 'Kathmandu',
      phone: '+9779800000003',
      rating: 4.3,
      priceMin: 30000,
      priceMax: 300000,
    },
    {
      name: 'Pashupati Pandit Services',
      nameNe: 'पशुपति पण्डित',
      category: VendorCategoryType.PANDIT,
      city: 'Kathmandu',
      phone: '+9779800000004',
      rating: 4.9,
      priceMin: 5000,
      priceMax: 50000,
    },
  ];

  for (const v of vendors) {
    const existing = await prisma.vendor.findFirst({ where: { name: v.name } });
    if (!existing) {
      await prisma.vendor.create({ data: v });
    }
  }

  const bannerExists = await prisma.banner.findFirst({
    where: { title: 'Plan Your Dream Wedding' },
  });
  if (!bannerExists) {
    await prisma.banner.create({
      data: {
        title: 'Plan Your Dream Wedding',
        titleNe: 'सपनाको विवाह योजना',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        sortOrder: 1,
        isActive: true,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
