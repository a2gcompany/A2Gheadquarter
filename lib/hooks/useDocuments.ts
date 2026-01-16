"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Document } from "@/lib/types/database"

export function useDocuments(companyId: string) {
  const supabase = useMemo(() => createClient(), [])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)

      // Si es "all", obtener de todas las empresas
      let query = supabase.from("documents").select("*").order("created_at", { ascending: false })

      if (companyId !== "all") {
        // Obtener el UUID de la empresa
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("slug", companyId)
          .single()

        if (company) {
          query = query.eq("company_id", company.id)
        }
      }

      const { data, error } = await query

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading documents")
    } finally {
      setLoading(false)
    }
  }, [companyId, supabase])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath])

      if (storageError) throw storageError

      // Eliminar registro de base de datos
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId)

      if (dbError) throw dbError

      // Actualizar estado local
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error deleting document"
      }
    }
  }

  return { documents, loading, error, deleteDocument, refetch: fetchDocuments }
}
