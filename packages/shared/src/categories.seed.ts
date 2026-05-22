export type CategorySeed = {
  slug: string;
  nameEn: string;
  nameNe: string;
  icon: string;
  sortOrder: number;
  subcategories: { slug: string; nameEn: string; nameNe: string; sortOrder: number }[];
};

export const CATEGORY_SEED: CategorySeed[] = [
  {
    slug: 'ritual-wedding',
    nameEn: 'Ritual / Wedding',
    nameNe: 'संस्कार / विवाह',
    icon: 'heart',
    sortOrder: 1,
    subcategories: [
      { slug: 'wedding', nameEn: 'Wedding', nameNe: 'विवाह', sortOrder: 1 },
      { slug: 'engagement', nameEn: 'Engagement', nameNe: 'सगाई', sortOrder: 2 },
      { slug: 'mehendi', nameEn: 'Mehendi', nameNe: 'मेहन्दी', sortOrder: 3 },
      { slug: 'reception', nameEn: 'Reception', nameNe: 'रिसेप्शन', sortOrder: 4 },
      { slug: 'bratabandha', nameEn: 'Bratabandha', nameNe: 'ब्रतबन्ध', sortOrder: 5 },
    ],
  },
  {
    slug: 'business',
    nameEn: 'Business',
    nameNe: 'व्यापार',
    icon: 'briefcase',
    sortOrder: 2,
    subcategories: [
      { slug: 'conference', nameEn: 'Conference', nameNe: 'सम्मेलन', sortOrder: 1 },
      { slug: 'seminar', nameEn: 'Seminar', nameNe: 'सेमिनार', sortOrder: 2 },
      { slug: 'workshop', nameEn: 'Workshop', nameNe: 'कार्यशाला', sortOrder: 3 },
      { slug: 'product-launch', nameEn: 'Product Launch', nameNe: 'उत्पादन लॉन्च', sortOrder: 4 },
    ],
  },
  {
    slug: 'educational',
    nameEn: 'Educational',
    nameNe: 'शैक्षिक',
    icon: 'book',
    sortOrder: 3,
    subcategories: [
      { slug: 'school-event', nameEn: 'School Event', nameNe: 'विद्यालय कार्यक्रम', sortOrder: 1 },
      { slug: 'training', nameEn: 'Training', nameNe: 'प्रशिक्षण', sortOrder: 2 },
      { slug: 'graduation', nameEn: 'Graduation', nameNe: 'दीक्षान्त', sortOrder: 3 },
      { slug: 'cultural-program', nameEn: 'Cultural Program', nameNe: 'सांस्कृतिक कार्यक्रम', sortOrder: 4 },
    ],
  },
  {
    slug: 'sports',
    nameEn: 'Sports & Recreation',
    nameNe: 'खेलकुद',
    icon: 'trophy',
    sortOrder: 4,
    subcategories: [
      { slug: 'tournament', nameEn: 'Tournament', nameNe: 'प्रतियोगिता', sortOrder: 1 },
      { slug: 'marathon', nameEn: 'Marathon', nameNe: 'म्याराथन', sortOrder: 2 },
      { slug: 'sports-day', nameEn: 'Sports Day', nameNe: 'खेलकुद दिवस', sortOrder: 3 },
      { slug: 'trekking', nameEn: 'Trekking Event', nameNe: 'ट्रेकिङ', sortOrder: 4 },
    ],
  },
  {
    slug: 'arts-entertainment',
    nameEn: 'Arts & Entertainment',
    nameNe: 'कला र मनोरञ्जन',
    icon: 'music',
    sortOrder: 5,
    subcategories: [
      { slug: 'concert', nameEn: 'Concert', nameNe: 'संगीत कार्यक्रम', sortOrder: 1 },
      { slug: 'theatre', nameEn: 'Theatre', nameNe: 'नाटक', sortOrder: 2 },
      { slug: 'film-screening', nameEn: 'Film Screening', nameNe: 'चलचित्र', sortOrder: 3 },
      { slug: 'cultural-show', nameEn: 'Cultural Show', nameNe: 'सांस्कृतिक प्रस्तुति', sortOrder: 4 },
      { slug: 'comedy-show', nameEn: 'Comedy Show', nameNe: 'हास्य', sortOrder: 5 },
    ],
  },
  {
    slug: 'religious-festival',
    nameEn: 'Religious & Festival',
    nameNe: 'धार्मिक र पर्व',
    icon: 'temple',
    sortOrder: 6,
    subcategories: [
      { slug: 'dashain', nameEn: 'Dashain', nameNe: 'दशैं', sortOrder: 1 },
      { slug: 'tihar', nameEn: 'Tihar', nameNe: 'तिहार', sortOrder: 2 },
      { slug: 'teej', nameEn: 'Teej', nameNe: 'तीज', sortOrder: 3 },
      { slug: 'chhath', nameEn: 'Chhath', nameNe: 'छठ', sortOrder: 4 },
      { slug: 'holi', nameEn: 'Holi', nameNe: 'होली', sortOrder: 5 },
      { slug: 'buddha-jayanti', nameEn: 'Buddha Jayanti', nameNe: 'बुद्ध जयन्ती', sortOrder: 6 },
      { slug: 'indra-jatra', nameEn: 'Indra Jatra', nameNe: 'इन्द्र जात्रा', sortOrder: 7 },
      { slug: 'ropain', nameEn: 'Ropain Festival', nameNe: 'रोपाइँ', sortOrder: 8 },
    ],
  },
  {
    slug: 'social',
    nameEn: 'Social',
    nameNe: 'सामाजिक',
    icon: 'users',
    sortOrder: 7,
    subcategories: [
      { slug: 'birthday', nameEn: 'Birthday', nameNe: 'जन्मदिन', sortOrder: 1 },
      { slug: 'anniversary', nameEn: 'Anniversary', nameNe: 'वार्षिकोत्सव', sortOrder: 2 },
      { slug: 'reunion', nameEn: 'Reunion', nameNe: 'पुनर्मिलन', sortOrder: 3 },
      { slug: 'family-gathering', nameEn: 'Family Gathering', nameNe: 'पारिवारिक भेला', sortOrder: 4 },
    ],
  },
];
