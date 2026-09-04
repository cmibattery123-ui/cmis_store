# Project: CMI Battery / Perfect Batteries Production Readiness

## Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + Turbopack + Tailwind CSS + shadcn/ui
- **Database / ORM**: Supabase PostgreSQL + Prisma ORM (with Hyperdrive support in Worker runtime)
- **Authentication**: Auth.js v5 (NextAuth) with JWT strategy and custom role-based access control (`ADMIN`, `DEALER`, `CUSTOMER`)
- **Payments**: Razorpay gateway integration with pluggable `MockPaymentProvider`
- **Media**: Cloudinary media upload and byte-range streaming proxy
- **Target Deployment**: Cloudflare Pages (Frontend static/RSC + edge proxy `_worker.js`) + Cloudflare Workers (Backend API runtime `src/worker/index.ts` with Hyperdrive)

## Code Layout
```
cmis_store/
├── src/
│   ├── actions/                  # Server Actions (Admin products, Dealer, Orders, Auth)
│   ├── app/                      # Next.js App Router (Storefront, Auth, Customer, Dealer, Admin, API)
│   │   ├── (storefront routes)   # /, /products, /cart, /checkout, /about, /contact, /warranty
│   │   ├── admin/                # Admin control panel routes & error/loading boundaries
│   │   ├── api/                  # 47 REST API route handlers
│   │   ├── auth/                 # Login, Register, Dealer-register, Error
│   │   ├── customer/             # Customer account portal & error/loading boundaries
│   │   └── dealer/               # Dealer B2B portal & error/loading boundaries
│   ├── components/               # UI components (shared, admin, forms, layout)
│   ├── lib/                      # Core utilities (db, auth, validations, api helpers, utils)
│   ├── services/                 # Business logic (payments, notifications)
│   ├── store/                    # Client state stores (Cart, UI)
│   ├── types/                    # TypeScript type declarations & DTOs
│   └── worker/                   # Cloudflare Worker backend API bridge
├── tests/                        # Vitest E2E & Integration test suites (Tiers 1-4)
├── scripts/                      # Build & deployment scripts (prepare-cloudflare.mjs)
├── .github/workflows/ci.yml      # CI/CD pipeline
└── wrangler.toml                 # Cloudflare configuration
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| F1 | Type Safety & `any` Elimination | Resolve all 106 `any` casts with strictly typed interfaces/DTOs; set `noImplicitAny: true` | M3 | Survey R1 |
| F2 | ESLint Cleanliness | Resolve all 241 ESLint errors/warnings (React 19 hooks, unused vars, unescaped quotes) | M3 | Survey R1 |
| F3 | Server Action Error Handling | Wrap all 14 server actions in `try/catch` returning standardized `ActionResult` (`{ success: false, error: string }`) | M2 | Survey R2 |
| F4 | API Route Error Sanitization | Prevent 500 error leakage of raw `error.message` across API routes | M2 | Survey R2 |
| F5 | Scoped Error Boundaries | Add `error.tsx` to `/admin`, `/dealer`, and `/customer` layouts with reset buttons | M2 | Survey R2 |
| F6 | Loading & Not-Found Coverage | Add missing `loading.tsx` and `not-found.tsx` across routes | M2 | Survey R2 |
| F7 | Database Credential Hardening | Remove hardcoded Supabase DB password from `src/lib/db.ts:24` | M1 | Survey R3 |
| F8 | Payment Endpoint Auth Hardening | Fix unauthenticated IDOR in `/api/payments/create` and order ownership in `/api/checkout/razorpay` | M1 | Survey R3 |
| F9 | Admin PIN Enforcement | Enforce mandatory security PIN for ADMIN role authentication in `src/lib/auth.ts` | M1 | Survey R3 |
| F10 | Role Enumeration Protection | Secure/remove public `checkIsAdmin` server action | M1 | Survey R3 |
| F11 | Dealer Role Sync | Elevate `User.role = "DEALER"` on dealer approval in `PATCH /api/admin/dealers` | M1 | Survey R3 |
| F12 | Server-Side Zod Validation | Enforce Zod schemas on all mutation routes and reconcile validation schemas | M1 | Survey R3 |
| F13 | Test Infrastructure Setup | Install Vitest, configure `vitest.config.ts`, add `"test": "vitest run"` script | E2E Track | Survey R4 |
| F14 | Auth & Role Guard Test Suite | Unit/integration tests for unauth, wrong-role, and correct-role access across 3 roles | E2E Track | Survey R4 |
| F15 | Server Action & API Tests | Tests for product CRUD, order creation, quotation, address mutations with validation | E2E Track | Survey R4 |
| F16 | Payment Lifecycle Tests | Tests for MockPaymentProvider, Razorpay verify, and webhook handling | E2E Track | Survey R4 |
| F17 | Cart N+1 Query Elimination | Batch lookup and transaction in `/api/cart/route.ts` sync action | M4 | Survey R5 |
| F18 | Image Optimization | Use Next.js `<Image>` with priority/sizes on Hero, Navbar, Footer, and products | M4 | Survey R5 |
| F19 | Suspense Boundary on Login | Wrap `useSearchParams()` in `/auth/login` inside `<Suspense>` | M4 | Survey R6 |
| F20 | Code-Splitting Optimization | Dynamically import heavy `@hello-pangea/dnd` in Admin product reordering | M4 | Survey R5 |
| F21 | Accessibility & Form Labels | Bind form inputs with `htmlFor`/`id` and add `aria-label` to icon buttons | M4 | Survey R6 |
| F22 | Wrangler DevDependency | Add `wrangler` to `package.json` devDependencies for clean CI/deploy execution | M5 | Survey R7 |
| F23 | Comprehensive `.env.example` | Document all 25 environment variables with descriptions and placeholder defaults | M5 | Survey R7 |
| F24 | GitHub Actions CI Workflow | Create `.github/workflows/ci.yml` running lint, type-check, test, and build | M5 | Survey R7 |
| F25 | Cloudflare Deployment Verification | Verify `pnpm run deploy:all` and `prepare-cloudflare.mjs` build bundle | M5 | Survey R7 |
| F26 | Full E2E Test Pass (Tiers 1-4) | Run and pass 100% of the comprehensive E2E test suite | M6 | Acceptance Criteria |
| F27 | Adversarial Hardening (Tier 5) | White-box stress testing, edge case hardening, and clean forensic audit | M6 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Security & Auth Hardening (R3) | F7, F8, F9, F10, F11, F12 | none | DONE |
| M2 | Error Handling & Resilience (R2) | F3, F4, F5, F6 | none | DONE |
| M3 | Code Quality & Type Safety (R1) | F1, F2 | M1, M2 | PLANNED |
| M4 | UI/UX, Performance & Accessibility (R5, R6) | F17, F18, F19, F20, F21 | none | IN_PROGRESS |
| M5 | Cloudflare Deployment & CI/CD (R7) | F22, F23, F24, F25 | none | IN_PROGRESS |
| M6 | Final Verification & Hardening | F26, F27 | M1, M2, M3, M4, M5, E2E Track | PLANNED |

## E2E Testing Track
| Track | Scope | Dependencies | Status |
|---|---|---|---|
| E2E Test Suite | F13, F14, F15, F16 (Tiers 1-4 test infrastructure and test suites) | none (parallel) | IN_PROGRESS |

## Interface Contracts
### Standard Server Action Response (`ActionResult<T>`)
```typescript
export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```
All server actions in `src/actions/` MUST return `ActionResult<T>`.

### API Route Error Response
```typescript
export function apiError(error: string, status = 400, details?: unknown): NextResponse
```
All API error responses MUST return `{ error: string, details?: unknown }` with appropriate HTTP status codes (400, 401, 403, 404, 500). 500 status codes MUST NOT expose raw database or runtime stack traces.

### Auth Role Contract
Roles: `"ADMIN" | "DEALER" | "CUSTOMER"`
- Unauthenticated requests to protected endpoints return 401.
- Authenticated requests with mismatched roles return 403.
- Admin PIN is required for `"ADMIN"` credentials authentication.
