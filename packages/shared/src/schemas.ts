import { z } from 'zod';
import { ExpenseCategory, NotificationChannel, PaymentStatus, RsvpStatus, VendorCategoryType } from './enums';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const deviceRegisterSchema = z.object({
  deviceId: z.string().min(8).max(64),
  fcmToken: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});

export const reviewCreateSchema = z.object({
  vendorId: z.string().uuid(),
  deviceId: z.string().min(8).max(64),
  rating: z.number().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
  authorName: z.string().max(80).optional(),
});

export const presignSchema = z.object({
  folder: z.enum(['events', 'vendors', 'banners', 'featured']),
  fileName: z.string().min(1).max(200),
  contentType: z.string().regex(/^(image|video)\//),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
});

export const categoryCreateSchema = z.object({
  slug: z.string().min(2).max(60),
  nameEn: z.string().min(1).max(120),
  nameNe: z.string().min(1).max(120),
  icon: z.string().max(40).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const subcategoryCreateSchema = z.object({
  categoryId: z.string().uuid(),
  slug: z.string().min(2).max(60),
  nameEn: z.string().min(1).max(120),
  nameNe: z.string().min(1).max(120),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const vendorCreateSchema = z.object({
  name: z.string().min(1).max(200),
  nameNe: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  category: z.nativeEnum(VendorCategoryType),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).default(0),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const festivalCreateSchema = z.object({
  slug: z.string().min(2).max(80),
  nameEn: z.string().min(1).max(200),
  nameNe: z.string().min(1).max(200),
  descriptionEn: z.string().max(5000).optional(),
  descriptionNe: z.string().max(5000).optional(),
  gregorianDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  bikramDate: z.string().max(30).optional(),
  tithiLabel: z.string().max(100).optional(),
  muhurtaNote: z.string().max(500).optional(),
  isNational: z.boolean().default(true),
});

export const bannerCreateSchema = z.object({
  title: z.string().min(1).max(200),
  titleNe: z.string().max(200).optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const notificationBroadcastSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  channel: z.nativeEnum(NotificationChannel).default(NotificationChannel.PUSH),
  scheduledAt: z.string().datetime().optional(),
});

// Local event schemas (mobile MMKV)
export const localEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  subcategorySlug: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
  bikramDate: z.string().optional(),
  venue: z.string().max(500).optional(),
  venueLat: z.number().optional(),
  venueLng: z.number().optional(),
  budget: z.number().nonnegative().optional(),
  estimatedGuests: z.number().int().nonnegative().optional(),
  coverImageUri: z.string().optional(),
  reminderMinutes: z.array(z.number()).optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const localGuestSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(1).max(120),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  rsvpStatus: z.nativeEnum(RsvpStatus).default(RsvpStatus.PENDING),
  seatNumber: z.string().max(20).optional(),
  category: z.string().max(60).optional(),
  notes: z.string().max(1000).optional(),
});

export const localExpenseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.nativeEnum(ExpenseCategory),
  vendorName: z.string().max(200).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  dueDate: z.string().optional(),
});

export const localTaskSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  title: z.string().min(1).max(300),
  isCompleted: z.boolean().default(false),
  dueDate: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type LocalEvent = z.infer<typeof localEventSchema>;
export type LocalGuest = z.infer<typeof localGuestSchema>;
export type LocalExpense = z.infer<typeof localExpenseSchema>;
export type LocalTask = z.infer<typeof localTaskSchema>;
