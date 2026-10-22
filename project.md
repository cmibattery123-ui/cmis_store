# Chinna Mayil Industries (CMIS Store) — Project Master Documentation & Handoff Guide

> **Current Production Deployment**: [http://cmibattery-prod-env.ap-south-1.elasticbeanstalk.com](http://cmibattery-prod-env.ap-south-1.elasticbeanstalk.com)  
> **AWS Environment**: `cmibattery-prod-env` (Region: `ap-south-1` Mumbai)  
> **GitHub Repository**: `cmibattery123-ui/cmis_store` (Branch: `main`)  
> **Documentation Date**: October 2026

---

## 1. Project Overview & Architecture

**Chinna Mayil Industries Store (CMIS Store)** is a production-grade e-commerce and B2B ordering platform for industrial, automotive, and solar lithium battery systems manufactured in Coimbatore, Tamil Nadu.

### Tech Stack
- **Framework**: Next.js 15 (App Router, Server & Client Components, dynamic routes)
- **Runtime**: Node.js 20 LTS in Docker multi-stage container
- **Database**: SQLite via Prisma ORM (`/app/data/cmis.db` mapped to host volume on AWS EC2)
- **Authentication**: NextAuth.js v5 (JWT sessions, credentials & Google OAuth)
- **State Management**: Zustand (Cart & client persistence)
- **Styling**: Tailwind CSS (with complete light and dark theme modes)
- **Payment & Channels**:
  - Razorpay Payment Gateway (UPI, Cards, NetBanking)
  - Direct WhatsApp Order Desk (Automated fallback when gateway is disabled)
  - Direct Call Sales Hotline (Synchronized to WhatsApp contact)
- **CI/CD & Hosting**:
  - GitHub Actions (`.github/workflows/deploy.yml`)
  - Amazon Elastic Container Registry (ECR)
  - AWS Elastic Beanstalk (Docker platform on Linux EC2)
  - AWS Systems Manager (SSM) Session Manager for server terminal access

---

## 2. Infrastructure & Access Reference

| Resource | Value / Path |
|---|---|
| **Live App URL** | `http://cmibattery-prod-env.ap-south-1.elasticbeanstalk.com` |
| **AWS Region** | `ap-south-1` (Mumbai) |
| **EB Environment** | `cmibattery-prod-env` |
| **EC2 Instance ID** | `i-064cc0b298f53a8ef` |
| **Container DB Path** | `/app/data/cmis.db` |
| **Host Persistent DB**| `/var/app/current/data/cmis.db` |
| **Server Shell Access**| Run `pnpm run connect:server` (uses AWS SSM Session Manager) |
| **Deployment Trigger**| `git push origin main` (automatically builds Docker image, tags ECR, and updates Elastic Beanstalk) |

---

## 3. Everything Completed ("Done")

The following major features, bug fixes, and operational improvements have been implemented, tested, and deployed to production:

### A. Product Catalog & Dynamic Database Ingestion
1. **Dynamic Database Products**:
   - Replaced static/hardcoded data fallbacks with live SQLite database queries (`db.product.findMany({ where: { isActive: true } })`).
   - Made `/products` catalog and `/products/[slug]` detail pages dynamic (`export const dynamic = "force-dynamic"`, `revalidate = 0`).
   - Newly created, edited, or published products from the Admin Panel (`/admin/products`) appear instantly on the storefront.
2. **Custom GST Tax Percentage Input**:
   - Replaced the fixed dropdown select (previously limited to standard 18%, 28%) with a free-form numerical percentage input (e.g. `0%`, `5%`, `12%`, `18%`, `28%`).
   - Storefront cart calculations, checkout summaries, and invoices calculate dynamic GST based on this exact percentage.
3. **Admin Product Form Contrast & Autocomplete**:
   - Fixed light theme text contrast across all product form inputs.
   - Disabled browser autocomplete popups (`autoComplete="off"`) that were corrupting product title, SKU, and price fields.

### B. Media & Gallery Storage Fallback
1. **Zero-Key Fragmented Storage**:
   - When Archive.org S3 keys are not present in `.env`, the system automatically falls back to local database chunked storage (`MediaFile` and `MediaChunk` models, storing fragments <25MB) and local filesystem storage.
   - Uploading gallery images and event albums works 100% without external S3 credentials.
2. **Published Status Indicator**:
   - Fixed admin gallery table to properly inspect the `isPublished` Boolean property instead of undefined status fields, ensuring published items display green "Published" badges.

### C. Complete Removal of YouTube API Integration
1. **Admin Settings Cleanup**:
   - Removed the "YouTube API" tab from `/admin/settings`.
   - Removed YouTube video embed modals, inputs, and state from `GalleryEventForm.tsx`.
   - Gallery media now exclusively focuses on direct image/video uploads.

### D. Payment Channels & WhatsApp Ordering Fallback
1. **Automatic WhatsApp Ordering Switchover**:
   - When the Razorpay payment gateway is toggled off (`razorpayEnabled === false`), product detail pages (`/products/[slug]`) and checkout (`/checkout`) cleanly display a professional "Contact via WhatsApp — Inquire & Order" card.
   - Pre-composes structured customer messages with product name, SKU, price, and inquiry details using token substitution (`{product_name}`, `{sku}`, `{price}`).
   - Checkout forwards complete cart contents (items, quantities, totals, delivery address, B2B notes) directly to WhatsApp.
2. **Public Unauthenticated Status Endpoint**:
   - Built `/api/payments/status` returning `{ razorpayEnabled, whatsappEnabled, whatsappPhone, whatsappPhoneDisplay, whatsappMessage }`.
   - Verified publicly accessible with `no-store` cache headers so customers always receive live gateway status without leaking secret API keys.
3. **Fixed Admin Payment & WhatsApp Settings Persistence**:
   - Resolved a critical nested `<form>` DOM bug in `src/app/admin/settings/page.tsx` where clicking save fired the outer profile form rather than the WhatsApp/payment form.
   - Added instant auto-save toggle for the WhatsApp switch with live "Active" / "Disabled" badge.
   - Configured buttons with explicit `type="button"` and `onClick` handlers to guarantee persistence to `/api/admin/settings/payment`.
   - Added `normalizeWhatsAppPhone` to automatically prefix `91` to 10-digit Indian numbers and format numbers cleanly.

### E. Unified Direct Call & WhatsApp Contact Numbers
1. **Synchronized Call Office Button**:
   - Configured the "Call Office" button and "Call Sales Helpline" links on product detail pages and checkout to automatically dial the exact phone number configured in WhatsApp settings (`tel:+${cleanPhone}`).
   - Updated phone display (`+91 XXXXX XXXXX`) for clean visual readability.

---

## 4. Everything Remaining ("Left to Do")

The following tasks represent unfinished features, architectural enhancements, or recommended improvements for the next developer:

| Priority | Feature / Task | Area | Description |
|---|---|---|---|
| **High** | **General Store Settings Persistence** | `/admin/settings` (General Tab) | Currently, Store Name, Support Email, Business Address, Currency, and Store Tax/GST Number display static default values in the form. They need to be backed by `db.systemSetting` (`STORE_NAME`, `STORE_EMAIL`, etc.) and saved via a `/api/admin/settings/general` route. |
| **High** | **Admin Password Change** | `/admin/settings` (Security Tab) | Password change fields exist in the UI but lack an API handler. Build a `PATCH /api/admin/profile/password` endpoint verifying old password with bcrypt and saving the new hashed password. |
| **Medium** | **Admin Notification Toggles** | `/admin/settings` (Notifications Tab) | Email notification toggles (New Order Placed, Dealer Application, Quotation Request, Low Stock Alert) currently use default state. Persist these keys to `SystemSetting` and hook into AWS SES or Nodemailer. |
| **Medium** | **WhatsApp Order Status Management** | `/admin/orders` | Orders created via WhatsApp checkout have `status: "PENDING"` and `paymentStatus: "PENDING"`. Add quick-action badges in the admin table: "Confirmed via WhatsApp", "Bank Transfer Received", "Dispatched". |
| **Medium** | **Automated GST Invoice PDF Generation** | `/api/customer/orders/[id]/invoice` | Generate downloadable PDF invoices (using `@react-pdf/renderer` or `puppeteer-core`) containing company GST, HSN codes, and customer tax info for completed orders. |
| **Low** | **Cloudflare or CloudFront CDN for Media** | Media Storage | While local and database storage works, migrating product media to an S3 bucket with CloudFront distribution will improve image load times across distant regions. |
| **Low** | **Stock Inventory Webhooks** | `/api/inventory` | Decrement reserved inventory automatically upon order confirmation or cancel expired pending reservations after 48 hours. |

---

## 5. Key File Index

### Storefront & Client Pages
- [`src/app/products/page.tsx`](file:///home/user/Projects/cmis_store/src/app/products/page.tsx): Main product catalog page; queries active database products.
- [`src/app/products/[slug]/page.tsx`](file:///home/user/Projects/cmis_store/src/app/products/[slug]/page.tsx): Product detail server component; fetches live product data and payment configuration.
- [`src/components/products/ProductDetailClient.tsx`](file:///home/user/Projects/cmis_store/src/components/products/ProductDetailClient.tsx): Interactive product view; handles image gallery, stock display, WhatsApp fallback card, and synchronized Call Office button.
- [`src/app/checkout/page.tsx`](file:///home/user/Projects/cmis_store/src/app/checkout/page.tsx): Checkout flow supporting online Razorpay checkout and Direct WhatsApp Order Desk submission.

### Admin Dashboard
- [`src/app/admin/settings/page.tsx`](file:///home/user/Projects/cmis_store/src/app/admin/settings/page.tsx): Admin settings hub; renders Profile, Payments, General, Security, and Notifications tabs without nested form collisions.
- [`src/components/admin/PaymentSettings.tsx`](file:///home/user/Projects/cmis_store/src/components/admin/PaymentSettings.tsx): Payment gateway management; contains Razorpay credentials form and WhatsApp ordering configuration with live test link.
- [`src/components/admin/ProductForm.tsx`](file:///home/user/Projects/cmis_store/src/components/admin/ProductForm.tsx): Product creation/editing form with dynamic GST percentage input and contrast improvements.
- [`src/components/admin/GalleryEventForm.tsx`](file:///home/user/Projects/cmis_store/src/components/admin/GalleryEventForm.tsx): Event and photo gallery management (YouTube dependency removed).

### API Routes & Backend Services
- [`src/app/api/payments/status/route.ts`](file:///home/user/Projects/cmis_store/src/app/api/payments/status/route.ts): Public unauthenticated endpoint returning gateway status and normalized phone details.
- [`src/app/api/admin/settings/payment/route.ts`](file:///home/user/Projects/cmis_store/src/app/api/admin/settings/payment/route.ts): Administrative payment & WhatsApp settings GET and POST upsert route.
- [`src/app/api/customer/orders/route.ts`](file:///home/user/Projects/cmis_store/src/app/api/customer/orders/route.ts): Order creation endpoint for both online checkout and WhatsApp orders.
- [`src/lib/whatsapp.ts`](file:///home/user/Projects/cmis_store/src/lib/whatsapp.ts): WhatsApp order URL builder, cart URL builder, phone normalization (`normalizeWhatsAppPhone`), and telephone URL builder (`buildTelUrl`).
- [`src/lib/utils/api.ts`](file:///home/user/Projects/cmis_store/src/lib/utils/api.ts): Standardized `apiSuccess` and `apiError` response wrappers with boolean `success` flag.

### Database Schema
- [`prisma/schema.prisma`](file:///home/user/Projects/cmis_store/prisma/schema.prisma): Database definitions including `Product`, `Order`, `SystemSetting`, `User`, `Inventory`, `MediaFile`, and `MediaChunk`.

---

## 6. Developer & Deployment Cheatsheet

### Local Development
```bash
# 1. Install dependencies
pnpm install

# 2. Run database migrations / push schema
pnpm prisma db push

# 3. Start local development server
pnpm dev

# 4. Run TypeScript type check
pnpm run type-check

# 5. Build production bundle locally
pnpm run build
```

### Deploying to Production
Deployments are fully automated via GitHub Actions:
```bash
# Simply commit your changes and push to main
git add -A
git commit -m "feat/fix: your descriptive commit message"
git push origin main
```
The workflow will:
1. Check out code and configure AWS credentials.
2. Authenticate to Amazon ECR.
3. Build the Docker container image.
4. Push image to Amazon ECR repository.
5. Create an Elastic Beanstalk deployment package (`Dockerrun.aws.json`).
6. Deploy the updated application to environment `cmibattery-prod-env`.

### Connecting Directly to Production Server
If you ever need to inspect logs or the database directly on EC2:
```bash
# Uses AWS Systems Manager (SSM) Session Manager without requiring open SSH ports:
pnpm run connect:server
```
Once connected on EC2:
```bash
# View running docker containers
docker ps

# Inspect application container logs
docker logs -f $(docker ps -q)

# SQLite database location on host
ls -la /var/app/current/data/cmis.db
```
