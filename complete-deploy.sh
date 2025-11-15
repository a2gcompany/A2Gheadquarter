#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY COMPLETO A VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extraer valores
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2)
ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2)
SERVICE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2)
ANTHROPIC_KEY=$(grep "ANTHROPIC_API_KEY=" .env.local | cut -d'=' -f2)

echo "✓ Variables extraídas"
echo ""
echo "📦 Añadiendo variables de entorno a Vercel..."
echo ""

# Añadir cada variable
echo "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes || echo "✓ Ya existe"
echo "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes || echo "✓ Ya existe"
echo "$SERVICE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes || echo "✓ Ya existe"
echo "$ANTHROPIC_KEY" | npx vercel env add ANTHROPIC_API_KEY production --yes || echo "✓ Ya existe"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VARIABLES AÑADIDAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Haciendo deploy a producción..."
echo ""

npx vercel --prod --yes

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOY COMPLETO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tu app está en:"
echo "https://a2g-headquarters.vercel.app/headquarters/login"
echo ""
echo "Ahora configura tu dominio a2g.company en:"
echo "https://vercel.com/a2g-companys-projects/a2g-headquarters/settings/domains"
