import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"
import { analyzeDocument } from "@/lib/services/claude-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const companyId = formData.get("companyId") as string

    if (!file || !companyId) {
      return NextResponse.json(
        { error: "File and companyId are required" },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${companyId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Create document record
    const { data: document, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        company_id: companyId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileExt || "unknown",
        mime_type: file.type,
        processing_status: "pending",
      })
      .select()
      .single()

    if (docError) {
      console.error("Document creation error:", docError)
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 }
      )
    }

    // Process document asynchronously
    processDocumentAsync(document.id, filePath, file)

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function processDocumentAsync(
  documentId: string,
  filePath: string,
  file: File
) {
  try {
    // Update status to processing
    await supabaseAdmin
      .from("documents")
      .update({ processing_status: "processing" })
      .eq("id", documentId)

    // Read file content
    const fileContent = await file.text()

    // Analyze with Claude
    const analysis = await analyzeDocument(
      fileContent,
      file.name,
      file.type
    )

    // Update document with extracted data
    await supabaseAdmin
      .from("documents")
      .update({
        processing_status: "completed",
        ai_extracted_data: analysis.extractedData,
        document_type: analysis.documentType,
      })
      .eq("id", documentId)

    // Insert extracted KPIs
    if (analysis.kpis && analysis.kpis.length > 0) {
      const kpisToInsert = analysis.kpis.map((kpi) => ({
        company_id: file.name.split("/")[0], // Extract from path
        document_id: documentId,
        kpi_type: kpi.type,
        kpi_name: kpi.name,
        value: kpi.value,
        currency: kpi.currency || "USD",
        period_start: kpi.periodStart,
        period_end: kpi.periodEnd,
        source: "ai_extraction",
        confidence: analysis.confidence,
      }))

      await supabaseAdmin.from("kpis_extracted").insert(kpisToInsert)
    }

    console.log(`Document ${documentId} processed successfully`)
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error)

    // Update document with error
    await supabaseAdmin
      .from("documents")
      .update({
        processing_status: "failed",
        processing_error: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", documentId)
  }
}
