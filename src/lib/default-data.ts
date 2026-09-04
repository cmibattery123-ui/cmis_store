export interface DefaultProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDesc: string;
  description: string;
  price: number;
  dealerPrice: number;
  taxRate: number;
  warrantyMonths: number;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  isActive: boolean;
  isFeatured: boolean;
  inventory?: { quantity: number; lowStockThreshold: number };
  images: { id?: string; url: string; altText?: string; isPrimary: boolean; sortOrder: number }[];
  specs: { id?: string; label: string; value: string; unit: string | null; sortOrder: number }[];
  datasheetUrl?: string | null;
}

export interface DefaultCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DefaultGalleryMedia {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface DefaultGalleryEvent {
  id: string;
  name: string;
  category: string;
  eventDate: string | Date;
  location: string;
  description: string;
  isFeatured: boolean;
  media: DefaultGalleryMedia[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    id: "cmt8mio950003lssb9uo6l60x",
    name: "Lithium Batteries",
    slug: "lithium-batteries",
    description: "High-performance non-maintenance lithium iron phosphate batteries",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cmt8mio940002lssbz597xb1n",
    name: "Inverter Batteries",
    slug: "inverter-batteries",
    description: "Long-life heavy-duty inverter batteries for residential and commercial backup",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "cmt8mio5o0000lssbk5aahrc4",
    name: "Vehicle Batteries",
    slug: "vehicle-batteries",
    description: "High cranking power automotive batteries for two-wheelers and four-wheelers",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "cmt8mio920001lssbgmz33sbn",
    name: "UPS Batteries",
    slug: "ups-batteries",
    description: "Sealed maintenance-free AGM VRLA batteries for UPS and emergency systems",
    isActive: true,
    sortOrder: 4,
  },
];

export const LEGACY_PRODUCT_ID_MAP: Record<string, { id: string; sku: string; slug: string }> = {
  "prod-1": { id: "cmt8mj0830008lssbgatfhq7f", sku: "PB-LIFE-100", slug: "perfect-life-100ah" },
  "prod-2": { id: "cmt8mj3v6000ilssbi6y1wstg", sku: "PB-LIFE-200", slug: "perfect-life-200ah" },
  "prod-3": { id: "cmt8mjbw7000rlssbdo4vejjk", sku: "PB-INV-150", slug: "perfect-power-150ah-inverter" },
  "prod-4": { id: "cmt8mjj640010lssbio22ag7h", sku: "PB-TW-2.5", slug: "perfect-auto-2-5ah-twowheeler" },
  "prod-5": { id: "cmt8mjlqn0017lssb9s3n5cqo", sku: "PB-UPS-7", slug: "perfect-guard-7ah-ups" },
};

export function normalizeProductId(rawId: string): string {
  if (!rawId) return rawId;
  return LEGACY_PRODUCT_ID_MAP[rawId]?.id || rawId;
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    id: "cmt8mj0830008lssbgatfhq7f",
    name: "Perfect LiFe 100Ah Lithium Iron Battery",
    slug: "perfect-life-100ah",
    sku: "PB-LIFE-100",
    shortDesc: "100Ah LiFePO4 battery — ideal for solar setups and residential inverters",
    description:
      "Industry-leading Lithium Iron Phosphate (LiFePO4) battery offering superior cycle life (2000+ cycles), zero maintenance, ultra-lightweight design, and consistent power delivery. Engineered with integrated BMS protection against overcharging, over-discharging, and thermal extremes. Manufactured by Chinna Mayil Industries in Coimbatore.",
    price: 32500,
    dealerPrice: 28000,
    taxRate: 18,
    warrantyMonths: 24,
    categoryId: "cmt8mio950003lssb9uo6l60x",
    category: { id: "cmt8mio950003lssb9uo6l60x", name: "Lithium Batteries", slug: "lithium-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 45, lowStockThreshold: 10 },
    images: [
      {
        url: "/assets/batt1-removebg-preview.png",
        altText: "Perfect LiFe 100Ah Lithium Iron Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/hero_battery_visual_1778229195217.png",
        altText: "Hero battery technology visual",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Nominal Capacity", value: "100", unit: "Ah", sortOrder: 1 },
      { label: "Nominal Voltage", value: "12.8", unit: "V", sortOrder: 2 },
      { label: "Battery Chemistry", value: "LiFePO4", unit: null, sortOrder: 3 },
      { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 4 },
      { label: "Net Weight", value: "13.0", unit: "kg", sortOrder: 5 },
      { label: "Dimensions (L×W×H)", value: "326×175×220", unit: "mm", sortOrder: 6 },
      { label: "Max Discharge Current", value: "100", unit: "A", sortOrder: 7 },
    ],
  },
  {
    id: "cmt8mj3v6000ilssbi6y1wstg",
    name: "Perfect LiFe 200Ah Lithium Iron Battery",
    slug: "perfect-life-200ah",
    sku: "PB-LIFE-200",
    shortDesc: "200Ah heavy-duty LiFePO4 for commercial solar, telecom, and industrial power",
    description:
      "High-capacity 200Ah Lithium Iron Phosphate battery designed for heavy-duty commercial solar installations, data centers, and critical uninterruptible power applications. Features military-grade prismatic cells, intelligent smart BMS with passive cell balancing, and robust thermal dissipation.",
    price: 62000,
    dealerPrice: 54000,
    taxRate: 18,
    warrantyMonths: 24,
    categoryId: "cmt8mio950003lssb9uo6l60x",
    category: { id: "cmt8mio950003lssb9uo6l60x", name: "Lithium Batteries", slug: "lithium-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 28, lowStockThreshold: 5 },
    images: [
      {
        url: "/assets/batt1-removebg-preview.png",
        altText: "Perfect LiFe 200Ah Lithium Iron Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/product_lineup_1778229235672.png",
        altText: "Product Lineup",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Nominal Capacity", value: "200", unit: "Ah", sortOrder: 1 },
      { label: "Nominal Voltage", value: "12.8", unit: "V", sortOrder: 2 },
      { label: "Battery Chemistry", value: "LiFePO4", unit: null, sortOrder: 3 },
      { label: "Cycle Life", value: "2500+", unit: "cycles", sortOrder: 4 },
      { label: "Net Weight", value: "24.0", unit: "kg", sortOrder: 5 },
      { label: "Dimensions (L×W×H)", value: "520×240×220", unit: "mm", sortOrder: 6 },
    ],
  },
  {
    id: "cmt8mjbw7000rlssbdo4vejjk",
    name: "Perfect Power 150Ah Tall Tubular Inverter Battery",
    slug: "perfect-power-150ah-inverter",
    sku: "PB-INV-150",
    shortDesc: "Tall tubular inverter battery for 8-10 hours extended home and office backup",
    description:
      "Heavy-duty tall tubular battery engineered specifically to handle frequent and prolonged power outages. Built with spine casting alloy technology for ultra-low corrosion and high active material retention.",
    price: 14500,
    dealerPrice: 12500,
    taxRate: 12,
    warrantyMonths: 24,
    categoryId: "cmt8mio940002lssbz597xb1n",
    category: { id: "cmt8mio940002lssbz597xb1n", name: "Inverter Batteries", slug: "inverter-batteries" },
    isActive: true,
    isFeatured: false,
    inventory: { quantity: 60, lowStockThreshold: 15 },
    images: [
      {
        url: "/assets/inverter.png",
        altText: "Perfect Power 150Ah Inverter Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/batt2-removebg-preview.png",
        altText: "Side view",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "150", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Battery Type", value: "Tall Tubular", unit: null, sortOrder: 3 },
      { label: "Backup Time", value: "8–10", unit: "hrs", sortOrder: 4 },
      { label: "Filled Weight", value: "52", unit: "kg", sortOrder: 5 },
    ],
  },
  {
    id: "cmt8mjj640010lssbio22ag7h",
    name: "Perfect Auto 2.5Ah Two-Wheeler Battery",
    slug: "perfect-auto-2-5ah-twowheeler",
    sku: "PB-TW-2.5",
    shortDesc: "VRLA sealed maintenance-free battery for motorcycles and scooters",
    description:
      "High cranking power, vibration resistant, and completely sealed maintenance-free design. Compatible with all major motorcycle brands including Hero, Honda, Bajaj, and TVS.",
    price: 1200,
    dealerPrice: 900,
    taxRate: 18,
    warrantyMonths: 12,
    categoryId: "cmt8mio5o0000lssbk5aahrc4",
    category: { id: "cmt8mio5o0000lssbk5aahrc4", name: "Vehicle Batteries", slug: "vehicle-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 150, lowStockThreshold: 25 },
    images: [
      {
        url: "/assets/batt2-removebg-preview.png",
        altText: "Perfect Auto 2.5Ah Two-Wheeler Battery",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    specs: [
      { label: "Capacity", value: "2.5", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Type", value: "VRLA Sealed", unit: null, sortOrder: 3 },
      { label: "Weight", value: "0.92", unit: "kg", sortOrder: 4 },
    ],
  },
  {
    id: "cmt8mjlqn0017lssb9s3n5cqo",
    name: "Perfect Guard 7Ah UPS Battery",
    slug: "perfect-guard-7ah-ups",
    sku: "PB-UPS-7",
    shortDesc: "Sealed AGM battery providing reliable backup for UPS systems and alarm panels",
    description:
      "Reliable sealed maintenance-free battery providing steady power backup for computer UPS systems, medical equipment, security alarms, and electronic testing gear.",
    price: 1850,
    dealerPrice: 1500,
    taxRate: 18,
    warrantyMonths: 18,
    categoryId: "cmt8mio920001lssbgmz33sbn",
    category: { id: "cmt8mio920001lssbgmz33sbn", name: "UPS Batteries", slug: "ups-batteries" },
    isActive: true,
    isFeatured: false,
    inventory: { quantity: 80, lowStockThreshold: 20 },
    images: [
      {
        url: "/assets/batt2-removebg-preview.png",
        altText: "Perfect Guard 7Ah UPS Battery",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    specs: [
      { label: "Capacity", value: "7.0", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Type", value: "AGM VRLA", unit: null, sortOrder: 3 },
      { label: "Dimensions", value: "151×65×97", unit: "mm", sortOrder: 4 },
      { label: "Weight", value: "2.1", unit: "kg", sortOrder: 5 },
    ],
  },
];

export const DEFAULT_GALLERY_EVENTS: DefaultGalleryEvent[] = [
  {
    id: "gal-1",
    name: "Advanced Lithium Battery Assembly Line & Cleanroom",
    category: "Manufacturing",
    eventDate: "2026-03-15",
    location: "Plant 1, Chinna Mayil Industries, Coimbatore",
    description:
      "Tour inside our precision cleanroom and automated cylindrical and prismatic lithium cell assembly line. Featuring robotic spot welding, automated cell grading, and real-time internal resistance (IR) monitoring for defect-free battery pack production.",
    isFeatured: true,
    media: [
      {
        id: "m-1",
        mediaType: "IMAGE",
        url: "/assets/factory_showcase_1778229216901.png",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-2",
        mediaType: "IMAGE",
        url: "/assets/gallery/s1.png",
        isCover: false,
        sortOrder: 1,
      },
    ],
  },
  {
    id: "gal-2",
    name: "Next-Gen LiFePO4 Cell Testing & Quality Inspection",
    category: "R&D & Quality",
    eventDate: "2026-04-10",
    location: "Advanced Testing Lab, Coimbatore",
    description:
      "Comprehensive multi-stage quality assurance: automated cycle-life simulation, thermal shock chambers, high-current load testing, and vibration stress analysis to ensure all Perfect Batteries exceed international safety and longevity benchmarks.",
    isFeatured: true,
    media: [
      {
        id: "m-3",
        mediaType: "IMAGE",
        url: "/assets/hero_battery_visual_1778229195217.png",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-4",
        mediaType: "IMAGE",
        url: "/assets/gallery/s2.png",
        isCover: false,
        sortOrder: 1,
      },
    ],
  },
  {
    id: "gal-3",
    name: "Annual South India Authorized Dealer Meet & Conference",
    category: "Exhibitions",
    eventDate: "2026-02-20",
    location: "Codissia Trade Fair Complex, Coimbatore",
    description:
      "Over 250+ authorized battery dealers and distribution partners gathered to celebrate 42 years of Chinna Mayil Industries leadership and unveil our new commercial solar lithium battery ecosystem.",
    isFeatured: true,
    media: [
      {
        id: "m-5",
        mediaType: "IMAGE",
        url: "/assets/slides/dealers.jpg",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-6",
        mediaType: "IMAGE",
        url: "/assets/slides/dealers (2).jpg",
        isCover: false,
        sortOrder: 1,
      },
      {
        id: "m-7",
        mediaType: "IMAGE",
        url: "/assets/slides/dealers (3).jpeg",
        isCover: false,
        sortOrder: 2,
      },
      {
        id: "m-8",
        mediaType: "IMAGE",
        url: "/assets/slides/dealers (4).png",
        isCover: false,
        sortOrder: 3,
      },
    ],
  },
  {
    id: "gal-4",
    name: "High-Capacity Inverter & Industrial Power Showcase",
    category: "Products",
    eventDate: "2026-01-18",
    location: "CMI Technology Demonstration Centre",
    description:
      "Demonstration of the heavy-duty Perfect Power tall-tubular inverter lineup and high-capacity modular storage units delivering continuous backup for hospitals, data centers, and heavy textile machinery in Tamil Nadu.",
    isFeatured: true,
    media: [
      {
        id: "m-9",
        mediaType: "IMAGE",
        url: "/assets/product_lineup_1778229235672.png",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-10",
        mediaType: "IMAGE",
        url: "/assets/slides/products.jpg",
        isCover: false,
        sortOrder: 1,
      },
      {
        id: "m-11",
        mediaType: "IMAGE",
        url: "/assets/slides/products (2).jpg",
        isCover: false,
        sortOrder: 2,
      },
    ],
  },
  {
    id: "gal-5",
    name: "Clean Energy & EV Battery Solutions Exhibition",
    category: "Exhibitions",
    eventDate: "2025-11-28",
    location: "Chennai Trade Centre, Tamil Nadu",
    description:
      "Presenting zero-maintenance non-spillable battery technology engineered for two-wheeler electric vehicles, solar street lighting, and telecom tower microgrids.",
    isFeatured: true,
    media: [
      {
        id: "m-12",
        mediaType: "IMAGE",
        url: "/assets/gallery/s3.png",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-13",
        mediaType: "IMAGE",
        url: "/assets/slides/services.jpg",
        isCover: false,
        sortOrder: 1,
      },
    ],
  },
  {
    id: "gal-6",
    name: "42+ Years of Manufacturing Leadership & Founder Legacy",
    category: "Heritage",
    eventDate: "2025-08-15",
    location: "Headquarters, Chinna Mayil Industries",
    description:
      "Honoring the enduring legacy of our founder Shri. C. Thangaraj and the leadership of Mr. Mohan. Building on four decades of battery engineering mastery to pioneer the next generation of energy storage.",
    isFeatured: true,
    media: [
      {
        id: "m-14",
        mediaType: "IMAGE",
        url: "/assets/Members/Shri. C. THANGARAJ.jpeg",
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "m-15",
        mediaType: "IMAGE",
        url: "/assets/Members/mr.mohan.jpeg",
        isCover: false,
        sortOrder: 1,
      },
    ],
  },
];
