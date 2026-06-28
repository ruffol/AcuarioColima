# WEBacuario

Clean e-commerce template based on Next.js 16 + Tailwind CSS 4 + SQLite.

## Features
- 🛒 Shopping cart with persisted state (Zustand)
- 💳 Stripe + PayPal payment gateways
- 🎨 Dark mode support (CSS variables)
- 🌎 Bilingual support (ES/EN via next-intl)
- 📦 Product management admin panel
- 📧 Order confirmation emails (Resend)
- 🚀 Railway-ready deployment (Dockerfile included)

## Quick Start

```bash
npm install
npm run dev
```

## Configure

Copy `.env.example` to `.env.local` and fill in:
- Stripe keys
- PayPal keys
- Resend API key
- Admin secret

## Structure

```
src/
├── app/           # Next.js App Router pages + API routes
├── components/    # Reusable UI components
├── lib/           # Business logic (db, payments, admin)
├── store/         # Zustand state (cart)
├── types/         # TypeScript type definitions
└── i18n/          # Internationalization config
```
