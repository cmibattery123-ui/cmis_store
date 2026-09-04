# E2E Test Infra: CMI Battery / Perfect Batteries

## Test Philosophy
- Opaque-box, requirement-driven. Derived from `ORIGINAL_REQUEST.md`.
- Methodology: Category-Partition + BVA + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|:---:|:---:|:---:|
| 1 | Auth & Role-Based Access Control | R3 / ORIGINAL_REQUEST §3 | 5 | 5 | ✓ |
| 2 | Server Actions & Zod Validation | R2, R3 / ORIGINAL_REQUEST §2, §3 | 5 | 5 | ✓ |
| 3 | Order Creation & Checkout Flow | R6 / ORIGINAL_REQUEST §6 | 5 | 5 | ✓ |
| 4 | Payment Gateway & Mock Provider | R4 / ORIGINAL_REQUEST §4 | 5 | 5 | ✓ |
| 5 | Dealer B2B Quotations & Approval | R3, R6 / ORIGINAL_REQUEST §3, §6 | 5 | 5 | ✓ |
| 6 | Inventory Management & Stock Updates | R5, R6 / ORIGINAL_REQUEST §5, §6 | 5 | 5 | ✓ |
| 7 | Cart Synchronization & N+1 Query Avoidance | R5 / ORIGINAL_REQUEST §5 | 5 | 5 | ✓ |

## Test Architecture
- **Framework**: Vitest (`vitest run`)
- **Environment**: Node / jsdom
- **Directories**:
  - `tests/auth/`: Auth guards matrix, credentials & PIN validation
  - `tests/actions/`: Server actions validation, structured error responses
  - `tests/api/`: Role-restricted API routes (Admin, Dealer, Customer)
  - `tests/payments/`: MockPaymentProvider, Razorpay verification, webhooks
  - `tests/flows/`: End-to-end checkout, cart sync, quotation lifecycle

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|---|---|---|
| 1 | Full Customer Shopping Flow: Browse -> Add to Cart -> Local/DB Sync -> Checkout -> Mock Payment -> Order Created | F1, F3, F4, F7 | High |
| 2 | Dealer B2B Flow: Register Dealer -> Admin Approval -> View Discounted Catalog -> Request Quotation -> Admin Approves Quotation | F1, F2, F5 | High |
| 3 | Security Boundary Enforcement: Unauthenticated & Cross-role access attempts on all protected routes and actions | F1, F2 | Medium |
| 4 | Error Resilience & Recovery: Deliberate database failures in server actions returning safe JSON errors | F2, F3 | Medium |
| 5 | Payment Gateway Failures & Webhook Processing: Payment failure recovery and webhook event processing | F4 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (≥35 test cases)
- Tier 2: ≥5 per feature (≥35 test cases)
- Tier 3: Pairwise combinations across auth, payment, order, and quotation features
- Tier 4: ≥5 realistic end-to-end application scenarios
- **Total test count: ≥80 test cases**
