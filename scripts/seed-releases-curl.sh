#!/bin/bash
# Script para importar releases usando curl directamente

SUPABASE_URL="${SUPABASE_URL:-https://mrvhvbrcxlxywtwtxzhx.supabase.co}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY env var}"

echo "🎵 Importando releases desde spreadsheet..."

# 1. Buscar proyecto Prophecy
echo "1. Buscando proyecto Prophecy..."
PROPHECY=$(curl -s "${SUPABASE_URL}/rest/v1/projects?name=eq.Prophecy&select=id" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

echo "Resultado: $PROPHECY"

if [ "$PROPHECY" = "[]" ]; then
  echo "   Creando proyecto Prophecy..."
  PROPHECY=$(curl -s "${SUPABASE_URL}/rest/v1/projects" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d '{"name": "Prophecy", "type": "artist"}')
  echo "   Creado: $PROPHECY"
fi

# Extraer ID
PROJECT_ID=$(echo "$PROPHECY" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
echo "   Project ID: $PROJECT_ID"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: No se pudo obtener el ID del proyecto"
  exit 1
fi

# 2. Eliminar releases existentes de Prophecy
echo "2. Limpiando releases existentes..."
curl -s -X DELETE "${SUPABASE_URL}/rest/v1/releases?project_id=eq.${PROJECT_ID}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# 3. Insertar releases
echo "3. Insertando releases..."

# Again and Again
curl -s "${SUPABASE_URL}/rest/v1/releases" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"track_name\": \"Again and Again\",
    \"status\": \"shopping\",
    \"labels_contacted\": [
      {\"label\": \"KREAM\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | TBS\"},
      {\"label\": \"Morten\", \"status\": \"waiting\", \"date\": \"2025-12-16\", \"notes\": \"Sender: Sergi | Quiere subirle 2 bpm mas para ir a unos 132 o asi\"}
    ],
    \"notes\": \"Importado desde spreadsheet 2026-02-02\"
  }"
echo "   ✅ Again and Again"

# ALIVE
curl -s "${SUPABASE_URL}/rest/v1/releases" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"track_name\": \"ALIVE\",
    \"status\": \"shopping\",
    \"labels_contacted\": [
      {\"label\": \"EA Sports\", \"status\": \"pending\", \"date\": \"2026-01-15\", \"notes\": \"Sender: m.bravo\"}
    ],
    \"notes\": \"Importado desde spreadsheet 2026-02-02\"
  }"
echo "   ✅ ALIVE"

# IWYN
curl -s "${SUPABASE_URL}/rest/v1/releases" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"track_name\": \"IWYN\",
    \"status\": \"shopping\",
    \"labels_contacted\": [
      {\"label\": \"Spinnin Records (Deep/Aftr:hrs)\", \"status\": \"rejected\", \"date\": \"2026-02-01\", \"notes\": \"Sender: Mike | Email: Marco.Cobussen@spinninrecords.nl\"},
      {\"label\": \"Armada\", \"status\": \"rejected\", \"date\": \"2026-02-02\", \"notes\": \"Sender: m.bravo\"},
      {\"label\": \"Insomniac\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: m.bravo\"},
      {\"label\": \"REALM\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | SENT\"},
      {\"label\": \"DIYNAMIC\", \"status\": \"rejected\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike\"},
      {\"label\": \"VINTAGE CULTURE\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | SENT\"},
      {\"label\": \"HIGHER GROUND\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | TBS\"},
      {\"label\": \"CR2\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | SENT\"},
      {\"label\": \"Camelphat\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | TBS\"}
    ],
    \"notes\": \"Importado desde spreadsheet 2026-02-02\"
  }"
echo "   ✅ IWYN"

# Less hate
curl -s "${SUPABASE_URL}/rest/v1/releases" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"track_name\": \"Less hate\",
    \"status\": \"shopping\",
    \"labels_contacted\": [
      {\"label\": \"Guesstimate\", \"status\": \"waiting\", \"date\": \"2025-12-16\", \"notes\": \"Sender: m.bravo | Need changes. Sergi on it\"},
      {\"label\": \"Armada\", \"status\": \"rejected\", \"date\": \"2025-12-16\", \"notes\": \"Sender: m.bravo | Need changes. Sergi on it\"}
    ],
    \"notes\": \"Importado desde spreadsheet 2026-02-02\"
  }"
echo "   ✅ Less hate"

# Nana
curl -s "${SUPABASE_URL}/rest/v1/releases" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"track_name\": \"Nana\",
    \"status\": \"shopping\",
    \"labels_contacted\": [
      {\"label\": \"Tomorrowland\", \"status\": \"pending\", \"date\": \"2026-02-01\", \"notes\": \"Sender: Mike | Demo sent 1/30/2026 - To: Manu | Email: manu.vanaalst@tomorrowland.com\"},
      {\"label\": \"Morten\", \"status\": \"rejected\", \"date\": \"2026-01-01\", \"notes\": \"Sender: Mike\"},
      {\"label\": \"Artbat\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike\"},
      {\"label\": \"Now (then)\", \"status\": \"pending\", \"date\": \"2026-02-02\", \"notes\": \"Sender: Mike | SENT\"},
      {\"label\": \"Kevin de vries\", \"status\": \"rejected\", \"date\": \"2026-01-01\", \"notes\": \"Sender: Mike\"}
    ],
    \"notes\": \"Importado desde spreadsheet 2026-02-02\"
  }"
echo "   ✅ Nana"

echo ""
echo "🎉 Importación completada!"
echo "   5 releases con 19 contactos a sellos"
