# HQ Improvement Task

## Context
This is a Next.js 14 + Supabase app at https://headquarters.a2g.company (Vercel: "a2g-headquarters").
It's the command center for A2G Company — a Dubai holding managing music artists + Audesign (VST plugins).

## Tech Stack
- Next.js 14 (App Router, `app/` directory)
- Supabase (PostgreSQL) at `hgxdozjewidhthlfsnhp.supabase.co`
- shadcn/ui components in `components/ui/`
- Server actions in `src/actions/`
- Types in `src/types/database.ts`
- Tailwind CSS, dark theme
- Auth via Supabase (login page exists)

## WHAT TO BUILD

### 1. Royalties Tracker (NEW — `/talents/royalties`)

**Supabase migration** (`supabase/migrations/005_royalties_contracts.sql`):
```sql
CREATE TABLE royalties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  source TEXT NOT NULL, -- 'Insomniac', 'SUSHI3000', 'Spotify', etc.
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invoiced', 'paid', 'disputed', 'overdue')),
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  paid_date DATE,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_royalties_project ON royalties(project_id);
CREATE INDEX idx_royalties_status ON royalties(status);
```

**Server actions** (`src/actions/royalties.ts`):
- getAllRoyalties, getRoyaltiesByProject, getRoyaltiesStats (total pending, total paid, total overdue)
- createRoyalty, updateRoyalty, deleteRoyalty

**Components** (`components/royalties/`):
- `royalties-table.tsx` — sortable table with status badges (color-coded: pending=yellow, invoiced=blue, paid=green, overdue=red, disputed=orange)
- `royalties-stats.tsx` — stat cards: Total Pending, Total Paid, Total Overdue
- `royalty-form.tsx` — create/edit dialog with all fields

**Page** (`app/talents/royalties/page.tsx`):
- Full CRUD page following same pattern as releases and bookings pages

### 2. Contracts/Deals Section (NEW — `/talents/contracts`)

**Supabase table** (in same migration):
```sql
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  counterparty TEXT NOT NULL, -- 'Lush Records', 'HILOMATIK', 'CR2 Records'
  contract_type TEXT NOT NULL DEFAULT 'release'
    CHECK (contract_type IN ('release', 'management', 'publishing', 'booking', 'licensing', 'other')),
  status TEXT NOT NULL DEFAULT 'negotiating'
    CHECK (status IN ('draft', 'negotiating', 'sent', 'signing', 'active', 'completed', 'terminated')),
  value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  key_terms TEXT, -- markdown summary of important terms
  document_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

**Server actions** (`src/actions/contracts.ts`):
- getAllContracts, getContractsByProject, getContractsStats
- createContract, updateContract, deleteContract

**Components** (`components/contracts/`):
- `contracts-table.tsx` — with status pipeline badges (draft→negotiating→sent→signing→active)
- `contracts-stats.tsx` — stat cards: Active, Negotiating, Total Value
- `contract-form.tsx` — create/edit dialog

**Page** (`app/talents/contracts/page.tsx`)

### 3. Update Types (`src/types/database.ts`)

Add types for Royalty, NewRoyalty, Contract, NewContract following existing patterns.

### 4. Update Sidebar Navigation

In `components/layout/app-sidebar.tsx`, add under A2G Talents children:
```
{ name: "Royalties", href: "/talents/royalties", icon: <DollarSign className="h-4 w-4" /> },
{ name: "Contratos", href: "/talents/contracts", icon: <FileText className="h-4 w-4" /> },
```

### 5. Update Talents Dashboard (`app/talents/page.tsx`)

Add two new cards:
- **Royalties Overview**: total pending amount, # overdue
- **Active Contracts**: # active, # negotiating

### 6. Update Main Dashboard (`app/page.tsx`)

In A2G Talents card, add a line showing pending royalties amount if > 0.

## IMPORTANT RULES
- Follow EXACT same code patterns as existing releases/bookings (server actions, components, pages)
- Use shadcn/ui components from `components/ui/` (Card, Table, Badge, Button, Dialog, etc.)
- All pages use `AppLayout` wrapper
- Use lucide-react icons
- Dark theme compatible (already set up)
- Spanish labels in UI where existing code uses Spanish
- Don't break anything existing
- Run the Supabase migration via the supabase admin client OR create the SQL file
- Types file: add at the bottom, maintain existing style

## DO NOT
- Change auth/login
- Modify existing tables
- Change Vercel config
- Touch .env files
