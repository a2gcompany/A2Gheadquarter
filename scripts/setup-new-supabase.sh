#!/bin/bash
# Setup script for new Supabase project
# Usage: ./scripts/setup-new-supabase.sh

echo "🚀 A2G Headquarters - Supabase Setup"
echo "====================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
fi

echo "Please enter your new Supabase credentials:"
echo ""

read -p "Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Anon Key: " ANON_KEY
read -p "Service Role Key: " SERVICE_KEY

# Update .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_KEY}
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ""
echo "✅ .env.local updated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Supabase Dashboard > SQL Editor"
echo "2. Copy the contents of supabase/setup.sql"
echo "3. Paste and run it"
echo "4. Then run: npm run dev"
echo ""
echo "Or copy this file path to open in browser:"
echo "file://$(pwd)/supabase/setup.sql"
