# CMI Battery Management Platform

Enterprise-grade battery manufacturing business platform for **Chinna Mayil Industries** — makers of **Perfect Batteries**.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
npm install --save-dev tsx   # Required for the seed script
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up the database
```bash
# Push schema to Supabase
npm run db:push

# OR run migrations (for production)
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### 4. Seed the database
```bash
npm run db:seed
```

This creates:
- ✅ 4 product categories
- ✅ Admin user: 
- ✅ Dealer user:
- ✅ Customer user: 
- ✅ 5 demo products with specs & inventory

### 5. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (public)         # Home, Products, About, Contact, Warranty
│   ├── admin/           # Admin dashboard & management
│   ├── dealer/          # Dealer portal
│   ├── customer/        # Customer account
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout & success
│   └── api/             # API routes
├── components/
│   ├── admin/           # Admin-specific components
│   ├── dealer/          # Dealer-specific components
│   ├── shared/          # Navbar, Footer
│   └── sections/        # Landing page sections
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma singleton
│   ├── constants.ts     # App constants
│   ├── utils/           # Utility functions
│   └── validations/     # Zod schemas
├── services/
│   └── payments/        # Payment abstraction layer
├── store/
│   └── cart.tsx         # Cart context/reducer
├── actions/             # Server actions
└── types/               # TypeScript augmentations
```

---

## 👤 Roles & Access

| Role | Access |
|------|--------|
| **ADMIN** | Full admin panel — products, orders, dealers, quotations, inventory |
| **DEALER** | Dealer portal — catalog (dealer pricing), quotations, orders |
| **CUSTOMER** | Customer dashboard — orders, profile, addresses |

---

## 💳 Payment Architecture

The platform uses a **provider abstraction layer** at `src/services/payments/`:

- **Development/Staging**: Mock provider (auto-approves payments)
- **Production**: Razorpay provider (set `RAZORPAY_KEY_ID` + `RAZORPAY_SECRET`)

Switching providers is automatic — no code changes required.

---

## 🗃️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run type-check` | TypeScript type checking |

---

## 🌐 Deployment (Vercel)

1. Connect your GitHub repo to Vercel
2. Add all environment variables from `.env.example`
3. Set **Build Command**: `prisma generate && next build`
4. Deploy!

> Make sure `NEXTAUTH_URL` is set to your production domain.

---

## 📋 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Auth.js (NextAuth v5)
- **Payments**: Razorpay (with Mock fallback)
- **Storage**: Cloudinary
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Validation**: Zod + React Hook Form
- **Deployment**: Vercel
