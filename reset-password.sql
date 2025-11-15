-- Primero verificamos si el usuario existe
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'a.arevalo@a2g.company';

-- Si existe, podemos ver sus detalles
-- Para resetear la contraseña en Supabase, ve a:
-- Authentication > Users > busca tu email > Reset Password
