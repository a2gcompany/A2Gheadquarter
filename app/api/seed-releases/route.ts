import { NextResponse } from "next/server"
import { db, releases, projects } from "@/src/db"
import { eq } from "drizzle-orm"

// Datos del spreadsheet de Google Sheets - Febrero 2026
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

type LabelStatus = "pending" | "waiting" | "rejected" | "accepted"

function mapStatus(status: string): LabelStatus {
  const mapping: Record<string, LabelStatus> = {
    'SENT': 'pending',
    'PENDING': 'pending',
    'TBS': 'pending',
    'INTERESTED': 'waiting',
    'REJECTED': 'rejected',
    'ACCEPTED': 'accepted'
  }
  return mapping[status] || 'pending'
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [month, day, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return new Date().toISOString().split('T')[0]
}

type LabelContact = {
  label: string
  status: LabelStatus
  date: string
  notes?: string
}

function determineReleaseStatus(labels: LabelContact[]): "draft" | "shopping" | "accepted" | "released" {
  const statuses = labels.map(l => l.status)
  if (statuses.includes('accepted')) return 'accepted'
  if (statuses.some(s => s === 'waiting' || s === 'pending')) return 'shopping'
  if (statuses.every(s => s === 'rejected')) return 'draft'
  return 'shopping'
}

export async function GET() {
  try {
    const results: string[] = []

    // 1. Get or create Prophecy project
    results.push("1. Buscando/creando proyecto Prophecy...")
    let prophecyProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.name, "Prophecy"))

    let prophecyProject = prophecyProjects[0]

    if (!prophecyProject) {
      const newProject = await db
        .insert(projects)
        .values({ name: "Prophecy", type: "artist" })
        .returning()
      prophecyProject = newProject[0]
      results.push("   ✅ Proyecto Prophecy creado")
    } else {
      results.push("   ✅ Proyecto Prophecy encontrado")
    }

    // 2. Group data by track
    results.push("2. Agrupando datos por track...")
    const trackGroups: Record<string, typeof spreadsheetData> = {}
    for (const row of spreadsheetData) {
      if (!trackGroups[row.track]) {
        trackGroups[row.track] = []
      }
      trackGroups[row.track].push(row)
    }

    const tracks = Object.keys(trackGroups)
    results.push(`   Encontrados ${tracks.length} tracks: ${tracks.join(', ')}`)

    // 3. Delete existing releases for Prophecy
    results.push("3. Limpiando releases existentes de Prophecy...")
    await db.delete(releases).where(eq(releases.projectId, prophecyProject.id))
    results.push("   ✅ Releases anteriores eliminados")

    // 4. Create releases with labels
    results.push("4. Creando releases...")
    for (const [trackName, rows] of Object.entries(trackGroups)) {
      const labelsContacted: LabelContact[] = rows.map(row => ({
        label: row.label,
        status: mapStatus(row.status),
        date: parseDate(row.dateSent),
        notes: [row.sender ? `Sender: ${row.sender}` : '', row.notes, row.email ? `Email: ${row.email}` : ''].filter(Boolean).join(' | ') || undefined
      }))

      const releaseStatus = determineReleaseStatus(labelsContacted)

      await db.insert(releases).values({
        projectId: prophecyProject.id,
        trackName: trackName,
        labelsContacted: labelsContacted,
        status: releaseStatus,
        notes: `Importado desde spreadsheet ${new Date().toISOString().split('T')[0]}`
      })

      results.push(`   ✅ "${trackName}" - ${labelsContacted.length} sellos contactados (${releaseStatus})`)
    }

    results.push("")
    results.push("🎉 Importación completada!")
    results.push(`   Total: ${tracks.length} releases con ${spreadsheetData.length} contactos a sellos`)

    return NextResponse.json({
      success: true,
      message: "Releases importados correctamente",
      details: results
    })
  } catch (error) {
    console.error("Error seeding releases:", error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
