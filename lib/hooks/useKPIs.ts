"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

interface KPI {
  id: string
  company_id: string
  kpi_type: string
  kpi_name: string
  value: number
  currency: string
  period_start: string | null
  period_end: string | null
  period_type: string | null
  created_at: string
}

interface KPISummary {
  liquidez: number
  revenue: number
  profit: number
  runway: number
  revenueByCompany: Array<{ company: string; revenue: number }>
  expensesByCategory: Array<{ category: string; amount: number }>
  liquidityData: Array<{ month: string; liquidez: number; objetivo: number }>
}

export function useKPIs(companyId: string) {
  const supabase = useMemo(() => createClient(), [])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [summary, setSummary] = useState<KPISummary>({
    liquidez: 0,
    revenue: 0,
    profit: 0,
    runway: 0,
    revenueByCompany: [],
    expensesByCategory: [],
    liquidityData: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )

      // Query base para KPIs
      let query = supabase
        .from("kpis_extracted")
        .select("*, companies(name, slug)")
        .order("created_at", { ascending: false })

      if (companyId !== "all") {
        // Obtener el UUID de la empresa
        const companyPromise = supabase
          .from("companies")
          .select("id")
          .eq("slug", companyId)
          .single()

        const { data: company, error: companyError } = await Promise.race([
          companyPromise,
          timeoutPromise
        ]) as any

        if (companyError) {
          if (companyError.code === 'PGRST116' || companyError.message?.includes('does not exist')) {
            console.warn('Database tables not yet created.')
            setError('⚠️ Database not initialized. Run migration: see MIGRATION_INSTRUCTIONS.md')
            setLoading(false)
            return
          }
          throw companyError
        }

        if (company) {
          query = query.eq("company_id", company.id)
        }
      }

      const queryPromise = query
      const { data, error: queryError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any

      if (queryError) {
        if (queryError.code === 'PGRST116' || queryError.message?.includes('does not exist')) {
          console.warn('Database tables not yet created.')
          setError('⚠️ Database not initialized. Run migration: see MIGRATION_INSTRUCTIONS.md')
          setLoading(false)
          return
        }
        throw queryError
      }

      const kpisData = (data || []) as any[]
      setKpis(kpisData)

      // Calculate summary
      const newSummary: KPISummary = {
        liquidez: 0,
        revenue: 0,
        profit: 0,
        runway: 0,
        revenueByCompany: [],
        expensesByCategory: [],
        liquidityData: [],
      }

      const liquidezKPI = kpisData.find(
        (k) => k.kpi_type === "cashflow" || k.kpi_type === "balance"
      )
      if (liquidezKPI) newSummary.liquidez = liquidezKPI.value

      const revenueKPIs = kpisData.filter((k) => k.kpi_type === "revenue")
      newSummary.revenue = revenueKPIs.reduce((sum, k) => sum + k.value, 0)

      const profitKPIs = kpisData.filter((k) => k.kpi_type === "profit")
      newSummary.profit = profitKPIs.reduce((sum, k) => sum + k.value, 0)

      const runwayKPI = kpisData.find((k) => k.kpi_type === "runway")
      if (runwayKPI) {
        newSummary.runway = runwayKPI.value
      } else {
        const burnRateKPI = kpisData.find((k) => k.kpi_type === "burn_rate")
        if (burnRateKPI && burnRateKPI.value > 0) {
          newSummary.runway = newSummary.liquidez / burnRateKPI.value
        }
      }

      const revenueByCompanyMap = new Map<string, number>()
      revenueKPIs.forEach((k: any) => {
        const companyName = k.companies?.name || "Unknown"
        const current = revenueByCompanyMap.get(companyName) || 0
        revenueByCompanyMap.set(companyName, current + k.value)
      })
      newSummary.revenueByCompany = Array.from(revenueByCompanyMap.entries()).map(
        ([company, revenue]) => ({ company, revenue })
      )

      const expenseKPIs = kpisData.filter((k) => k.kpi_type === "expense")
      const expensesByCategoryMap = new Map<string, number>()
      expenseKPIs.forEach((k: any) => {
        const category = k.kpi_name || "Otros"
        const current = expensesByCategoryMap.get(category) || 0
        expensesByCategoryMap.set(category, current + k.value)
      })
      newSummary.expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(
        ([category, amount]) => ({ category, amount })
      )

      const cashflowKPIs = kpisData
        .filter((k) => k.kpi_type === "cashflow" || k.kpi_type === "balance")
        .sort((a, b) => {
          const dateA = a.period_end || a.created_at
          const dateB = b.period_end || b.created_at
          return new Date(dateA).getTime() - new Date(dateB).getTime()
        })
        .slice(-6)

      newSummary.liquidityData = cashflowKPIs.map((k: any) => {
        const date = new Date(k.period_end || k.created_at)
        const month = date.toLocaleDateString("es-ES", { month: "short" })
        return {
          month: month.charAt(0).toUpperCase() + month.slice(1),
          liquidez: k.value,
          objetivo: k.value * 1.1,
        }
      })

      setSummary(newSummary)
    } catch (err) {
      console.error('Error fetching KPIs:', err)
      const errorMessage = err instanceof Error ? err.message : "Error loading KPIs"
      
      if (errorMessage.includes('timeout')) {
        setError('⏱️ Connection timeout. Check your internet connection.')
      } else if (errorMessage.includes('not initialized') || errorMessage.includes('does not exist')) {
        setError('⚠️ Database not initialized. See MIGRATION_INSTRUCTIONS.md')
      } else {
        setError(`❌ ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }, [companyId, supabase])

  useEffect(() => {
    fetchKPIs()
  }, [fetchKPIs])

  return { kpis, summary, loading, error, refetch: fetchKPIs }
}
