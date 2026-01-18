# A2G Command Center

Aplicacion web modular para gestionar A2G Company y sus verticales. Cada modulo funciona de forma independiente pero comparte la misma base de datos.

## Stack Tecnologico

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Drizzle ORM** para gestion del schema
- **Vercel** para deploy
- **Tailwind CSS** + shadcn/ui para UI
- **Recharts** para graficos

## Arquitectura de Base de Datos

```
projects        - Proyectos (artistas y verticales)
transactions    - Contabilidad por proyecto
releases        - Lanzamientos musicales
bookings        - Shows y eventos
reports         - Reportes del equipo
```

## Configuracion

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Espera a que se configure la base de datos

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto Supabase:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Database URL (para Drizzle)
# Ve a Settings > Database > Connection string > Transaction pooler
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Crear tablas en la base de datos

```bash
npm run db:push
```

Esto creara todas las tablas definidas en `src/db/schema.ts`:
- `projects`
- `transactions`
- `releases`
- `bookings`
- `reports`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Modulos

### Fase 1 - Contabilidad (Disponible)

- Selector de proyecto (artistas y verticales)
- Importar CSV con preview
- Tabla de transacciones con filtros
- Resumen P&L con grafico mensual
- Vista "Todos los proyectos" con resumen

### Fase 2 - Releases (Proximamente)

- Gestion de lanzamientos musicales
- Tracking de contactos con sellos discograficos
- Estados: draft, shopping, accepted, released

### Fase 3 - Bookings (Proximamente)

- Gestion de shows y eventos
- Venues, fees, contratos
- Estados: negotiating, confirmed, contracted, completed, cancelled

### Fase 4 - Reports (Proximamente)

- Reportes mensuales del equipo
- Por departamento y proyecto
- Metricas y KPIs personalizados

## Formato CSV para Importar

El CSV debe tener las siguientes columnas:

```csv
date,description,amount,type,category
2024-01-15,Pago cliente X,5000,income,Ventas
2024-01-16,Spotify Ads,-1200,expense,Marketing
2024-01-17,Royalties Q4,3500,income,Royalties
```

- `date`: Fecha en formato YYYY-MM-DD
- `description`: Descripcion de la transaccion
- `amount`: Importe (positivo o negativo)
- `type`: `income` o `expense`
- `category`: Categoria (opcional)

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build para produccion
npm run start      # Iniciar produccion
npm run db:push    # Sincronizar schema con DB
npm run db:studio  # Abrir Drizzle Studio
```

## Estructura del Proyecto

```
app/
├── page.tsx              # Dashboard principal
├── accounting/           # Modulo de contabilidad
├── layout.tsx            # Layout raiz
└── globals.css           # Estilos globales

components/
├── layout/               # Layout y sidebar
├── accounting/           # Componentes de contabilidad
└── ui/                   # Componentes base

src/
├── db/
│   ├── schema.ts         # Schema de Drizzle
│   └── index.ts          # Cliente de DB
└── actions/              # Server actions
    ├── projects.ts
    └── transactions.ts
```

## Deploy en Vercel

1. Conecta el repositorio con Vercel
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
3. Deploy automatico en cada push

---

**A2G Company** - Command Center v2.0
