# CMIS Store — API Test Generation Prompt

You are an expert in Next.js API testing. I have a Next.js 15 App Router e-commerce application
(CMIS Store / CMI Battery) at /home/user/Projects/cmis_store.

I need you to write **real integration tests** (no mocks, no fake sessions) that fire actual HTTP
requests against the running dev server at http://localhost:3000 using the native `fetch` API
and Vitest as the test runner.

---

## Tech Stack
- Framework: Next.js 15 (App Router)
- ORM: Prisma (PostgreSQL)
- Auth: NextAuth v5 (session cookies via `next-auth.session-token`)
- Payment: Razorpay
- Test runner: Vitest (`vitest.config.ts` already configured)
- Test files live in: `tests/api/`
- Setup file: `tests/setup.ts` (already created — checks server is running)

---

## Prerequisites (before running)
1. `pnpm dev` must be running on port 3000
2. `.env` must have a valid `DATABASE_URL` pointing to a real (test-safe) DB
3. Run tests with: `pnpm vitest tests/api/<file>.test.ts`

---

## Helper Pattern (already used in auth.test.ts)

```ts
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function get(path: string, cookie = "") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

/** Login and return session cookie string */
async function loginAndGetCookie(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password, redirect: "false", csrfToken: "" }),
    redirect: "manual",
  });
  return res.headers.get("set-cookie") ?? "";
}
```

---

## Auth Routes Already Tested (`tests/api/auth.test.ts`)
- POST /api/auth/register
- POST /api/auth/send-otp
- POST /api/auth/dealer-register
- GET  /api/auth/2fa
- POST /api/auth/2fa

---

## Endpoints Still Needing Tests

### Products (Public — no auth)
```
GET  /api/products              → ?search=&categoryId=&page=1&limit=12&sortBy=sortOrder&sortOrder=asc
GET  /api/products/[slug]       → should return 404 for unknown slug
GET  /api/categories
GET  /api/gallery
```

### Cart (requires CUSTOMER session cookie)
```
GET  /api/cart                  → empty for unauthenticated (returns { items: [] })
POST /api/cart                  → { action: "add",    item: { productId, quantity } }
POST /api/cart                  → { action: "update", productId, quantity }
POST /api/cart                  → { action: "remove", productId }
POST /api/cart                  → { action: "clear" }
POST /api/cart                  → { action: "sync", items: [{ productId, quantity }] }
```

### Orders (requires CUSTOMER session cookie)
```
GET  /api/customer/orders       → ?page=1&limit=10
POST /api/customer/orders       → body: { items: [{ productId, quantity }], newShippingAddress: { name, phone, line1, city, state, pincode } }
GET  /api/customer/orders/[id]  → 404 for random UUID
```

### Payments (requires CUSTOMER session cookie)
```
POST /api/payments/create       → { orderId }     → 404 for unknown order
POST /api/payments/fail         → { orderId }
```

### Admin — Products (requires ADMIN session cookie)
```
GET    /api/admin/products           → ?page=1&limit=20&search=
POST   /api/admin/products           → full product body (see validation schema)
GET    /api/admin/products/[id]      → 404 for unknown ID
PATCH  /api/admin/products/[id]      → { name?, price?, isActive? }
DELETE /api/admin/products/[id]      → 404 for unknown ID
```

### Admin — Orders & Dealers (requires ADMIN session cookie)
```
GET    /api/admin/orders             → returns paginated orders
PATCH  /api/admin/orders             → { orderId, status }
GET    /api/admin/dealers
GET    /api/admin/dealers/[id]
PATCH  /api/admin/dealers            → { dealerId, isApproved }
```

---

## Requirements for Each Test File

1. Use real `fetch` — no mocks, no `vi.mock()`.
2. Use a unique `timestamp = Date.now()` per test run for emails.
3. For protected routes test **three scenarios**:
   - 🔒 No cookie → expect `401`
   - 🔒 Wrong role cookie (e.g. CUSTOMER hitting admin route) → expect `403`
   - ✅ Correct session cookie → expect `200` or `201`
4. For input validation test:
   - ❌ Empty body → `400`
   - ❌ Missing required fields → `400`
   - ❌ Invalid format (bad email, bad phone, etc.) → `400`
   - ✅ Happy path with correct data → `200`/`201` with correct shape
5. Assert response body shape with `expect.objectContaining()`
6. **Never return `password`** in any response — always assert `!body.data.password`
7. Organize files:
   - `tests/api/products.test.ts`
   - `tests/api/cart.test.ts`
   - `tests/api/orders.test.ts`
   - `tests/api/payments.test.ts`
   - `tests/api/admin/products.test.ts`
   - `tests/api/admin/orders.test.ts`
   - `tests/api/admin/dealers.test.ts`

---

## Validation Rules (from Zod schemas)

### Register (`POST /api/auth/register`)
| Field           | Rule |
|-----------------|------|
| name            | min 2 chars |
| email           | valid email |
| phone           | Indian mobile: `/^[6-9]\d{9}$/` |
| password        | min 8, has uppercase, has digit |
| confirmPassword | must match password |

### Dealer Register (`POST /api/auth/dealer-register`)
| Field           | Rule |
|-----------------|------|
| name            | min 2 chars |
| email           | valid email |
| phone           | Indian mobile |
| password        | min 8 chars |
| businessName    | min 2 chars |
| gstNumber       | `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` (optional) |
| panNumber       | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` (optional) |
| businessAddress | min 10 chars |
| city            | min 2 chars |
| state           | min 2 chars |
| pincode         | `/^[1-9][0-9]{5}$/` |

Please generate each test file with all imports, helpers, describe blocks, and test cases.
