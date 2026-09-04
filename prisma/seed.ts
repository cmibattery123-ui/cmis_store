import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🧹 Erasing all existing transactional and user data…");

  // ─────────────────────────────────────────────────────
  // 0. Wipe All User and Transactional Information
  // ─────────────────────────────────────────────────────
  try {
    await db.cartItem.deleteMany();
    await db.cart.deleteMany();
    await db.quotationItem.deleteMany();
    await db.quotation.deleteMany();
    await db.orderItem.deleteMany();
    await db.payment.deleteMany();
    await db.order.deleteMany();
    await db.notification.deleteMany();
    await db.address.deleteMany();
    await db.account.deleteMany();
    await db.session.deleteMany();
    await db.verificationToken.deleteMany();
    await db.dealer.deleteMany();
    await db.user.deleteMany();
    console.log("✅ All user information, orders, carts, and dealer records erased cleanly.");
  } catch (err) {
    console.error("⚠️ Note during data cleanup:", err);
  }

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
  // 2. Default Admin User
  // ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await db.user.create({
    data: {
      name: "System Administrator",
      email: "admin@cmibattery.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Admin created: admin@cmibattery.com (Password: admin123, PIN: 123456)`);

  // ─────────────────────────────────────────────────────
  // 3. Default Dealer User
  // ─────────────────────────────────────────────────────
  const dealerPassword = await bcrypt.hash("dealer123", 12);
  const dealerUser = await db.user.create({
    data: {
      name: "Dealer Partner",
      email: "dealer@cmibattery.com",
      password: dealerPassword,
      role: "DEALER",
      phone: "9944001122",
      isActive: true,
    },
  });

  await db.dealer.create({
    data: {
      userId: dealerUser.id,
      businessName: "Perfect Battery Dealer Centre",
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
  console.log(`✅ Dealer created: dealer@cmibattery.com (Password: dealer123)`);

  // ─────────────────────────────────────────────────────
  // 4. Default Standard Customer User
  // ─────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash("user123", 12);
  const customer = await db.user.create({
    data: {
      name: "Customer User",
      email: "user@cmibattery.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "9876543210",
      isActive: true,
    },
  });
  console.log(`✅ Customer created: user@cmibattery.com (Password: user123)`);

  // ─────────────────────────────────────────────────────
  // 5. Products & Inventory
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
      images: [
        {
          url: "/assets/batt1-removebg-preview.png",
          publicId: "cmi_batt1",
          altText: "Perfect LiFe 100Ah Lithium Iron Battery",
          isPrimary: true,
          sortOrder: 0,
        },
        {
          url: "/assets/hero_battery_visual_1778229195217.png",
          publicId: "cmi_batt1_hero",
          altText: "Perfect LiFe 100Ah Hero Visual",
          isPrimary: false,
          sortOrder: 1,
        },
      ],
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
      images: [
        {
          url: "/assets/batt1-removebg-preview.png",
          publicId: "cmi_batt1_200",
          altText: "Perfect LiFe 200Ah Lithium Iron Battery",
          isPrimary: true,
          sortOrder: 0,
        },
        {
          url: "/assets/product_lineup_1778229235672.png",
          publicId: "cmi_batt1_lineup",
          altText: "Perfect LiFe 200Ah Lineup",
          isPrimary: false,
          sortOrder: 1,
        },
      ],
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
      images: [
        {
          url: "/assets/inverter.png",
          publicId: "cmi_inverter_150",
          altText: "Perfect Power 150Ah Inverter Battery",
          isPrimary: true,
          sortOrder: 0,
        },
        {
          url: "/assets/batt2-removebg-preview.png",
          publicId: "cmi_inv_batt",
          altText: "Inverter Battery Side View",
          isPrimary: false,
          sortOrder: 1,
        },
      ],
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
      images: [
        {
          url: "/assets/batt2-removebg-preview.png",
          publicId: "cmi_batt2_tw",
          altText: "Perfect Auto 2.5Ah Two-Wheeler Battery",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
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
      images: [
        {
          url: "/assets/batt2-removebg-preview.png",
          publicId: "cmi_batt2_ups",
          altText: "Perfect Guard 7Ah UPS Battery",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
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
    const { specs, images, ...productData } = prod;

    const existing = await db.product.findUnique({ where: { sku: productData.sku } });
    let productId: string;

    if (!existing) {
      const created = await db.product.create({
        data: {
          ...productData,
          specs: {
            create: specs.map((s) => ({ ...s })),
          },
          images: {
            create: images.map((img) => ({ ...img })),
          },
        },
      });
      productId = created.id;
      console.log(`✅ Created product: ${productData.name}`);
    } else {
      productId = existing.id;
      await db.product.update({
        where: { id: existing.id },
        data: {
          ...productData,
        },
      });

      await db.productImage.deleteMany({ where: { productId: existing.id } });
      await db.productImage.createMany({
        data: images.map((img) => ({ ...img, productId: existing.id })),
      });
    }

    // Initialize inventory
    await db.inventory.upsert({
      where: { productId },
      update: {},
      create: {
        productId,
        quantity: Math.floor(Math.random() * 200) + 20,
        reservedQuantity: 0,
        lowStockThreshold: 10,
      },
    });
  }

  // ─────────────────────────────────────────────────────
  // 6. Battery Warranties
  // ─────────────────────────────────────────────────────
  const warranties = [
    {
      serialNumber: "CMI-1212-001",
      model: "CMIP 12-12",
      capacity: "12Ah",
      warrantyExpiry: new Date("2028-07-10"),
      status: "Active",
      customerName: "Ravi Kumar",
    },
    {
      serialNumber: "CMI-1209-002",
      model: "CMIP 12-09",
      capacity: "9Ah",
      warrantyExpiry: new Date("2024-05-15"),
      status: "Expired",
      customerName: "Priya Sharma",
    },
    {
      serialNumber: "CMI-1206-003",
      model: "CMIP 12-06",
      capacity: "6Ah",
      warrantyExpiry: new Date("2027-12-31"),
      status: "Active",
      customerName: "Arun Prakash",
    },
  ];

  for (const w of warranties) {
    await db.batteryWarranty.upsert({
      where: { serialNumber: w.serialNumber },
      update: {},
      create: w,
    });
  }
  console.log(`✅ Created battery warranties`);

  // ─────────────────────────────────────────────────────
  // 7. Technical Specifications
  // ─────────────────────────────────────────────────────
  const technicalSpecs = [
    { model: "CMIP 12-2.5", volts: "12V", capacity: "2.5Ah", length: "8.0", breadth: "7.0", height: "10.5", weight: "0.48", sortOrder: 1 },
    { model: "CMIP 12-5 (Z4 / Z5)", volts: "12V", capacity: "5Ah", length: "11.3", breadth: "7.0", height: "10.5", weight: "0.85", sortOrder: 2 },
    { model: "CMIP 12-7 (6LB / 7LB)", volts: "12V", capacity: "7Ah", length: "15.0", breadth: "6.5", height: "9.3", weight: "0.95", sortOrder: 3 },
    { model: "CMIP 12-9 (9LB)", volts: "12V", capacity: "9Ah", length: "13.5", breadth: "7.5", height: "13.9", weight: "1.15", sortOrder: 4 },
    { model: "CMIP 12-12", volts: "12V", capacity: "12Ah", length: "15.1", breadth: "9.8", height: "9.5", weight: "1.40", sortOrder: 5 },
    { model: "CMIP LiFe 100Ah", volts: "12V", capacity: "100Ah", length: "32.6", breadth: "17.5", height: "22.0", weight: "13.0", sortOrder: 6 },
    { model: "CMIP LiFe 200Ah", volts: "12V", capacity: "200Ah", length: "52.0", breadth: "24.0", height: "22.0", weight: "24.0", sortOrder: 7 },
    { model: "CMIP SMART INVERTER", volts: "12V/24V", capacity: "150Ah", length: "50.5", breadth: "19.0", height: "41.0", weight: "52.0", sortOrder: 8 },
  ];

  await db.technicalSpec.deleteMany();
  await db.technicalSpec.createMany({
    data: technicalSpecs,
  });
  console.log(`✅ Created ${technicalSpecs.length} technical specifications`);

  console.log("\n🎉 Database cleanup and seeding complete!\n");
  console.log("==================================================");
  console.log("📋 DEFAULT LOGIN CREDENTIALS:");
  console.log("--------------------------------------------------");
  console.log("  👤 ADMIN ACCOUNT:");
  console.log("     Username / Email: admin@cmibattery.com");
  console.log("     Password:         admin123");
  console.log("     Security PIN:     123456");
  console.log("--------------------------------------------------");
  console.log("  🏬 DEALER ACCOUNT:");
  console.log("     Username / Email: dealer@cmibattery.com");
  console.log("     Password:         dealer123");
  console.log("--------------------------------------------------");
  console.log("  🛒 USER (CUSTOMER) ACCOUNT:");
  console.log("     Username / Email: user@cmibattery.com");
  console.log("     Password:         user123");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
