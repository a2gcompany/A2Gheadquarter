# Project Structure - A2G HQ macOS

```
A2GHeadquarter-macOS/
│
├── README.md                              # Documentación completa
├── QUICKSTART.md                          # Guía de inicio rápido
├── PROJECT_STRUCTURE.md                   # Este archivo
│
└── A2GHeadquarter/                        # Código fuente principal
    │
    ├── A2GHeadquarterApp.swift            # ✅ Entry point de la aplicación
    ├── Info.plist                         # ✅ Configuración de la app
    │
    ├── Models/                            # 📦 Modelos de datos
    │   ├── Company.swift                  # ✅ Empresas y cuentas
    │   ├── Transaction.swift              # ✅ Transacciones financieras
    │   ├── KPI.swift                      # ✅ KPIs y resumen financiero
    │   └── Document.swift                 # ✅ Documentos subidos
    │
    ├── Views/                             # 🎨 Vistas SwiftUI
    │   ├── LoginView.swift                # ✅ Pantalla de login
    │   ├── DashboardView.swift            # ✅ Dashboard principal
    │   ├── FinancesView.swift             # ✅ Finanzas y transacciones
    │   ├── CRMView.swift                  # ✅ CRM (placeholder)
    │   ├── DocumentsView.swift            # ✅ Gestión de documentos
    │   └── SettingsView.swift             # ✅ Configuración
    │
    ├── ViewModels/                        # 🧠 ViewModels (MVVM)
    │   └── DashboardViewModel.swift       # ✅ Lógica del dashboard
    │
    ├── Services/                          # 🔌 Servicios externos
    │   ├── AuthService.swift              # ✅ Autenticación Supabase
    │   ├── SupabaseService.swift          # ✅ Cliente Supabase
    │   └── ClaudeService.swift            # ✅ Cliente Claude AI
    │
    ├── Components/                        # 🧩 Componentes reutilizables
    │   └── KPICard.swift                  # ✅ Tarjeta de KPI
    │
    └── Assets.xcassets/                   # 🎨 Assets e iconos
        ├── Contents.json
        ├── AppIcon.appiconset/
        │   └── Contents.json
        └── AccentColor.colorset/
            └── Contents.json
```

## 📊 Estadísticas del Proyecto

- **Total archivos Swift**: 18
- **Líneas de código**: ~2,500+
- **Modelos**: 4 (Company, Transaction, KPI, Document)
- **Vistas**: 6 (Login, Dashboard, Finances, CRM, Documents, Settings)
- **Servicios**: 3 (Auth, Supabase, Claude)
- **Componentes**: 1+ (KPICard, más a añadir)

## 🏗 Arquitectura

### Patrón MVVM
```
View ←→ ViewModel ←→ Service ←→ API
  ↓         ↓           ↓
Model    @Published  Supabase/Claude
```

### Flujo de Datos
```
Usuario → SwiftUI View → ViewModel → Service → Supabase/Claude
                ↓           ↓          ↓
            @Published  Combine   URLSession
                ↓           ↓
              UI Update ← Data
```

## 🔗 Integración con Backend

### Supabase (compartido con web)
- PostgreSQL Database
- Row Level Security
- Storage para documentos
- Auth con JWT

### Claude AI
- API REST de Anthropic
- Modelo: claude-sonnet-4-5-20250929
- Análisis de documentos
- Chat conversacional

## 📝 Tipos de Archivos

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| `.swift` | 18 | Código fuente |
| `.plist` | 1 | Configuración |
| `.json` | 3 | Assets |
| `.md` | 3 | Documentación |

## 🎯 Features Implementadas

### ✅ Core Features
- [x] Autenticación con Supabase
- [x] Dashboard con KPIs
- [x] Vista de finanzas
- [x] Gestión de transacciones
- [x] Upload de documentos
- [x] Integración con Claude AI
- [x] Tema dark mode
- [x] Diseño nativo macOS

### 🚧 Próximamente
- [ ] Chat con IA integrado
- [ ] Gráficos interactivos (Charts)
- [ ] CRM completo
- [ ] Caché offline
- [ ] Notificaciones push
- [ ] Keychain para credenciales

## 🔧 Configuración Necesaria

1. **Xcode Project**: Crear manualmente en Xcode 15+
2. **Team Signing**: Configurar tu Apple Developer Team
3. **Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `ANTHROPIC_API_KEY`

## 📱 Compatibilidad

- **macOS**: 14.0+ (Sonoma)
- **Xcode**: 15.0+
- **Swift**: 5.9+
- **Arquitectura**: Universal (Intel + Apple Silicon)

## 🎨 Diseño

- **Framework**: SwiftUI
- **Estilo**: Dark mode premium
- **Iconos**: SF Symbols
- **Colores**: Gradientes sutiles
- **Layout**: Responsive, NavigationSplitView

## 🔐 Seguridad

- Tokens en UserDefaults (migrar a Keychain)
- HTTPS para todas las conexiones
- Row Level Security en Supabase
- API keys en environment variables

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Estado**: MVP Funcional
