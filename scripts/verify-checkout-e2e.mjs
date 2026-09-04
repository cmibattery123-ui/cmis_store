import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const BASE_URL = "https://cmi-batteries.pages.dev";
const AUTH_SECRET = "7vL9mK2xP5qB4wT8zN1sV6jD3fG9hX2kifsdjfkdsj";
const DB_URL = "postgresql://postgres.fjjpyumhkdujcqurxcpy:68JdDzqttNTbTq%2F@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function runE2EVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING AUTOMATED END-TO-END CHECKOUT TEST");
  console.log("=================================================");

  // 1. Setup Database Connection
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 2. Fetch a test user and an active product
    const user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    if (!user) {
      throw new Error("No customer user found in DB");
    }
    console.log(`✅ [1/5] Using Customer User: ${user.name} (${user.email}) - ID: ${user.id}`);

    const product = await prisma.product.findFirst({
      where: { isActive: true },
      include: { inventory: true },
    });
    if (!product) {
      throw new Error("No active product found in DB");
    }
    console.log(`✅ [2/5] Using Product: ${product.name} (SKU: ${product.sku}, Price: ₹${product.price})`);

    // 3. Generate Valid Session Cookies with matching salts
    const secureToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret: AUTH_SECRET,
      salt: "__Secure-authjs.session-token",
      maxAge: 30 * 24 * 60 * 60,
    });

    const plainToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret: AUTH_SECRET,
      salt: "authjs.session-token",
      maxAge: 30 * 24 * 60 * 60,
    });

    const cookieHeader = `__Secure-authjs.session-token=${secureToken}; authjs.session-token=${plainToken}`;

    // 4. Test POST /api/customer/orders (Order Creation)
    console.log("\n📦 [3/5] Testing POST /api/customer/orders (Order Creation)...");
    const orderPayload = {
      items: [{ productId: product.id, quantity: 1 }],
      newShippingAddress: {
        name: user.name || "Test Customer",
        phone: "9876543210",
        line1: "100 Automation Street",
        city: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "641001",
      },
      notes: "Automated E2E Test Order",
    };

    const orderRes = await fetch(`${BASE_URL}/api/customer/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderJson = await orderRes.json();
    console.log(`HTTP Status: ${orderRes.status}`);
    console.log("Order Response:", JSON.stringify(orderJson, null, 2));

    if (!orderRes.ok || !orderJson.data?.id) {
      throw new Error(`Order creation failed: ${JSON.stringify(orderJson)}`);
    }

    const orderId = orderJson.data.id;
    const orderNumber = orderJson.data.orderNumber;
    console.log(`🎉 ORDER CREATED SUCCESSFULLY! Order ID: ${orderId} | Number: ${orderNumber}`);

    // Wait for DB transaction commit across replicas
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Test POST /api/payments/create (Razorpay Order Generation)
    console.log("\n💳 [4/5] Testing POST /api/payments/create (Razorpay Initiation)...");
    const paymentRes = await fetch(`${BASE_URL}/api/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ orderId }),
    });

    const paymentText = await paymentRes.text();
    console.log(`HTTP Status: ${paymentRes.status}`);
    console.log("Payment Response Raw:", paymentText);
    let paymentJson;
    try {
      paymentJson = JSON.parse(paymentText);
    } catch {
      throw new Error(`Payment creation returned non-JSON: ${paymentText.slice(0, 300)}`);
    }

    if (!paymentRes.ok || !paymentJson.data?.providerOrderId) {
      throw new Error(`Payment creation failed: ${JSON.stringify(paymentJson)}`);
    }

    const razorpayOrderId = paymentJson.data.providerOrderId;
    const razorpayKeyId = paymentJson.data.keyId;
    const totalPayable = paymentJson.data.amount;

    console.log(`🎉 RAZORPAY ORDER INITIALIZED SUCCESSFULLY!`);
    console.log(`   - Razorpay Order ID: ${razorpayOrderId}`);
    console.log(`   - Live/Test Key ID: ${razorpayKeyId}`);
    console.log(`   - Total Payable Amount: ₹${totalPayable}`);
    console.log(`   - Customer: ${paymentJson.data.customerName} (${paymentJson.data.customerEmail})`);

    // 6. Verify Database State
    console.log("\n🔍 [5/5] Verifying Payment Record in PostgreSQL Database...");
    const dbPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!dbPayment) {
      throw new Error(`Payment record not found in PostgreSQL for order ${orderId}`);
    }

    console.log(`✅ Payment record verified in DB:`);
    console.log(`   - ID: ${dbPayment.id}`);
    console.log(`   - Status: ${dbPayment.status}`);
    console.log(`   - Provider: ${dbPayment.provider}`);
    console.log(`   - Provider Order ID: ${dbPayment.providerOrderId}`);
    console.log(`   - Amount: ₹${dbPayment.amount}`);

    console.log("\n=================================================");
    console.log("✅ ALL AUTOMATED E2E TESTS PASSED WITH 100% SUCCESS!");
    console.log("=================================================\n");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runE2EVerification().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
