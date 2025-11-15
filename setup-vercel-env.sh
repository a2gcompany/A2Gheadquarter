#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CONFIGURANDO VARIABLES DE ENTORNO EN VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extraer valores de .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2)
ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2)
SERVICE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2)
ANTHROPIC_KEY=$(grep "ANTHROPIC_API_KEY=" .env.local | cut -d'=' -f2)

echo "✓ Variables extraídas de .env.local"
echo ""

# Añadir variables a Vercel
echo "Añadiendo NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo ""
echo "Añadiendo NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo ""
echo "Añadiendo SUPABASE_SERVICE_ROLE_KEY..."
echo "$SERVICE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo ""
echo "Añadiendo ANTHROPIC_API_KEY..."
echo "$ANTHROPIC_KEY" | npx vercel env add ANTHROPIC_API_KEY production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VARIABLES CONFIGURADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ahora ejecuta: npx vercel --prod"
