# WEBtlalchichistore — Code Quality Analysis Report

**Project:** Next.js 16.2.9 + React 19.2.4 e-commerce site  
**Analysis Date:** 2026-06-27  
**Scope:** Full codebase (70 source files, ~6,600 lines of source code)

---

## 🔴 CRITICAL (Fix Immediately)

### C1. Hardcoded Admin Secret Fallback
**File:** `src/lib/admin.ts:6`
```typescript
export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || getSetting('admin_secret') || 'admin123'
}
```
The fallback password `admin123` is baked into source code and committed to git. Anyone who reads the repository can access the admin panel.

**Fix:** Throw an error if no secret is configured, or generate a random one on first run. Never hardcode credentials.
```typescript
export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET || getSetting('admin_secret')
  if (!secret) throw new Error('ADMIN_SECRET not configured. Run setup.')
  return secret
}
```

### C2. Hardcoded Email in Production PayPal Success Flow
**File:** `src/app/[locale]/checkout/success/page.tsx:36`
```typescript
body: JSON.stringify({ paypal_order_id: paypalToken, email_usuario: 'ruffolmx@gmail.com' }),
```
A personal email is hardcoded into the PayPal order confirmation. This means every PayPal customer's confirmation email gets sent to this single address if no session email exists.

**Fix:** Remove the hardcoded email. Use the stored email from sessionStorage as done with Stripe, or pass it through the PayPal return URL.
```typescript
body: JSON.stringify({ paypal_order_id: paypalToken, email_usuario: sessionStorage.getItem('tlalchichi_email') || '' }),
```

### C3. Public REST Endpoint with No Authentication
**File:** `src/app/api/admin/restock/route.ts`
There is NO authentication check on this endpoint. Anyone on the internet can POST to `/api/admin/restock` and reset all product stock to random values.
```typescript
export async function POST() {
  try {
    const db = getDb()  // No requireAdmin() check!
```

**Fix:** Add `requireAdmin(req)` at the top of the handler.

### C4. PayPal Webhook Has No Signature Verification
**File:** `src/app/api/webhooks/paypal/route.ts`
The PayPal webhook handler accepts and processes any POST body without verifying it actually came from PayPal. Compare with the Stripe webhook (`stripe/route.ts`) which properly verifies signatures using `stripe.webhooks.constructEvent()`.

**Fix:** Implement PayPal webhook signature verification using the `PAYPAL_WEBHOOK_ID` env var and PayPal's verification endpoint, or at minimum validate `body.event_type` is strictly one of the expected values.

### C5. `require('fs')` in ESM Module
**File:** `src/lib/db.ts:14`
```typescript
const fs = require('fs')
```
Mixed CommonJS `require` in an ES module project with `"type": "module"` (implied by Next.js). This may fail at build time or in certain runtimes.

**Fix:** Replace with proper ES module import at the top:
```typescript
import fs from 'fs'
import path from 'path'
```

### C6. `seedColors()` and `seedProductTypes()` Delete All Data on Every Cold Start
**File:** `src/lib/db.ts:242-269`
```typescript
function seedColors() {
  const db = _db!
  db.exec('DELETE FROM colors')  // WIPES ALL DATA
  // ... reseed
}
function seedProductTypes() {
  db.exec('DELETE FROM product_types')  // WIPES ALL DATA
  // ... reseed
}
```
Both functions are called inside `getDb()` which runs on EVERY first database access after a cold start. This means any admin customizations to colors or product types are silently lost every time the server restarts.

**Fix:** Check if data exists before wiping:
```typescript
function seedColors() {
  const db = _db!
  const existing = db.prepare('SELECT COUNT(*) as count FROM colors').get() as any
  if (existing.count > 0) return  // Already seeded
  // ... insert
}
```

---

## 🟠 HIGH (Fix Soon)

### H1. Massive Code Duplication in Admin Page
**File:** `src/app/[locale]/admin/page.tsx` (866 lines)
The `ModelManager`, `TypeManager`, `ColorManager`, and `AvailabilityManager` components each reimplement the same patterns:
- `authHeaders()` function (defined 4 times)
- `showToast()` function (defined 4 times)  
- `handleEdit()` with same window.scrollTo pattern (3 times)
- `handleSave()` with same fetch/error/logic (4 times)
- `handleDelete()` with same confirm/fetch/load (4 times)
- Toast rendering JSX (4 times)
- Error display JSX (4 times)

**Fix:** Extract shared logic into custom hooks:
- `useAdminAuth()` — returns `authHeaders`, `fetchWithAuth`
- `useAdminToast()` — returns `toast`, `showToast`, `<ToastNotification />`
- `useCrudForm<T>()` — generic form state management with edit/new/save/delete

### H2. All Database Functions Return `any`
**Files:** `src/lib/db.ts`, `src/types/model.ts`
Every query function returns `any[]` or `any | null` despite having well-defined TypeScript interfaces in `src/types/`. This defeats the purpose of TypeScript.

**Fix:** Use the defined types as return types:
```typescript
// Instead of:
export function getModels(): any[] {

// Use:
export function getModels(): Model[] {
```

### H3. No Database Transactions for Order Creation
**Files:** `src/lib/db.ts` (createOrder), `src/app/api/webhooks/stripe/route.ts`
Order creation, order_items insertion, and stock decrement happen in separate statements without a transaction. If `createOrderItems` succeeds but `decrementStock` fails, you have an inconsistent state (confirmed order but no stock deducted).

**Fix:** Wrap in a transaction:
```typescript
const db = getDb()
const txn = db.transaction(() => {
  const order = createOrder(data)
  createOrderItems(orderItems)
  for (const item of itemsData) decrementStock(...)
  return order
})
const order = txn()
```

### H4. In-Memory Rate Limit Doesn't Survive Restarts
**File:** `src/lib/admin.ts:48`
```typescript
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
```
In serverless environments (Vercel, Netlify), this Map is destroyed after each function invocation, making rate limiting ineffective. The Map also grows unboundedly (memory leak).

**Fix:** Store rate limit state in the database (`settings` table) or use an external service. At minimum, add periodic cleanup:
```typescript
// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key)
  }
}, 300_000)
```

### H5. CatImages Data Duplicated Across Multiple Files
**Files:** `src/app/[locale]/page.tsx:16-21`, `src/app/[locale]/productos/page.tsx:69-74`
The same `catImages` mapping object is duplicated verbatim in two page files. Any change requires updating both places.

**Fix:** Move to a shared constants file:
```typescript
// src/lib/constants.ts
export const CATEGORY_IMAGES: Record<string, string[]> = { ... }
```

### H6. Body Overflow Toggle Duplicated
**Files:** `src/components/cart/CartDrawer.tsx:26-33`, `src/components/layout/MobileMenu.tsx:16-25`
Both components implement the same `document.body.style.overflow` locking pattern.

**Fix:** Extract to a custom hook:
```typescript
// src/hooks/useBodyScrollLock.ts
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [locked])
}
```

### H7. Inconsistent Currency Handling
**File:** `src/lib/stripe.ts:17-21`
```typescript
const currencyMap: Record<string, number> = {
  MXN: 100,  // Correct: Stripe uses cents
  USD: 100,  // Also 100? But USD is already in dollars in some places
}
```
The `formatAmountForStripe` function always multiplies by 100, but in `src/app/api/checkout/create-payment-intent/route.ts` the amounts come from the frontend which may already be in cents (Stripe cents) or raw dollars. This is inconsistent with the checkout stripe route which also multiplies by 100.

**Fix:** Standardize on a single representation (always whole currency units in the app, multiply by 100 only in Stripe-facing code). Add clear documentation.

### H8. Admin Token in sessionStorage (XSS Risk)
**File:** `src/app/[locale]/admin/layout.tsx:40`
The admin authentication token is stored in `sessionStorage`, which is accessible to any JavaScript running on the page. A successful XSS attack could steal this token and grant admin access.

**Fix:** Use `httpOnly` cookies for the admin token instead. Set via the API response:
```typescript
// In verify route handler
const response = NextResponse.json({ verified: true })
response.cookies.set('admin_token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 86400 })
return response
```

### H9. No Input Size Limits on API Routes
**Files:** All `src/app/api/**/route.ts` files
Every API route does `await req.json()` without size limits. An attacker can send a multi-gigabyte JSON body and exhaust server memory.

**Fix:** Add size validation or use Next.js body size limits:
```typescript
export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }
```

### H10. Missing `eslint` Run — Unable to Verify Code Quality
The `eslint` command timed out. No ESLint configuration file was found in the project root. Given the use of `any` types, missing dependency arrays, and `require()` in ESM, there are likely many lint warnings.

**Fix:** Run `npx eslint src --ext .ts,.tsx` and fix all warnings. Consider enabling stricter TypeScript rules (`noUncheckedIndexedAccess`, stricter `strictNullChecks`).

---

## 🟡 MEDIUM (Address When Convenient)

### M1. `useEffect` Missing Dependencies
**Files:** Multiple
Several `useEffect` hooks have incomplete dependency arrays. For example:
- `CartDrawer.tsx` — the cleanup function doesn't depend on `isOpen` in the function body but the effect does
- `HeroCarousel.tsx:59` — `next` included but `next` depends on `current` which changes

**Fix:** Run ESLint's `react-hooks/exhaustive-deps` rule and fix all warnings.

### M2. Order Confirmation Email Component Unused
**File:** `src/components/emails/OrderConfirmation.tsx`
This dedicated email template component is never imported anywhere. Both webhooks and the confirm-order route use inline HTML strings instead.

**Fix:** Either remove the unused component or refactor webhooks to use it (using `react-email` or `renderToStaticMarkup`).

### M3. StripePaymentForm Component Possibly Unused
**File:** `src/components/checkout/StripePaymentForm.tsx`
The checkout page has its own inline Stripe payment button. The `StripePaymentForm` component appears unused (check imports across all files).

**Fix:** Confirm with `npx ts-prune` or grep for imports, then remove if truly unused.

### M4. PayPal Success Page Relies on Client-Side URL Parsing
**File:** `src/app/[locale]/checkout/success/page.tsx`
The success page parses `window.location.search` to get `session_id` or `token`, then makes a server call. This means the browser can be refreshed and the confirmation API will be called again (mitigated by `sent` state, but still fragile).

**Fix:** Use a server component that reads `searchParams` and performs the confirmation server-side. This also avoids the flash of "Confirmando tu pedido..." text.

### M5. `decrementStock` Uses `MAX(0, stock - quantity)` 
**File:** `src/lib/db.ts:485`
```sql
UPDATE model_availability SET stock = MAX(0, stock - ?) WHERE ... AND stock >= ?
```
The SQL uses `MAX(0, ...)` to prevent negative stock, but this silently caps at 0. It would be better to reject oversell instead of silently setting to 0.

**Fix:** Remove `MAX(0, ...)` and handle the case where `stock < quantity` at the application level before updating.

### M6. `ALTER TABLE` in Production with Silent Error Suppression
**File:** `src/lib/db.ts:76-81`
```typescript
try { db.exec('ALTER TABLE models ADD COLUMN categoria_es TEXT') } catch {}
```
Blindly catching all errors means real schema migration failures are silently ignored. A typo in a column name or a constraint violation would go unnoticed.

**Fix:** At minimum log the error:
```typescript
try { db.exec('ALTER TABLE models ADD COLUMN categoria_es TEXT') } catch (e) {
  console.warn('[db] Migration skipped (column may exist):', e)
}
```

### M7. Sitemap Hardcodes Date
**File:** `src/app/sitemap.ts:7`
```typescript
const today = '2026-06-24'
```
The sitemap date is hardcoded and won't update automatically.

**Fix:**
```typescript
const today = new Date().toISOString().slice(0, 10)
```

### M8. `env.d.ts` Missing Several Env Var Declarations
**File:** `src/env.d.ts`
Missing declarations: `ADMIN_SECRET`, `PAYPAL_SANDBOX`, `PAYPAL_ENV`. These are used in `admin.ts` and `paypal.ts` but TypeScript doesn't know about them.

**Fix:** Add to env.d.ts:
```typescript
ADMIN_SECRET: string
PAYPAL_SANDBOX: string
PAYPAL_ENV: string
```

### M9. Theme Toggle Reads from localStorage But Theme Script Uses `localStorage`
**File:** `src/components/layout/ThemeToggle.tsx:18`
The theme toggle writes `'dark'` or `'light'` to `localStorage`, and the layout's inline script reads from `localStorage`. This is consistent, but there's a potential flash-of-wrong-theme if the user toggles and refreshes quickly.

**Fix:** Consider using a cookie for the theme to allow server-side rendering of the correct theme class, avoiding FOUC (Flash of Unstyled Content).

### M10. PayPal Auth Helper Functions Duplicated
**Files:** `src/app/api/checkout/paypal/route.ts`, `src/app/api/webhooks/paypal/route.ts`
The `basicAuth()`, `bearerAuth()` functions (and the obtuse `String.fromCharCode` obfuscation) are duplicated in both files. The PayPal token fetching logic is also duplicated.

**Fix:** Move PayPal API helpers to `src/lib/paypal.ts`:
```typescript
export async function getPayPalAccessToken(): Promise<string> { ... }
export async function createPayPalOrder(...): Promise<any> { ... }
export async function getPayPalOrder(id: string): Promise<any> { ... }
```

---

## 🟢 LOW (Improvements)

### L1. HeroCarousel Has Empty `interface Props {}`
**File:** `src/components/layout/HeroCarousel.tsx:38`
```typescript
interface Props {}
```
This interface is used but empty. Remove it or add actual props if needed.

### L2. Inconsistent Naming Conventions
Spanish field names (`nombre_es`, `precio_mxn`) in the database are mixed with English code (`getSubtotal`, `updateQuantity`). This is by design for the bilingual store but makes consistent code conventions difficult.

**Fix:** Consider adding a mapping layer rather than passing raw DB field names throughout the codebase.

### L3. `useMemo` Missing Dependency
**File:** `src/app/[locale]/admin/page.tsx:202`
```typescript
const filtered = useMemo(
  () => models.filter(...),
  [models, search],  // Good, but search is a state variable
)
```
This one is actually correct, but the same pattern in other places may be missing dependencies.

### L4. `getModelsByType` Performs Client-Side Filtering
**File:** `src/lib/db.ts:329-348`
This function fetches ALL active models and then filters them in JavaScript by matching `categoria_es` against a hardcoded map. This is inefficient — the database should do the filtering.

**Fix:**
```typescript
export function getModelsByType(typeSlug: string): Model[] {
  const slugToCat: Record<string, string> = { ... }
  const catName = slugToCat[typeSlug]
  if (!catName) return []
  const rows = db.prepare(
    'SELECT * FROM models WHERE categoria_es = ? AND activo = 1 ORDER BY id ASC'
  ).all(catName)
  return rows.map(normalizeModel)
}
```

### L5. WhatsApp Number Hardcoded in Multiple Places
**Files:** `Footer.tsx:37`, `WhatsAppButton.tsx:18`, `CheckoutPage.tsx:290`, `db.ts:160`
The phone number `523121337694` appears in 4 files. While `WhatsAppButton` does read from `NEXT_PUBLIC_WHATSAPP_NUMBER`, Footer and Checkout don't.

**Fix:** Use the env variable everywhere, with the same fallback.

### L6. `ProductGallery` Passes `principal` Prop Redundantly
**File:** `src/app/[locale]/producto/[slug]/page.tsx:82`
```typescript
<ProductGallery
  images={model.imagenes}
  principal={model.imagenes?.[0] || null}  // First image passed twice
/>
```
The component then does `[principal, ...images]` which duplicates the first image. Either remove `principal` from the component or don't include the first image in `images`.

### L7. Unnecessary Type Assertions
Many places use `as any` when TypeScript types would work. For example, `db.ts:4`:
```typescript
const seedProducts: any[] = seedData  // seed.json is typed
```
`seedData` is imported from a JSON file and already has a valid type.

### L8. Checkout Page Recomputes Values in Rendering
**File:** `src/app/[locale]/checkout/page.tsx:87`
```typescript
shipping: getSubtotal(items, moneda) > 0 ? total - subtotal : 0,
```
The shipping cost passed to the API is computed from items again rather than using the already-derived values. This could desync if items changed between render and submit.

### L9. `Button` Component Uses `forwardRef` But Never Passed a Ref
**File:** `src/components/ui/Button.tsx`
The component is wrapped in `forwardRef` but no consumer passes a `ref`. This adds unnecessary complexity.

### L10. `HISTORY` Field Missing from Seed Data
**File:** `src/lib/seed.json` — the seed data has `historia_es` and `historia_en` fields, but they are all generic placeholder text: "Pieza única de la tradición Tlalchichi de Colima, México." This suggests the seed data is incomplete/stale.

---

## ✅ Verification Results

### Build: PASSED
```
$ npm run build
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 5.7s
✓ Finished TypeScript in 7.8s
✓ Generating static pages using 11 workers (33/33) in 579ms
```
➡️ TypeScript compiles, all 33 static pages render, all API routes and proxies register.

⚠️ Deprecation notice: `middleware` file convention deprecated in Next.js 16. Migrate to `proxy`.

### Lint: 71 problems (69 errors, 2 warnings) in 5 key files checked
Key findings from `npx eslint` that validate this report:
- **Critical C5 confirmed**: `@typescript-eslint/no-require-imports` — `require('fs')` in `db.ts:14`
- **High H2 confirmed**: 69 `no-explicit-any` errors across `db.ts`, `paypal/route.ts`, `restock/route.ts`
- **Medium M4 confirmed**: `setState-in-effect` in `success/page.tsx:15`
- **Unused code**: `seedData` import unused in `restock/route.ts`, `typeSlugMap` unused in `db.ts:200`

---

## 📊 Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 4 | 2 | 1 | 0 | 7 |
| Code Quality | 0 | 3 | 5 | 6 | 14 |
| Architecture | 0 | 3 | 3 | 1 | 7 |
| Performance | 0 | 1 | 1 | 2 | 4 |
| Type Safety | 1 | 1 | 1 | 1 | 4 |
| **Total** | **6** | **10** | **11** | **10** | **37** |

---

## 🎯 Recommended Refactoring Priority

1. **Fix all 6 Critical issues immediately** — these are security vulnerabilities and data loss risks
2. **Address H1-H5 (code duplication, typing, transactions, rate limits)** — these improve maintainability and reliability
3. **Move shared logic to `src/lib/`** (catImages, PayPal helpers, body scroll lock, admin CRUD hooks)
4. **Add ESLint strict mode** and fix all warnings
5. **Add API input validation middleware** for body size limits and content-type checking
6. **Consider extracting admin components** from the 866-line monolith into separate files
