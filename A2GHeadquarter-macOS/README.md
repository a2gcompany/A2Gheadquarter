# A2G Command Center - macOS App

Aplicación nativa de macOS para A2G Command Center, construida con SwiftUI.

## 🎯 Características

- **Dashboard Nativo**: Vista consolidada de KPIs y métricas empresariales
- **Gestión Financiera**: Transacciones, cuentas y análisis financiero
- **CRM**: Gestión de contactos y pipeline (próximamente)
- **Documentos con IA**: Upload y análisis automático con Claude AI
- **Performance Nativa**: Velocidad y eficiencia de una app nativa de macOS
- **Diseño macOS**: Integración completa con el sistema operativo

## 🛠 Stack Tecnológico

- **SwiftUI**: Framework de UI moderno de Apple
- **macOS 14+**: Target moderno de macOS
- **Supabase**: Backend (PostgreSQL + Storage + Auth)
- **Claude AI (Anthropic)**: Análisis de documentos y chat
- **Combine**: Reactive programming
- **Async/Await**: Operaciones asíncronas modernas

## 📦 Requisitos

- **Xcode 15+** (recomendado Xcode 16)
- **macOS Sonoma 14.0+** como target mínimo
- **Swift 5.9+**
- Cuenta de **Supabase** configurada
- API Key de **Anthropic (Claude)**

## 🚀 Instalación y Setup

### 1. Abrir el Proyecto en Xcode

```bash
# Navega a la carpeta del proyecto
cd A2GHeadquarter-macOS

# Abre el proyecto en Xcode
open A2GHeadquarter.xcodeproj
```

**NOTA IMPORTANTE**: Como este proyecto fue generado en Linux, necesitarás crear el proyecto desde cero en Xcode. Sigue estos pasos:

#### Crear Proyecto en Xcode:

1. Abre Xcode
2. File → New → Project
3. Selecciona **macOS** → **App**
4. Configuración:
   - Product Name: `A2GHeadquarter`
   - Team: Tu equipo de desarrollo
   - Organization Identifier: `com.a2g`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Use Core Data: **No**
   - Include Tests: **Opcional**

5. Una vez creado el proyecto, **copia todos los archivos** de esta carpeta a tu nuevo proyecto de Xcode:
   - Arrastra la carpeta `Models/` al proyecto
   - Arrastra la carpeta `Views/` al proyecto
   - Arrastra la carpeta `ViewModels/` al proyecto
   - Arrastra la carpeta `Services/` al proyecto
   - Arrastra la carpeta `Components/` al proyecto
   - Reemplaza `A2GHeadquarterApp.swift` con el archivo proporcionado

### 2. Configurar Variables de Entorno

Hay dos formas de configurar las credenciales:

#### Opción A: Settings en la App (Recomendado)
1. Ejecuta la app
2. Ve a Settings (⌘,)
3. Ingresa tus credenciales:
   - Supabase URL
   - Supabase API Key
   - Anthropic API Key

#### Opción B: Variables de Entorno en Xcode
1. En Xcode, ve a **Product** → **Scheme** → **Edit Scheme**
2. Selecciona **Run** en la barra lateral
3. Ve a la pestaña **Arguments**
4. En **Environment Variables**, añade:

```
SUPABASE_URL = tu_supabase_url
SUPABASE_KEY = tu_supabase_anon_key
ANTHROPIC_API_KEY = tu_anthropic_api_key
```

### 3. Configurar Signing & Capabilities

1. Selecciona el proyecto en el navegador de Xcode
2. Ve a **Signing & Capabilities**
3. Selecciona tu **Team**
4. Xcode configurará automáticamente el Bundle Identifier

### 4. Build y Run

1. Selecciona el target "My Mac" en el selector de dispositivos
2. Presiona **⌘R** o haz click en el botón Play
3. La app se compilará y ejecutará

## 📁 Estructura del Proyecto

```
A2GHeadquarter/
├── A2GHeadquarterApp.swift          # Entry point de la app
├── Info.plist                       # Configuración de la app
├── Assets.xcassets/                 # Assets e iconos
├── Views/
│   ├── LoginView.swift              # Pantalla de login
│   ├── DashboardView.swift          # Dashboard principal
│   ├── FinancesView.swift           # Vista de finanzas
│   ├── CRMView.swift                # Vista de CRM
│   ├── DocumentsView.swift          # Gestión de documentos
│   └── SettingsView.swift           # Configuración
├── Models/
│   ├── Company.swift                # Modelo de empresas
│   ├── Transaction.swift            # Modelo de transacciones
│   ├── KPI.swift                    # Modelo de KPIs
│   └── Document.swift               # Modelo de documentos
├── Services/
│   ├── AuthService.swift            # Autenticación con Supabase
│   ├── SupabaseService.swift        # Cliente de Supabase
│   └── ClaudeService.swift          # Cliente de Claude AI
├── ViewModels/
│   └── DashboardViewModel.swift     # ViewModel del dashboard
└── Components/
    └── KPICard.swift                # Componente reutilizable de KPI
```

## 🎨 Características de Diseño

- **Tema Dark Mode**: Diseño premium dark por defecto
- **Glassmorphism**: Efectos visuales modernos
- **Animaciones Fluidas**: Transiciones suaves
- **Layout Adaptativo**: Responsive para diferentes tamaños de ventana
- **SF Symbols**: Iconos nativos de Apple

## 🔐 Seguridad

- Las credenciales se almacenan en **UserDefaults** (considerar Keychain para producción)
- Tokens de autenticación gestionados automáticamente
- Conexiones HTTPS con Supabase y Anthropic
- Row Level Security en Supabase

## 🐛 Troubleshooting

### Error: "No such module"
- Asegúrate de que todos los archivos están añadidos al target
- Product → Clean Build Folder (⇧⌘K)
- Vuelve a compilar

### Error de autenticación
- Verifica que las credenciales de Supabase estén correctas
- Verifica que las URLs no tengan espacios o caracteres extras
- Comprueba en la consola de Xcode los mensajes de error detallados

### La app no compila
- Verifica que estás usando Xcode 15+ y macOS 14+
- Limpia y vuelve a compilar
- Verifica que todos los archivos están en el target

## 📊 Uso

### 1. Login
- Ingresa con las credenciales de tu cuenta Supabase
- Las credenciales se guardan localmente

### 2. Dashboard
- Selecciona una empresa o "Todas"
- Visualiza KPIs en tiempo real
- Ve transacciones recientes

### 3. Finanzas
- Navega por tus cuentas en la barra lateral
- Filtra transacciones
- Exporta reportes (próximamente)

### 4. Documentos
- Arrastra documentos (PDF, Excel, CSV, imágenes)
- La IA los procesa automáticamente
- Consulta los KPIs extraídos

## 🚧 Roadmap

### Fase 1 - MVP (Actual)
- ✅ Login y autenticación
- ✅ Dashboard con KPIs
- ✅ Vista de finanzas y transacciones
- ✅ Upload de documentos
- ✅ Integración con Claude AI

### Fase 2 - Funcionalidades Avanzadas
- [ ] Chat con IA integrado
- [ ] Gráficos interactivos (Charts)
- [ ] CRM completo
- [ ] Notificaciones push
- [ ] Sincronización offline

### Fase 3 - Optimizaciones
- [ ] Migrar credenciales a Keychain
- [ ] Caché de datos
- [ ] Testing unitario y de UI
- [ ] Localización (EN/ES)

## 🔗 Integración con Web

Esta app comparte el mismo backend que la versión web (Next.js):

- **Misma base de datos** Supabase
- **Mismos modelos** de datos
- **Misma API** de Claude
- **Sincronización automática** entre web y desktop

## 📝 Notas de Desarrollo

### Diferencias con la Versión Web

1. **UI Nativa**: SwiftUI vs React/Next.js
2. **Performance**: App nativa más rápida
3. **Integración macOS**: Mejor integración con el sistema
4. **Offline**: Soporte offline nativo (próximamente)

### Consideraciones

- Los servicios (Supabase, Claude) usan URLSession nativo
- No se requieren paquetes externos (todo nativo)
- El código es 100% Swift
- Compatible con todas las Macs (Intel y Apple Silicon)

## 🤝 Contribuir

Este proyecto forma parte del ecosistema A2G Command Center. Para contribuir:

1. Crea una rama feature
2. Haz tus cambios
3. Asegúrate de que compila sin errores
4. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial. © A2G 2024

## 🆘 Soporte

Para soporte o preguntas:
- Email: [tu-email@a2g.com]
- Issues: Repositorio interno de A2G

---

**Desarrollado con ❤️ por A2G usando SwiftUI y Claude AI**
