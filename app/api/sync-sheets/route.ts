import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getGoogleSheetsConfig } from "@/src/actions/integrations"
import { createImportRecord, completeImportRecord } from "@/src/actions/import-history"

// Auth token for cron jobs
const CRON_SECRET = process.env.CRON_SECRET

function csvToRows(csv: string): Record<string, string>[] {
  const lines = csv.split("\n")
  if (lines.length < 2) return []

  // Parse header - handle quoted fields
  const headers = parseCSVLine(lines[0])

  const rows: Record<string, string>[] = []
  let i = 1
  while (i < lines.length) {
    let line = lines[i]
    // Handle multiline quoted fields
    while (countQuotes(line) % 2 !== 0 && i + 1 < lines.length) {
      i++
      line += "\n" + lines[i]
    }
    if (line.trim()) {
      const values = parseCSVLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h.trim()] = (values[idx] || "").trim()
      })
      rows.push(row)
    }
    i++
  }
  return rows
}

function countQuotes(s: string): number {
  return (s.match(/"/g) || []).length
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseSheetDate(dateStr: string): string | null {
  if (!dateStr) return null
  // Handle DD/MM/YY or D/M/YY format
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const [dayOrMonth, monthOrDay, year] = parts
    const d = parseInt(dayOrMonth)
    const m = parseInt(monthOrDay)
    let y = parseInt(year)
    if (y < 100) y += 2000

    // Sheet 1 uses D/M/YY, Sheet 2 uses M/D/YYYY
    // Detect by checking if month > 12
    if (d > 12) {
      // d is day, m is month (D/M/YY format)
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    } else if (m > 12) {
      // m is day, d is month (M/D/YYYY format)
      return `${y}-${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}`
    }
    // Ambiguous - default to D/M/Y for sheet 1
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  }
  return null
}

function parsePitchingDate(dateStr: string): string | null {
  if (!dateStr) return null
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const [m, d, y] = parts // M/D/YYYY format
    let year = parseInt(y)
    if (year < 100) year += 2000
    return `${year}-${String(parseInt(m)).padStart(2, "0")}-${String(parseInt(d)).padStart(2, "0")}`
  }
  return null
}

type LabelContact = {
  label: string
  status: "pending" | "waiting" | "rejected" | "accepted"
  date?: string
  sender?: string
  email?: string
  response?: string
  notes?: string
}

function mapPitchingStatus(status: string): LabelContact["status"] {
  const s = status.toUpperCase().trim()
  if (s === "ACCEPTED") return "accepted"
  if (s === "REJECTED") return "rejected"
  if (s === "INTERESTED") return "waiting"
  return "pending" // TBS, PENDING, SENT, etc.
}

function mapReleaseStatus(status: string): "draft" | "shopping" | "accepted" | "released" {
  const s = status.toLowerCase().trim()
  if (s === "released") return "released"
  if (s === "confirmed") return "accepted"
  if (s === "tbc") return "draft"
  return "shopping"
}

function normalizeArtistName(name: string): string {
  // Normalize for matching: "Babel" -> "BABEL", etc.
  const normalized = name.trim()
  if (normalized.toLowerCase() === "babel") return "BABEL"
  return normalized
}

async function fetchSheet(sheetId: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch sheet ${sheetId}: ${res.status}`)
  return res.text()
}

export async function GET(request: Request) {
  // Verify auth for cron calls
  const authHeader = request.headers.get("authorization")
  const url = new URL(request.url)
  const isManual = url.searchParams.get("manual") === "true"

  if (!isManual && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const log: string[] = []
    const now = new Date().toISOString()
    log.push(`Sync started at ${now}`)

    // Load sheet IDs from database
    const sheetsConfig = await getGoogleSheetsConfig()
    if (!sheetsConfig.releasesSheetId || !sheetsConfig.pitchingsSheetId) {
      return NextResponse.json(
        { success: false, error: "Google Sheets integration not configured. Add sheet IDs in the Ingestion center." },
        { status: 404 }
      )
    }

    const importRecord = await createImportRecord({
      integration_id: sheetsConfig.integrationId,
      source_type: "google_sheets",
      source_name: "Google Sheets - Releases & Pitchings",
      triggered_by: isManual ? "manual" : "cron",
    })

    // 1. Fetch both sheets
    log.push("Fetching Google Sheets...")
    const [releasesCSV, pitchingsCSV] = await Promise.all([
      fetchSheet(sheetsConfig.releasesSheetId),
      fetchSheet(sheetsConfig.pitchingsSheetId),
    ])

    const releasesRows = csvToRows(releasesCSV)
    const pitchingsRows = csvToRows(pitchingsCSV)
    log.push(`  Releases sheet: ${releasesRows.length} rows`)
    log.push(`  Pitchings sheet: ${pitchingsRows.length} rows`)

    // 2. Get project mapping (artist name -> project ID)
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id, name")
      .eq("type", "artist")

    if (!projects) throw new Error("Failed to fetch projects")

    const projectMap: Record<string, string> = {}
    for (const p of projects) {
      projectMap[p.name.toLowerCase()] = p.id
    }
    log.push(`  Projects loaded: ${projects.map((p) => p.name).join(", ")}`)

    // 3. Group pitchings by artist+track
    const pitchingsByTrack: Record<string, LabelContact[]> = {}
    for (const row of pitchingsRows) {
      const artist = normalizeArtistName(row["Artist"] || "")
      const track = (row["Track"] || "").trim()
      const key = `${artist.toLowerCase()}::${track.toLowerCase()}`

      if (!pitchingsByTrack[key]) pitchingsByTrack[key] = []

      const contact: LabelContact = {
        label: (row["Contact/Label"] || "").trim(),
        status: mapPitchingStatus(row["Status"] || ""),
        date: parsePitchingDate(row["Date Sent"] || "") || undefined,
        sender: (row["Sender"] || "").trim() || undefined,
        email: (row["Contact email"] || "").trim() || undefined,
        response: (row["Response"] || "").trim() || undefined,
        notes: (row["Notes"] || "").trim() || undefined,
      }

      // Clean undefined fields
      Object.keys(contact).forEach((k) => {
        if (contact[k as keyof LabelContact] === undefined) {
          delete contact[k as keyof LabelContact]
        }
      })

      pitchingsByTrack[key].push(contact)
    }

    // 4. Process releases from Sheet 1
    let synced = 0
    let created = 0
    let errors = 0

    for (const row of releasesRows) {
      const artist = normalizeArtistName(row["Artist"] || "")
      const track = (row["Track"] || "").trim()
      const projectId = projectMap[artist.toLowerCase()]

      if (!projectId) {
        log.push(`  SKIP: Artist "${artist}" not found in projects`)
        errors++
        continue
      }

      const releaseDate = parseSheetDate(row["Date"] || "")
      const status = mapReleaseStatus(row["Status"] || "")
      const label = (row["Label"] || "").trim()
      const collab = (row["Collab"] || "").trim()
      const presaves = parseInt(row["Presaves"] || "0") || 0
      const spotifyPlays = parseInt(row["Spotify Plays"] || "0") || 0
      const link = (row["Link"] || "").trim()

      // Build notes with extra data
      const noteParts: string[] = []
      if (collab && collab !== "Single") noteParts.push(`Collab: ${collab}`)
      if (label) noteParts.push(`Label: ${label}`)
      if (presaves > 0) noteParts.push(`Presaves: ${presaves}`)
      if (spotifyPlays > 0) noteParts.push(`Spotify: ${spotifyPlays.toLocaleString()} plays`)
      if (link) noteParts.push(`Link: ${link}`)
      const notes = noteParts.join(" | ") || null

      // Get pitching data for this track
      const key = `${artist.toLowerCase()}::${track.toLowerCase()}`
      const labelsContacted = pitchingsByTrack[key] || []

      // If no pitching data but we have a label from Sheet 1, add it
      if (labelsContacted.length === 0 && label && label !== "TBC") {
        labelsContacted.push({
          label,
          status: status === "released" ? "accepted" : status === "accepted" ? "accepted" : "pending",
        })
      }

      // Check if release already exists
      const { data: existing } = await supabaseAdmin
        .from("releases")
        .select("id")
        .eq("project_id", projectId)
        .eq("track_name", track)
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabaseAdmin
          .from("releases")
          .update({
            status,
            release_date: releaseDate,
            notes,
            labels_contacted: labelsContacted,
          })
          .eq("id", existing[0].id)

        if (error) {
          log.push(`  ERROR updating "${artist} - ${track}": ${error.message}`)
          errors++
        } else {
          log.push(`  UPDATED: ${artist} - ${track} (${status}, ${labelsContacted.length} labels)`)
          synced++
        }
      } else {
        // Create new
        const { error } = await supabaseAdmin.from("releases").insert({
          project_id: projectId,
          track_name: track,
          status,
          release_date: releaseDate,
          notes,
          labels_contacted: labelsContacted,
        })

        if (error) {
          log.push(`  ERROR creating "${artist} - ${track}": ${error.message}`)
          errors++
        } else {
          log.push(`  CREATED: ${artist} - ${track} (${status}, ${labelsContacted.length} labels)`)
          created++
        }
      }
    }

    // 5. Process pitchings that don't have a matching release in Sheet 1
    // (tracks only in pitchings sheet, not in releases sheet)
    const releaseTracks = new Set(
      releasesRows.map((r) => {
        const a = normalizeArtistName(r["Artist"] || "").toLowerCase()
        const t = (r["Track"] || "").trim().toLowerCase()
        return `${a}::${t}`
      })
    )

    for (const [key, labels] of Object.entries(pitchingsByTrack)) {
      if (releaseTracks.has(key)) continue // Already processed

      const [artistLower, trackLower] = key.split("::")
      const projectId = projectMap[artistLower]
      if (!projectId) continue

      // Find actual track name from pitching data
      const matchingRow = pitchingsRows.find(
        (r) =>
          normalizeArtistName(r["Artist"] || "").toLowerCase() === artistLower &&
          (r["Track"] || "").trim().toLowerCase() === trackLower
      )
      const trackName = matchingRow ? (matchingRow["Track"] || "").trim() : trackLower
      const artistName = matchingRow ? normalizeArtistName(matchingRow["Artist"] || "") : artistLower

      // Determine status from labels
      const hasAccepted = labels.some((l) => l.status === "accepted")
      const hasWaiting = labels.some((l) => l.status === "waiting")
      const hasPending = labels.some((l) => l.status === "pending")
      const allRejected = labels.every((l) => l.status === "rejected")

      let status: "draft" | "shopping" | "accepted" | "released" = "shopping"
      if (hasAccepted) status = "accepted"
      else if (allRejected) status = "draft"
      else if (hasWaiting || hasPending) status = "shopping"

      // Check if exists
      const { data: existing } = await supabaseAdmin
        .from("releases")
        .select("id")
        .eq("project_id", projectId)
        .eq("track_name", trackName)
        .limit(1)

      if (existing && existing.length > 0) {
        const { error } = await supabaseAdmin
          .from("releases")
          .update({ status, labels_contacted: labels })
          .eq("id", existing[0].id)

        if (error) {
          log.push(`  ERROR updating pitching "${artistName} - ${trackName}": ${error.message}`)
          errors++
        } else {
          log.push(`  UPDATED (pitching only): ${artistName} - ${trackName} (${status}, ${labels.length} labels)`)
          synced++
        }
      } else {
        const { error } = await supabaseAdmin.from("releases").insert({
          project_id: projectId,
          track_name: trackName,
          status,
          labels_contacted: labels,
          notes: "From pitchings sheet",
        })

        if (error) {
          log.push(`  ERROR creating pitching "${artistName} - ${trackName}": ${error.message}`)
          errors++
        } else {
          log.push(`  CREATED (pitching only): ${artistName} - ${trackName} (${status}, ${labels.length} labels)`)
          created++
        }
      }
    }

    const summary = `Sync complete: ${synced} updated, ${created} created, ${errors} errors`
    log.push("")
    log.push(summary)

    if (importRecord) {
      await completeImportRecord(importRecord.id, {
        rows_imported: synced + created,
        rows_skipped: 0,
        rows_errored: errors,
      })
    }

    return NextResponse.json({
      success: true,
      summary,
      synced,
      created,
      errors,
      log,
      timestamp: now,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
