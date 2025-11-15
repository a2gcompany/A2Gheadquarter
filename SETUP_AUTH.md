# Setup de Autenticación

## 1. Crear usuario en Supabase

Ve a tu Supabase Dashboard > Authentication > Users y crea un usuario manualmente:
- Email: tu_email@ejemplo.com
- Password: tu_password_seguro

O ejecuta este SQL en el SQL Editor:

```sql
-- Crear usuario de autenticación
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@a2g.company',
  crypt('TuPasswordSeguro123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  '',
  ''
);

-- Crear perfil de usuario
INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  id,
  'admin@a2g.company',
  'Admin A2G',
  'admin'
FROM auth.users
WHERE email = 'admin@a2g.company';

-- Dar permisos a todas las compañías
INSERT INTO user_company_permissions (user_id, company_id, permission_level)
SELECT 
  u.id,
  c.id,
  'admin'
FROM auth.users u
CROSS JOIN companies c
WHERE u.email = 'admin@a2g.company';
```

## 2. Deploy a Vercel

### Opción A: Desde la terminal

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy
cd ~/Desktop/A2Gheadquarter
vercel
```

### Opción B: Desde GitHub

1. Haz push del código a GitHub:
```bash
cd ~/Desktop/A2Gheadquarter
git init
git add .
git commit -m "Initial commit - A2G Command Center"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/a2g-command-center.git
git push -u origin main
```

2. Ve a [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import el repositorio de GitHub
5. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL=https://a2g.company/headquarters`

6. Deploy!

## 3. Configurar dominio custom en Vercel

1. En Vercel > Project Settings > Domains
2. Agrega: `a2g.company`
3. En tu DNS provider, agrega un CNAME record:
   - Name: `headquarters` o `@` (para subdominio)
   - Value: `cname.vercel-dns.com`

## 4. Configurar subpath /headquarters

Vercel ya está configurado con `vercel.json` para manejar `/headquarters/*`

Tu app estará disponible en:
- `https://a2g.company/headquarters/login`
- `https://a2g.company/headquarters/dashboard`

