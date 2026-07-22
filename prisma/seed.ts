import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database…");

  // ─────────────────────────────────────────────────────
  // 1. Categories
  // ─────────────────────────────────────────────────────
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "lithium-batteries" },
      update: {},
      create: {
        name: "Lithium Batteries",
        slug: "lithium-batteries",
        description: "High-performance non-maintenance lithium batteries",
        isActive: true,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "inverter-batteries" },
      update: {},
      create: {
        name: "Inverter Batteries",
        slug: "inverter-batteries",
        description: "Long-life inverter batteries for home and office",
        isActive: true,
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: "vehicle-batteries" },
      update: {},
      create: {
        name: "Vehicle Batteries",
        slug: "vehicle-batteries",
        description: "Automotive batteries for two-wheelers and four-wheelers",
        isActive: true,
        sortOrder: 3,
      },
    }),
    db.category.upsert({
      where: { slug: "ups-batteries" },
      update: {},
      create: {
        name: "UPS Batteries",
        slug: "ups-batteries",
        description: "Sealed maintenance-free batteries for UPS systems",
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ─────────────────────────────────────────────────────
  // 2. Admin user
  // ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@CMI2024", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@cmibattery.com" },
    update: {},
    create: {
      name: "CMI Admin",
      email: "admin@cmibattery.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─────────────────────────────────────────────────────
  // 3. Demo customer
  // ─────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash("Customer@123", 12);
  const customer = await db.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Ravi Kumar",
      email: "customer@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "9876543210",
      isActive: true,
    },
  });
  console.log(`✅ Customer user: ${customer.email}`);

  // ─────────────────────────────────────────────────────
  // 4. Demo dealer
  // ─────────────────────────────────────────────────────
  const dealerPassword = await bcrypt.hash("Dealer@123", 12);
  const dealerUser = await db.user.upsert({
    where: { email: "dealer@abcbatteries.com" },
    update: {},
    create: {
      name: "Suresh Murugan",
      email: "dealer@abcbatteries.com",
      password: dealerPassword,
      role: "DEALER",
      phone: "9944001122",
      isActive: true,
    },
  });

  await db.dealer.upsert({
    where: { userId: dealerUser.id },
    update: {},
    create: {
      userId: dealerUser.id,
      businessName: "ABC Battery Centre",
      businessAddress: "No. 14, Trichy Road, Singanallur",
      gstNumber: "33AABCU9999Q1ZA",
      phone: "0422-2345678",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641005",
      status: "APPROVED",
      creditLimit: 500000,
      discountPercent: 5,
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  });
  console.log(`✅ Dealer user: ${dealerUser.email}`);

  // ─────────────────────────────────────────────────────
  // 5. Products
  // ─────────────────────────────────────────────────────
  const [lithiumCat, inverterCat, vehicleCat, upsCat] = categories;

  const products = [
    {
      name: "Perfect LiFe 100Ah Lithium Iron Battery",
      sku: "PB-LIFE-100",
      slug: "perfect-life-100ah",
      shortDesc: "100Ah LiFePO4 battery — ideal for solar and inverter setups",
      description: "Industry-leading lithium iron phosphate battery offering superior cycle life, zero maintenance, and consistent power output. Perfect for residential solar systems, inverters, and telecom applications.",
      price: 32500,
      dealerPrice: 28000,
      taxRate: 18,
      warrantyMonths: 24,
      categoryId: lithiumCat.id,
      isActive: true,
      isFeatured: true,
      specs: [
        { label: "Capacity", value: "100", unit: "Ah", sortOrder: 1 },
        { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
        { label: "Chemistry", value: "LiFePO4", unit: "", sortOrder: 3 },
        { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 4 },
        { label: "Weight", value: "13", unit: "kg", sortOrder: 5 },
        { label: "Dimensions", value: "326×175×220", unit: "mm", sortOrder: 6 },
      ],
    },
    {
      name: "Perfect LiFe 200Ah Lithium Iron Battery",
      sku: "PB-LIFE-200",
      slug: "perfect-life-200ah",
      shortDesc: "200Ah LiFePO4 for heavy-duty solar and commercial use",
      description: "High-capacity 200Ah lithium iron phosphate battery designed for commercial solar systems, data centers, and critical power applications.",
      price: 62000,
      dealerPrice: 54000,
      taxRate: 18,
      warrantyMonths: 24,
      categoryId: lithiumCat.id,
      isActive: true,
      isFeatured: true,
      specs: [
        { label: "Capacity", value: "200", unit: "Ah", sortOrder: 1 },
        { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
        { label: "Chemistry", value: "LiFePO4", unit: "", sortOrder: 3 },
        { label: "Cycle Life", value: "2000+", unit: "cycles", sortOrder: 4 },
        { label: "Weight", value: "24", unit: "kg", sortOrder: 5 },
      ],
    },
    {
      name: "Perfect Power 150Ah Inverter Battery",
      sku: "PB-INV-150",
      slug: "perfect-power-150ah-inverter",
      shortDesc: "Tall tubular inverter battery for long backup hours",
      description: "Heavy-duty tall tubular battery engineered for maximum backup in power-intensive environments. Ideal for home inverters up to 2KVA.",
      price: 14500,
      dealerPrice: 12500,
      taxRate: 12,
      warrantyMonths: 24,
      categoryId: inverterCat.id,
      isActive: true,
      isFeatured: false,
      specs: [
        { label: "Capacity", value: "150", unit: "Ah", sortOrder: 1 },
        { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
        { label: "Type", value: "Tall Tubular", unit: "", sortOrder: 3 },
        { label: "Backup", value: "8-10", unit: "hrs", sortOrder: 4 },
        { label: "Weight", value: "52", unit: "kg", sortOrder: 5 },
      ],
    },
    {
      name: "Perfect Auto 2.5Ah Two-Wheeler Battery",
      sku: "PB-TW-2.5",
      slug: "perfect-auto-2-5ah-twowheeler",
      shortDesc: "Sealed maintenance-free battery for motorcycles and scooters",
      description: "High cranking power, vibration resistant, and completely maintenance-free. Compatible with all major two-wheeler brands.",
      price: 1200,
      dealerPrice: 900,
      taxRate: 18,
      warrantyMonths: 12,
      categoryId: vehicleCat.id,
      isActive: true,
      isFeatured: true,
      specs: [
        { label: "Capacity", value: "2.5", unit: "Ah", sortOrder: 1 },
        { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
        { label: "Type", value: "VRLA Sealed", unit: "", sortOrder: 3 },
        { label: "Weight", value: "0.92", unit: "kg", sortOrder: 4 },
      ],
    },
    {
      name: "Perfect Guard 7Ah UPS Battery",
      sku: "PB-UPS-7",
      slug: "perfect-guard-7ah-ups",
      shortDesc: "Sealed lead-acid battery for home and office UPS systems",
      description: "Reliable sealed maintenance-free battery providing consistent power backup for UPS systems. Available in 6V and 12V configurations.",
      price: 1850,
      dealerPrice: 1500,
      taxRate: 18,
      warrantyMonths: 18,
      categoryId: upsCat.id,
      isActive: true,
      isFeatured: false,
      specs: [
        { label: "Capacity", value: "7", unit: "Ah", sortOrder: 1 },
        { label: "Voltage", value: "12", unit: "V", sortOrder: 2 },
        { label: "Type", value: "AGM VRLA", unit: "", sortOrder: 3 },
        { label: "Dimensions", value: "151×65×97", unit: "mm", sortOrder: 4 },
        { label: "Weight", value: "2.1", unit: "kg", sortOrder: 5 },
      ],
    },
  ];

  for (const prod of products) {
    const { specs, ...productData } = prod;

    const existing = await db.product.findUnique({ where: { sku: productData.sku } });
    if (existing) {
      console.log(`⏭️  Skipping existing product: ${productData.sku}`);
      continue;
    }

    const created = await db.product.create({
      data: {
        ...productData,
        specs: {
          create: specs.map((s) => ({ ...s })),
        },
      },
    });

    // Initialize inventory
    await db.inventory.upsert({
      where: { productId: created.id },
      update: {},
      create: {
        productId: created.id,
        quantity: Math.floor(Math.random() * 200) + 20,
        reservedQuantity: 0,
        lowStockThreshold: 10,
      },
    });

    console.log(`✅ Created product: ${productData.name}`);
  }

  // ─────────────────────────────────────────────────────
  // 6. Battery warranties
  // ─────────────────────────────────────────────────────
  const warranties = [
    {
      serialNumber: "CMI-1212-001",
      model: "CMIP 12-12",
      capacity: "12Ah",
      warrantyExpiry: new Date("2028-07-10"),
      status: "Active",
      customerName: "John Doe",
    },
    {
      serialNumber: "CMI-1209-002",
      model: "CMIP 12-09",
      capacity: "9Ah",
      warrantyExpiry: new Date("2024-05-15"),
      status: "Expired",
      customerName: "Jane Smith",
    },
    {
      serialNumber: "CMI-1206-003",
      model: "CMIP 12-06",
      capacity: "6Ah",
      warrantyExpiry: new Date("2027-12-31"),
      status: "Active",
      customerName: "Robert Johnson",
    },
  ];

  for (const w of warranties) {
    await db.batteryWarranty.upsert({
      where: { serialNumber: w.serialNumber },
      update: {},
      create: w,
    });
    console.log(`✅ Created battery warranty: ${w.serialNumber}`);
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("📋 Test credentials:");
  console.log("  Admin:    admin@cmibattery.com / Admin@CMI2024");
  console.log("  Dealer:   dealer@abcbatteries.com / Dealer@123");
  console.log("  Customer: customer@example.com / Customer@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
