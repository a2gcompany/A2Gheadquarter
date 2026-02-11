# A2G Command Center v3.0

Aplicacion web para gestionar A2G Company y sus verticales (A2G Talents + Audesign). Dashboard ejecutivo con contabilidad, gestion de artistas, integraciones financieras y sistema de ingesta unificado.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth)
- **Vercel** (deploy + cron jobs)
- **Tailwind CSS** + shadcn/ui
- **Recharts** (graficos)

## Modulos

| Ruta | Modulo | Descripcion |
|------|--------|-------------|
| `/` | Dashboard | KPIs globales, business units, equipo |
| `/accounting` | Contabilidad | P&L por proyecto, importar CSV |
| `/talents` | A2G Talents | Artistas, Releases (CRUD + labels tracking), Bookings (shows/eventos) |
| `/audesign` | Audesign | KPIs SaaS, contabilidad |
| `/integrations` | Integraciones | Stripe, PayPal, Shopify, Bank Import, Google Sheets sync |
| `/ingestion` | Ingesta | Centro unificado de importacion, sincronizacion, reconciliacion e historial |
| `/employees` | Empleados | Gestion del equipo |

## Estructura

```
app/                    Pages y API routes
components/             React components (ui/, layout/, bookings/, releases/, ingestion/, etc.)
lib/                    Supabase clients, hooks, utils, types
src/actions/            Server Actions
src/types/              TypeScript database types
supabase/migrations/    SQL migrations
scripts/                Utility scripts
```

## Setup

```bash
cp .env.example .env.local
```

Variables requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
```

```bash
npm install
npm run dev
```

## Deploy

Conectado a Vercel con deploy automatico en cada push a `main`. Las migraciones SQL se aplican manualmente via Supabase CLI (`supabase db push --linked`).

---

**A2G Company** - Command Center v3.0
