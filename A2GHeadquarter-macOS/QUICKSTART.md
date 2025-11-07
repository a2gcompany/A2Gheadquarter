# Quick Start Guide - A2G HQ macOS

## 🚀 Setup Rápido (5 minutos)

### Paso 1: Crear el Proyecto en Xcode

Como este código fue generado en Linux, necesitas crear el proyecto de Xcode manualmente:

1. **Abre Xcode**
2. **File → New → Project**
3. Selecciona **macOS → App**
4. Configuración:
   ```
   Product Name: A2GHeadquarter
   Team: [Tu equipo]
   Organization Identifier: com.a2g
   Interface: SwiftUI
   Language: Swift
   ```

### Paso 2: Copiar los Archivos

Arrastra estas carpetas desde Finder al proyecto de Xcode:

- ✅ `Models/`
- ✅ `Views/`
- ✅ `ViewModels/`
- ✅ `Services/`
- ✅ `Components/`

Reemplaza el archivo `A2GHeadquarterApp.swift` generado por Xcode con el nuestro.

### Paso 3: Configurar Assets

1. Abre `Assets.xcassets` en Xcode
2. Copia el contenido de nuestra carpeta `Assets.xcassets/`
3. O deja los assets por defecto (funcionará igual)

### Paso 4: Variables de Entorno

**Opción A - En la App:**
1. Ejecuta la app (⌘R)
2. Ve a Settings (⌘,)
3. Ingresa credenciales

**Opción B - En Xcode:**
1. Product → Scheme → Edit Scheme
2. Run → Arguments → Environment Variables
3. Añade:
   ```
   SUPABASE_URL = https://tu-proyecto.supabase.co
   SUPABASE_KEY = tu_anon_key
   ANTHROPIC_API_KEY = sk-ant-...
   ```

### Paso 5: Build & Run

Presiona **⌘R** y listo!

## 📋 Checklist

- [ ] Proyecto creado en Xcode
- [ ] Archivos copiados al proyecto
- [ ] Team configurado en Signing
- [ ] Variables de entorno configuradas
- [ ] App compilando y ejecutando

## 🎯 Primeros Pasos en la App

1. **Login**: Usa credenciales de Supabase
2. **Dashboard**: Selecciona una empresa
3. **Documentos**: Arrastra un PDF para probar la IA
4. **Finanzas**: Explora transacciones

## ⚠️ Troubleshooting

**No compila?**
- Limpia: ⇧⌘K
- Verifica que todos los archivos están en el target

**Error de autenticación?**
- Revisa credenciales de Supabase
- Verifica que la URL es correcta

**Variables de entorno no funcionan?**
- Usa Settings en la app en su lugar

## 🔗 Recursos

- README completo: `README.md`
- Código web: `../` (mismo repositorio)
- Supabase: Comparte el backend con la web

---

¿Problemas? Revisa el `README.md` completo o contacta al equipo.
