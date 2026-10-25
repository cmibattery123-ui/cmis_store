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
    id: "cmr922oiw0000oou110ljcmkz",
    name: "Lithium Batteries",
    slug: "lithium-batteries",
    description: "High-performance non-maintenance lithium batteries",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cmr922oj20002oou1ej57ewtn",
    name: "Vehicle Batteries",
    slug: "vehicle-batteries",
    description: "Automotive batteries for two-wheelers and four-wheelers",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "cmr922ot00003oou1shd3fjcx",
    name: "Inverter Batteries",
    slug: "inverter-batteries",
    description: "Long-life inverter batteries for home and office",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "cmr922oiy0001oou1w0m9so0k",
    name: "UPS Batteries",
    slug: "ups-batteries",
    description: "Sealed maintenance-free batteries for UPS systems",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "cmr8ycr56000004kyihagzaix",
    name: "Lithium Battery",
    slug: "lithium-battery",
    description: "Compact two-wheeler lithium starting batteries",
    isActive: true,
    sortOrder: 5,
  },
];

export const LEGACY_PRODUCT_ID_MAP: Record<string, { id: string; sku: string; slug: string }> = {
  "prod-1": { id: "cmr922qci0008oou1aeynp75i", sku: "PB-LIFE-100", slug: "perfect-life-100ah-lithium-iron-battery" },
  "prod-2": { id: "cmr922qne000goou1njyko9yz", sku: "PB-LIFE-200", slug: "perfect-life-200ah-lithium-iron-battery" },
  "prod-3": { id: "cmr922qxz000noou1y5a6bpp0", sku: "PB-INV-150", slug: "perfect-power-150ah-inverter-battery" },
  "prod-4": { id: "cmrbmnbnc0000lwu1btc9szkh", sku: "CMIP12-5", slug: "12v-z5-5ah-5lb-perfect-lithium-batteries" },
  "prod-5": { id: "cmr922rj60010oou1tu7nu00v", sku: "PB-UPS-7", slug: "perfect-guard-7ah-ups-battery" },
  "prod-6": { id: "cmr8ye69y000104kyxnqixyq8", sku: "CMIP 12 - 04", slug: "12v-z4-4ah-4lb-perfect-lithium-batteries" },
  "prod-7": { id: "cmrfwpggm00052wu1pw07vsdh", sku: "REDON LIPRO2000", slug: "redon-lipro-12v-2000-va-perfect-lithium-batteries" },
};

export function normalizeProductId(rawId: string): string {
  if (!rawId) return rawId;
  return LEGACY_PRODUCT_ID_MAP[rawId]?.id || rawId;
}

export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    id: "cmr8ye69y000104kyxnqixyq8",
    name: "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries",
    slug: "12v-z4-4ah-4lb-perfect-lithium-batteries",
    sku: "CMIP 12 - 04",
    shortDesc: "Versatile 4LB capacity battery balanced for performance with a 0.726 Kg weight and 11x7x9 cm size.",
    description:
      "Versatile 4LB capacity battery balanced for performance with a 0.726 Kg weight and 11x7x9 cm size. Engineered with advanced lithium technology for ultra-fast charging, lightweight build, and extended service life. Manufactured by Chinna Mayil Industries in Coimbatore.",
    price: 1200,
    dealerPrice: 1000,
    taxRate: 18,
    warrantyMonths: 25,
    categoryId: "cmr8ycr56000004kyihagzaix",
    category: { id: "cmr8ycr56000004kyihagzaix", name: "Lithium Battery", slug: "lithium-battery" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 100, lowStockThreshold: 10 },
    images: [
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783664919/cmi-batteries/products/s8in176wrhlywpevq83x.jpg",
        altText: "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783664953/cmi-batteries/products/x4un5i2rcdb1rgodaliu.jpg",
        altText: "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries Side View",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "4", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Weight", value: "0.726", unit: "kg", sortOrder: 3 },
      { label: "Dimensions", value: "11×7×9", unit: "cm", sortOrder: 4 },
      { label: "Chemistry", value: "LiFePO4", unit: null, sortOrder: 5 },
      { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 6 },
    ],
  },
  {
    id: "cmrbmnbnc0000lwu1btc9szkh",
    name: "12V -  Z5 / 5Ah / 5LB Perfect Lithium Batteries",
    slug: "12v-z5-5ah-5lb-perfect-lithium-batteries",
    sku: "CMIP12-5",
    shortDesc: "Sealed maintenance-free battery for motorcycles and scooters",
    description:
      "High cranking power, vibration resistant, and completely maintenance-free. Compatible with all major two-wheeler brands. Engineered with high-rate lithium cells for dependable starting in all weather conditions.",
    price: 1200,
    dealerPrice: 900,
    taxRate: 18,
    warrantyMonths: 12,
    categoryId: "cmr922oj20002oou1ej57ewtn",
    category: { id: "cmr922oj20002oou1ej57ewtn", name: "Vehicle Batteries", slug: "vehicle-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 104, lowStockThreshold: 10 },
    images: [
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783664977/cmi-batteries/products/kxsipcbzis17wm11lqwi.jpg",
        altText: "12V -  Z5 / 5Ah / 5LB Perfect Lithium Batteries",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/batt1-removebg-preview.png",
        altText: "12V -  Z5 Lithium Battery Visual",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "5", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Type", value: "VRLA Sealed", unit: null, sortOrder: 3 },
      { label: "Weight", value: "0.92", unit: "kg", sortOrder: 4 },
    ],
  },
  {
    id: "cmr922qci0008oou1aeynp75i",
    name: "Perfect LiFe 100Ah Lithium Iron Battery",
    slug: "perfect-life-100ah-lithium-iron-battery",
    sku: "PB-LIFE-100",
    shortDesc: "100Ah LiFePO4 battery — ideal for solar and inverter setups",
    description:
      "Industry-leading lithium iron phosphate battery offering superior cycle life, zero maintenance, and consistent power output. Perfect for residential solar systems, inverters, and telecom applications.",
    price: 32500,
    dealerPrice: 28000,
    taxRate: 18,
    warrantyMonths: 24,
    categoryId: "cmr922oiw0000oou110ljcmkz",
    category: { id: "cmr922oiw0000oou110ljcmkz", name: "Lithium Batteries", slug: "lithium-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 46, lowStockThreshold: 10 },
    images: [
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783665133/cmi-batteries/products/xuh4sy0lisyos7n8vwje.jpg",
        altText: "Perfect LiFe 100Ah Lithium Iron Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/hero_battery_visual_1778229195217.png",
        altText: "Perfect LiFe 100Ah Hero Visual",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "100", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Chemistry", value: "LiFePO4", unit: null, sortOrder: 3 },
      { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 4 },
      { label: "Weight", value: "13", unit: "kg", sortOrder: 5 },
      { label: "Dimensions", value: "326×175×220", unit: "mm", sortOrder: 6 },
    ],
  },
  {
    id: "cmr922qxz000noou1y5a6bpp0",
    name: "Perfect Power 150Ah Inverter Battery",
    slug: "perfect-power-150ah-inverter-battery",
    sku: "PB-INV-150",
    shortDesc: "Tall tubular inverter battery for long backup hours",
    description:
      "Heavy-duty tall tubular battery engineered for maximum backup in power-intensive environments. Ideal for home inverters up to 2KVA.",
    price: 14500,
    dealerPrice: 12500,
    taxRate: 12,
    warrantyMonths: 24,
    categoryId: "cmr922ot00003oou1shd3fjcx",
    category: { id: "cmr922ot00003oou1shd3fjcx", name: "Inverter Batteries", slug: "inverter-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 89, lowStockThreshold: 10 },
    images: [
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783665152/cmi-batteries/products/j3wzlcieuacnlfg3ttph.jpg",
        altText: "Perfect Power 150Ah Inverter Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/inverter.png",
        altText: "Perfect Power 150Ah Inverter Battery Side View",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "150", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Type", value: "Tall Tubular", unit: null, sortOrder: 3 },
      { label: "Backup", value: "8-10", unit: "hrs", sortOrder: 4 },
      { label: "Weight", value: "52", unit: "kg", sortOrder: 5 },
    ],
  },
  {
    id: "cmr922qne000goou1njyko9yz",
    name: "Perfect LiFe 200Ah Lithium Iron Battery",
    slug: "perfect-life-200ah-lithium-iron-battery",
    sku: "PB-LIFE-200",
    shortDesc: "200Ah LiFePO4 for heavy-duty solar and commercial use",
    description:
      "High-capacity 200Ah lithium iron phosphate battery designed for commercial solar systems, data centers, and critical power applications.",
    price: 62000,
    dealerPrice: 54000,
    taxRate: 18,
    warrantyMonths: 24,
    categoryId: "cmr922oiw0000oou110ljcmkz",
    category: { id: "cmr922oiw0000oou110ljcmkz", name: "Lithium Batteries", slug: "lithium-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 172, lowStockThreshold: 10 },
    images: [
      {
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783665190/cmi-batteries/products/gjyjcwabiv639ynfnef8.jpg",
        altText: "Perfect LiFe 200Ah Lithium Iron Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/product_lineup_1778229235672.png",
        altText: "Perfect LiFe 200Ah Lineup",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "200", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Chemistry", value: "LiFePO4", unit: null, sortOrder: 3 },
      { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 4 },
      { label: "Weight", value: "24", unit: "kg", sortOrder: 5 },
    ],
  },
  {
    id: "cmr922rj60010oou1tu7nu00v",
    name: "Perfect Guard 7Ah UPS Battery",
    slug: "perfect-guard-7ah-ups-battery",
    sku: "PB-UPS-7",
    shortDesc: "Sealed lead-acid battery for home and office UPS systems",
    description:
      "Reliable sealed maintenance-free battery providing consistent power backup for UPS systems. Available in 6V and 12V configurations.",
    price: 1850,
    dealerPrice: 1500,
    taxRate: 18,
    warrantyMonths: 18,
    categoryId: "cmr922oiy0001oou1w0m9so0k",
    category: { id: "cmr922oiy0001oou1w0m9so0k", name: "UPS Batteries", slug: "ups-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 172, lowStockThreshold: 10 },
    images: [
      {
        url: "/assets/batt2-removebg-preview.png",
        altText: "Perfect Guard 7Ah UPS Battery",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/batt2.jpeg",
        altText: "Perfect Guard UPS Battery Angle",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Capacity", value: "7", unit: "Ah", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Type", value: "AGM VRLA", unit: null, sortOrder: 3 },
      { label: "Dimensions", value: "151×65×97", unit: "mm", sortOrder: 4 },
      { label: "Weight", value: "2.1", unit: "kg", sortOrder: 5 },
    ],
  },
  {
    id: "cmrfwpggm00052wu1pw07vsdh",
    name: "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries",
    slug: "redon-lipro-12v-2000-va-perfect-lithium-batteries",
    sku: "REDON LIPRO2000",
    shortDesc: "12V 2000VA High-Efficiency Lithium Power System",
    description:
      "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries with integrated smart BMS, ultra-high efficiency inverter support, and rapid charging.",
    price: 110000,
    dealerPrice: 100000,
    taxRate: 18,
    warrantyMonths: 12,
    categoryId: "cmr922oiw0000oou110ljcmkz",
    category: { id: "cmr922oiw0000oou110ljcmkz", name: "Lithium Batteries", slug: "lithium-batteries" },
    isActive: true,
    isFeatured: true,
    inventory: { quantity: 100, lowStockThreshold: 10 },
    images: [
      {
        url: "/assets/batt1-removebg-preview.png",
        altText: "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "/assets/product_lineup_1778229235672.png",
        altText: "REDON LIPRO Lithium Power System",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    specs: [
      { label: "Power Rating", value: "2000", unit: "VA", sortOrder: 1 },
      { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
      { label: "Chemistry", value: "LiFePO4", unit: null, sortOrder: 3 },
      { label: "Type", value: "Smart Lithium System", unit: null, sortOrder: 4 },
    ],
  },
];

export const DEFAULT_GALLERY_EVENTS: DefaultGalleryEvent[] = [
  {
    id: "cmrc14e0r0000owu1t487dljy",
    name: "Shop Opening",
    category: "Events",
    eventDate: "2026-07-07T00:00:00.000Z",
    location: "Coimbatore",
    description: "Welcome for the event",
    isFeatured: true,
    media: [
      {
        id: "cmrn74xke0000nku1ktkppfz9",
        mediaType: "IMAGE",
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783512193/cmi-batteries/gallery/ytig1m88jlqtw3xvywsq.jpg",
        thumbnailUrl: null,
        isCover: true,
        sortOrder: 0,
      },
      {
        id: "cmrn74xke0001nku1loq2f286",
        mediaType: "IMAGE",
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1783512199/cmi-batteries/gallery/otcodq0qj4mov5qfhtbu.jpg",
        thumbnailUrl: null,
        isCover: false,
        sortOrder: 1,
      },
      {
        id: "cmrn74xkf0002nku1jo8l1nop",
        mediaType: "IMAGE",
        url: "https://res.cloudinary.com/delk61fp0/image/upload/v1784187438/cmi-batteries/gallery/ropvu0kwmghtvemdeplt.jpg",
        thumbnailUrl: null,
        isCover: false,
        sortOrder: 2,
      },
    ],
  },
];
