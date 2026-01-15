import { Professional, ServiceCategory, Contract, Story } from '../types';

// Tel Aviv Center
const TLV_CENTER = { lat: 32.0853, lng: 34.7818 };

export const STORIES_DATA: Story[] = [
  { id: 's1', title: 'תיקון נזילה', imageUrl: 'https://images.unsplash.com/photo-1581094794329-cd132c3a8e52?auto=format&fit=crop&w=500&q=60', type: 'image', duration: 5, timestamp: Date.now() },
  { id: 's2', title: 'התקנת לוח', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=60', type: 'image', duration: 5, timestamp: Date.now() },
  { id: 's3', title: 'צביעה', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=60', type: 'image', duration: 5, timestamp: Date.now() }
];

export const MOCK_REVIEWS = [
  { id: 'r1', user: 'דניאל כהן', rating: 5, text: 'הגיע בזמן, עשה עבודה מעולה וגבה מחיר הוגן.', date: 'לפני יומיים' },
  { id: 'r2', user: 'מיכל לוי', rating: 4, text: 'מקצועי מאוד, קצת יקר אבל שווה את זה.', date: 'לפני שבוע' },
  { id: 'r3', user: 'יוסי אברהמי', rating: 5, text: 'הציל אותנו ביום שישי בערב! אלוף.', date: 'לפני שבועיים' },
];

export const MOCK_PROS: (Professional & { reviews: any[] })[] = [
  {
    id: 'p1',
    userId: 'u_p1',
    name: 'אבי האינסטלטור',
    avatar: 'https://i.pravatar.cc/150?u=p1',
    coverImage: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.PLUMBING,
    rating: 4.9,
    reviewCount: 128,
    location: { lat: 32.0800, lng: 34.7800, address: 'דיזנגוף 50, תל אביב' },
    hourlyRate: 250,
    isAvailable: true,
    verified: true,
    description: 'מומחה באיתור נזילות ותיקוני חירום. זמין 24/7. משתמש בציוד מתקדם לאיתור נזילות ללא הרס.',
    gallery: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1',
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189'
    ],
    stories: [STORIES_DATA[0]],
    tags: ['חירום', 'נזילות', 'החלפת צנרת'],
    reviews: MOCK_REVIEWS
  },
  {
    id: 'p2',
    userId: 'u_p2',
    name: 'רונית חשמל',
    avatar: 'https://i.pravatar.cc/150?u=p2',
    coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.ELECTRICAL,
    rating: 4.8,
    reviewCount: 95,
    location: { lat: 32.0900, lng: 34.8000, address: 'ביאליק 12, רמת גן' },
    hourlyRate: 300,
    isAvailable: true,
    verified: true,
    description: 'חשמלאית מוסמכת. התקנת בית חכם ותשתיות. ביצוע כל עבודות החשמל לבית ולמשרד.',
    gallery: [],
    stories: [STORIES_DATA[1]],
    tags: ['בית חכם', 'תלת פאזי', 'תאורה'],
    reviews: [MOCK_REVIEWS[0], MOCK_REVIEWS[2]]
  },
  {
    id: 'p3',
    userId: 'u_p3',
    name: 'יוסי שיפוצים',
    avatar: 'https://i.pravatar.cc/150?u=p3',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.RENOVATION,
    rating: 4.5,
    reviewCount: 42,
    location: { lat: 32.0600, lng: 34.7700, address: 'פלורנטין 10, תל אביב' },
    hourlyRate: 200,
    isAvailable: false,
    verified: false,
    description: 'שיפוצים כלליים, צבע וגבס. עבודה עברית. התחייבות לעמידה בלוחות זמנים.',
    gallery: [],
    stories: [STORIES_DATA[2]],
    tags: ['צבע', 'גבס', 'ריצוף'],
    reviews: [MOCK_REVIEWS[1]]
  },
  {
    id: 'p4',
    userId: 'u_p4',
    name: 'דנה ניקיון והברקה',
    avatar: 'https://i.pravatar.cc/150?u=p4',
    coverImage: 'https://images.unsplash.com/photo-1581578731117-1045293d2f3d?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.CLEANING,
    rating: 4.7,
    reviewCount: 210,
    location: { lat: 32.0700, lng: 34.7600, address: 'אלנבי 99, תל אביב' },
    hourlyRate: 80,
    isAvailable: true,
    verified: true,
    description: 'שירותי ניקיון לבתים ומשרדים. פוליש והברקה קריסטלית. צוות אמין ומקצועי.',
    gallery: [],
    stories: [],
    tags: ['ניקיון יסודי', 'פוליש', 'אחרי שיפוץ'],
    reviews: MOCK_REVIEWS
  },
  {
    id: 'p5',
    userId: 'u_p5',
    name: 'איגור המנעולן',
    avatar: 'https://i.pravatar.cc/150?u=p5',
    coverImage: 'https://images.unsplash.com/photo-1558036117-15db63622051?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.LOCKSMITH,
    rating: 5.0,
    reviewCount: 15,
    location: { lat: 32.0850, lng: 34.8100, address: 'כצנלסון 40, גבעתיים' },
    hourlyRate: 350,
    isAvailable: true,
    verified: true,
    description: 'פריצת מנעולים לרכב ולבית. זמין 24/7. הגעה תוך 20 דקות.',
    gallery: [],
    stories: [],
    tags: ['פריצה', 'החלפת צילינדר', 'רכב'],
    reviews: [MOCK_REVIEWS[2]]
  },
  {
    id: 'p6',
    userId: 'u_p6',
    name: 'הובלות המרכז',
    avatar: 'https://i.pravatar.cc/150?u=p6',
    coverImage: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.MOVING,
    rating: 4.2,
    reviewCount: 56,
    location: { lat: 32.0500, lng: 34.7500, address: 'יפו' },
    hourlyRate: 400, // Base price
    isAvailable: true,
    verified: false,
    description: 'הובלות דירות ומשרדים. כולל פירוק והרכבה. ביטוח מלא על התכולה.',
    gallery: [],
    stories: [],
    tags: ['מנוף', 'אריזה', 'ביטוח'],
    reviews: [MOCK_REVIEWS[1]]
  },
  {
    id: 'p7',
    userId: 'u_p7',
    name: 'תומר הנדיימן',
    avatar: 'https://i.pravatar.cc/150?u=p7',
    coverImage: 'https://images.unsplash.com/photo-1540752520653-a7905d41d13f?auto=format&fit=crop&w=800&q=80',
    category: ServiceCategory.RENOVATION,
    rating: 4.6,
    reviewCount: 30,
    location: { lat: 32.1000, lng: 34.8200, address: 'רמת החייל' },
    hourlyRate: 150,
    isAvailable: true,
    verified: true,
    description: 'תיקונים קטנים לבית. תליית טלוויזיות, מדפים, הרכבת רהיטים ועוד.',
    gallery: [],
    stories: [],
    tags: ['הרכבת רהיטים', 'תיקונים', 'תלייה'],
    reviews: MOCK_REVIEWS
  }
];

export const CATEGORIES_DATA = [
  { id: ServiceCategory.PLUMBING, label: 'אינסטלציה', icon: 'wrench', color: 'bg-blue-100 text-blue-600' },
  { id: ServiceCategory.ELECTRICAL, label: 'חשמל', icon: 'zap', color: 'bg-yellow-100 text-yellow-600' },
  { id: ServiceCategory.RENOVATION, label: 'שיפוצים', icon: 'paint-bucket', color: 'bg-orange-100 text-orange-600' },
  { id: ServiceCategory.CLEANING, label: 'ניקיון', icon: 'spray-can', color: 'bg-green-100 text-green-600' },
  { id: ServiceCategory.MOVING, label: 'הובלות', icon: 'truck', color: 'bg-purple-100 text-purple-600' },
  { id: ServiceCategory.LOCKSMITH, label: 'מנעולן', icon: 'key', color: 'bg-red-100 text-red-600' },
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    requestId: 'r1',
    quoteId: 'q1',
    clientName: 'דוד כהן',
    proName: 'אבי האינסטלטור',
    serviceTitle: 'תיקון סיפון מטבח',
    status: 'signed',
    price: 450,
    dateCreated: '2023-10-25',
    terms: '1. בעל המקצוע מתחייב לתקן את הנזילה.\n2. הלקוח מתחייב לשלם 450 ש״ח בסיום.\n3. אחריות: 3 חודשים.',
    clientSignature: 'signed_timestamp_123'
  }
];