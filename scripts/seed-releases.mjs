// Script para importar releases desde el spreadsheet de Google Sheets
// Ejecutar: node scripts/seed-releases.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mrvhvbrcxlxywtwtxzhx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Datos del spreadsheet - Febrero 2026
const spreadsheetData = [
  { artist: "Prophecy", track: "Again and Again", label: "KREAM", email: "", sender: "Mike", dateSent: "", status: "TBS", notes: "" },
  { artist: "Prophecy", track: "Again and Again", label: "Morten", email: "", sender: "Sergi", dateSent: "12/16/2025", status: "INTERESTED", notes: "Quiere subirle 2 bpm mas para ir a unos 132 o asi" },
  { artist: "Prophecy", track: "ALIVE", label: "EA Sports", email: "", sender: "m.bravo", dateSent: "1/15/2026", status: "PENDING", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "Spinnin' Records (Deep/Aftr:hrs)", email: "Marco.Cobussen@spinninrecords.nl", sender: "Mike", dateSent: "2/1/2026", status: "REJECTED", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "Armada", email: "", sender: "m.bravo", dateSent: "", status: "REJECTED", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "Insomniac", email: "", sender: "m.bravo", dateSent: "", status: "PENDING", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "REALM", email: "", sender: "Mike", dateSent: "", status: "SENT", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "DIYNAMIC", email: "", sender: "Mike", dateSent: "", status: "REJECTED", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "VINTAGE CULTURE", email: "", sender: "Mike", dateSent: "", status: "SENT", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "HIGHER GROUND", email: "", sender: "Mike", dateSent: "", status: "TBS", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "CR2", email: "", sender: "Mike", dateSent: "", status: "SENT", notes: "" },
  { artist: "Prophecy", track: "IWYN", label: "Camelphat", email: "", sender: "Mike", dateSent: "", status: "TBS", notes: "" },
  { artist: "Prophecy", track: "Less hate", label: "Guesstimate", email: "", sender: "m.bravo", dateSent: "12/16/2025", status: "INTERESTED", notes: "Need changes. Sergi on it" },
  { artist: "Prophecy", track: "Less hate", label: "Armada", email: "", sender: "m.bravo", dateSent: "12/16/2025", status: "REJECTED", notes: "Need changes. Sergi on it" },
  { artist: "Prophecy", track: "Nana", label: "Tomorrowland", email: "manu.vanaalst@tomorrowland.com", sender: "Mike", dateSent: "2/1/2026", status: "SENT", notes: "Demo sent 1/30/2026 - To: Manu" },
  { artist: "Prophecy", track: "Nana", label: "Morten", email: "", sender: "Mike", dateSent: "1/1/2026", status: "REJECTED", notes: "" },
  { artist: "Prophecy", track: "Nana", label: "Artbat", email: "", sender: "Mike", dateSent: "", status: "PENDING", notes: "" },
  { artist: "Prophecy", track: "Nana", label: "Now (then)", email: "", sender: "Mike", dateSent: "", status: "SENT", notes: "" },
  { artist: "Prophecy", track: "Nana", label: "Kevin de vries", email: "", sender: "Mike", dateSent: "1/1/2026", status: "REJECTED", notes: "" },
]

// Map spreadsheet status to DB status
function mapStatus(status) {
  const mapping = {
    'SENT': 'pending',
    'PENDING': 'pending',
    'TBS': 'pending',
    'INTERESTED': 'waiting',
    'REJECTED': 'rejected',
    'ACCEPTED': 'accepted'
  }
  return mapping[status] || 'pending'
}

// Parse date from spreadsheet format (M/D/YYYY)
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [month, day, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return new Date().toISOString().split('T')[0]
}

// Determine release status based on all labels
function determineReleaseStatus(labels) {
  const statuses = labels.map(l => l.status)
  if (statuses.includes('accepted')) return 'accepted'
  if (statuses.some(s => s === 'waiting' || s === 'pending')) return 'shopping'
  if (statuses.every(s => s === 'rejected')) return 'draft'
  return 'shopping'
}

async function seedReleases() {
  console.log('🎵 Importando releases desde spreadsheet...\n')

  // 1. Get or create Prophecy project
  console.log('1. Buscando/creando proyecto Prophecy...')
  let { data: prophecyProject } = await supabase
    .from('projects')
    .select('*')
    .eq('name', 'Prophecy')
    .single()

  if (!prophecyProject) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: 'Prophecy', type: 'artist' })
      .select()
      .single()

    if (error) {
      console.error('Error creando proyecto:', error)
      return
    }
    prophecyProject = data
    console.log('   ✅ Proyecto Prophecy creado')
  } else {
    console.log('   ✅ Proyecto Prophecy encontrado')
  }

  // 2. Group data by track
  console.log('\n2. Agrupando datos por track...')
  const trackGroups = {}
  for (const row of spreadsheetData) {
    if (!trackGroups[row.track]) {
      trackGroups[row.track] = []
    }
    trackGroups[row.track].push(row)
  }

  const tracks = Object.keys(trackGroups)
  console.log(`   Encontrados ${tracks.length} tracks: ${tracks.join(', ')}`)

  // 3. Clear existing releases for Prophecy (optional - be careful)
  console.log('\n3. Limpiando releases existentes de Prophecy...')
  const { error: deleteError } = await supabase
    .from('releases')
    .delete()
    .eq('project_id', prophecyProject.id)

  if (deleteError) {
    console.error('   ⚠️ Error eliminando releases:', deleteError)
  } else {
    console.log('   ✅ Releases anteriores eliminados')
  }

  // 4. Create releases with labels
  console.log('\n4. Creando releases...')
  for (const [trackName, rows] of Object.entries(trackGroups)) {
    const labelsContacted = rows.map(row => ({
      label: row.label,
      status: mapStatus(row.status),
      date: parseDate(row.dateSent),
      notes: [row.sender ? `Sender: ${row.sender}` : '', row.notes, row.email ? `Email: ${row.email}` : ''].filter(Boolean).join(' | ') || undefined
    }))

    const releaseStatus = determineReleaseStatus(labelsContacted)

    const { data, error } = await supabase
      .from('releases')
      .insert({
        project_id: prophecyProject.id,
        track_name: trackName,
        labels_contacted: labelsContacted,
        status: releaseStatus,
        notes: `Importado desde spreadsheet ${new Date().toISOString().split('T')[0]}`
      })
      .select()
      .single()

    if (error) {
      console.error(`   ❌ Error creando "${trackName}":`, error)
    } else {
      console.log(`   ✅ "${trackName}" - ${labelsContacted.length} sellos contactados (${releaseStatus})`)
    }
  }

  console.log('\n🎉 Importación completada!')
  console.log(`   Total: ${tracks.length} releases con ${spreadsheetData.length} contactos a sellos`)
}

seedReleases().catch(console.error)
