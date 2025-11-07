# A2G Command Center

Enterprise Command Center tipo Palantir/Bloomberg Terminal para gestión integral de negocios con IA integrada.

## 🚀 Características Principales

### Command Center Dashboard
- **Vista consolidada** de todas las entidades (A2G, Roger Sanchez, Audesign, S-CORE, TWINYARDS, BÂBEL)
- **KPIs en tiempo real**: Liquidez, Runway, Revenue, P&L, Cashflow
- **Gráficos interactivos** tipo Bloomberg Terminal
- **Alertas críticas** inteligentes
- **Selector multi-entidad** o vista agregada

### Análisis Automático de Documentos con IA
- **Upload drag & drop** de PDFs, Excel, CSV, imágenes
- **Procesamiento automático** con Claude AI
- **Extracción de KPIs**: Estados financieros, facturas, contratos, reportes bancarios
- **Categorización inteligente** de transacciones
- **Chat con documentos**: Consultas en lenguaje natural sobre tus datos

### Visualizaciones Avanzadas
- Line Charts: Evolución temporal
- Bar Charts: Comparativas
- Sankey Diagrams: Flujo de dinero entre entidades
- Treemaps: Distribución de gastos
- Waterfall Charts: Cambios en cashflow
- Heat Maps: Gastos por geografía

### Finanzas Multi-Entidad
- **Gestión de cuentas**: Wio, Wise, Amex, etc.
- **Conversión FX** en tiempo real
- **Categorización automática** de transacciones con IA
- **Drill-down** interactivo en cualquier métrica
- **Proyecciones** de cashflow

### Módulos Especializados
- **CRM Visual**: Pipeline Kanban, scoring de leads
- **Booking Management** (Roger Sanchez): Gestión de eventos
- **Marketing Analytics** (Audesign): ROAS, campañas
- **Tareas y Proyectos**: Kanban board con time tracking

### IA Integrada
- **Análisis automático** de documentos
- **Insights en tiempo real**
- **Detección de anomalías**
- **Recomendaciones accionables**
- **Chat conversacional** con tus datos

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 14+** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **Framer Motion** para animaciones

### Backend & Base de Datos
- **Next.js API Routes**
- **Supabase** (PostgreSQL con Row Level Security)
- **Supabase Storage** para documentos
- **Supabase Auth** con MFA

### IA & Análisis
- **Anthropic Claude API** (Sonnet 4.5)
- Análisis de documentos
- Categorización automática
- Chat conversacional
- Generación de insights

### PWA & Offline
- **Service Workers** para offline mode
- **Instalable** en dispositivos
- **Push Notifications** (opcional)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar migraciones de base de datos
# (Ejecutar supabase/migrations/001_initial_schema.sql en tu proyecto Supabase)

# Iniciar el servidor de desarrollo
npm run dev
```

## 🔧 Configuración

### 1. Supabase

Crea un proyecto en [Supabase](https://supabase.com):

1. Ejecuta el script SQL en `supabase/migrations/001_initial_schema.sql`
2. Crea un bucket llamado "documents" en Storage
3. Configura las políticas de acceso para el bucket

### 2. Anthropic Claude API

1. Obtén tu API key en [Anthropic Console](https://console.anthropic.com)
2. Añádela a `.env.local`

### 3. Mapbox (Opcional)

Para los mapas interactivos:

1. Obtén un token en [Mapbox](https://www.mapbox.com)
2. Añádelo a `.env.local`

### Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄 Estructura de Base de Datos

### Tablas Principales

- **companies**: Entidades/empresas
- **accounts**: Cuentas bancarias por empresa
- **transactions**: Todas las transacciones financieras
- **documents**: Documentos subidos
- **kpis_extracted**: KPIs extraídos por IA
- **contacts**: CRM
- **bookings**: Eventos (Roger Sanchez)
- **tasks**: Tareas y proyectos
- **marketing_campaigns**: Campañas (Audesign)
- **ai_chat_history**: Historial de conversaciones

### Vistas Materializadas

- **company_financial_summary**: Resumen financiero consolidado por empresa

### Row Level Security

Todas las tablas tienen políticas RLS activadas para seguridad multi-tenant.

## 🎨 Tema Dark Premium

La aplicación utiliza un tema dark mode premium inspirado en Palantir y Arc Browser:

- Glassmorphism effects
- Gradientes sutiles
- Animaciones suaves con Framer Motion
- Diseño responsive mobile-first

## 📱 PWA

La aplicación es completamente instalable como PWA:

- Funciona offline
- Instalable en desktop y mobile
- Push notifications
- App shortcuts

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Variables de Entorno en Vercel

Configura todas las variables de entorno en el dashboard de Vercel.

## 📊 Uso

### 1. Dashboard Principal

Accede al dashboard en `/dashboard`:

- Selecciona una entidad o "TODAS"
- Visualiza KPIs consolidados
- Explora gráficos interactivos
- Revisa alertas críticas

### 2. Subir Documentos

1. Click en "Subir Documento"
2. Arrastra archivos (PDF, Excel, CSV, imágenes)
3. La IA los procesa automáticamente
4. Los KPIs se actualizan en el dashboard

### 3. Chat con IA

1. Click en "Chat IA"
2. Haz preguntas como:
   - "¿Cuánto gasté en marketing este mes?"
   - "¿Qué empresa es más rentable?"
   - "Proyecta mi cashflow para Q4"
   - "¿Por qué bajó el ROAS de Audesign?"

### 4. Finanzas

Navega a `/finances` para:

- Ver todas las cuentas
- Analizar transacciones
- Categorizar gastos
- Generar reportes

### 5. CRM

Navega a `/crm` para:

- Gestionar contactos
- Ver pipeline de ventas
- Trackear oportunidades

## 🔒 Seguridad

- **Row Level Security** en todas las tablas
- **Autenticación** con Supabase Auth
- **MFA** disponible
- **Encriptación** de datos sensibles
- **HTTPS** obligatorio en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial. © A2G 2024

## 🆘 Soporte

Para soporte, contacta a [tu-email@a2g.com]

## 🗺 Roadmap

### Fase 1 - MVP (Completada)
- ✅ Dashboard con KPIs
- ✅ Análisis de documentos con IA
- ✅ Chat con IA
- ✅ Visualizaciones avanzadas
- ✅ PWA

### Fase 2 - Finanzas Avanzadas (Próximamente)
- [ ] Integración con Plaid para sync automático de bancos
- [ ] Proyecciones de cashflow con ML
- [ ] Análisis de sensibilidad
- [ ] Escenarios what-if

### Fase 3 - Automatización (Futuro)
- [ ] Recordatorios automáticos de pagos
- [ ] Reconciliación automática
- [ ] Generación automática de reportes
- [ ] Integraciones con Gmail y Calendar

### Fase 4 - Colaboración (Futuro)
- [ ] Permisos granulares por usuario
- [ ] Comentarios en documentos
- [ ] Aprobaciones workflow
- [ ] Notificaciones en tiempo real

## 🎯 Casos de Uso

1. **CFO Dashboard**: Vista ejecutiva de todas las empresas
2. **Análisis de Documentos**: Subir estados financieros y obtener insights automáticos
3. **Gestión de Cashflow**: Proyectar y optimizar flujo de efectivo
4. **Marketing Analytics**: Analizar ROAS y optimizar campañas (Audesign)
5. **Booking Management**: Gestionar eventos y fees (Roger Sanchez)
6. **Business Intelligence**: Hacer preguntas en lenguaje natural sobre los datos

## 💡 Tips

- Usa el selector de empresa para filtrar por entidad
- Los documentos se procesan automáticamente en background
- El chat con IA tiene contexto de todas tus transacciones y KPIs
- Los gráficos son interactivos: hover, zoom, drill-down
- La app funciona offline gracias a PWA

## 🏗 Arquitectura

```
app/
├── dashboard/          # Dashboard principal
├── finances/          # Módulo de finanzas
├── crm/              # CRM y contactos
├── documents/        # Gestión de documentos
├── api/              # API routes
│   ├── documents/    # Upload y procesamiento
│   ├── chat/         # Chat con IA
│   └── ...
components/
├── charts/           # Componentes de gráficos
├── dashboard/        # Componentes del dashboard
├── documents/        # Componentes de documentos
├── chat/            # Chat con IA
└── ui/              # Componentes base (shadcn/ui)
lib/
├── services/        # Servicios (Claude API, etc.)
├── supabase/        # Cliente Supabase
├── types/           # TypeScript types
└── utils.ts         # Utilidades
supabase/
└── migrations/      # Migraciones SQL
```

---

**Hecho con ❤️ por A2G usando Claude AI**
