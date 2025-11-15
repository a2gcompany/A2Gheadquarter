-- Resetear la contraseña del usuario a.arevalo@a2g.company
-- Cambia 'NuevaContraseña123' por la contraseña que quieras usar

UPDATE auth.users 
SET 
  encrypted_password = crypt('A2G2025!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'a.arevalo@a2g.company';

-- Verificar que el usuario existe y está actualizado
SELECT 
  id, 
  email, 
  created_at,
  updated_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'a.arevalo@a2g.company';
