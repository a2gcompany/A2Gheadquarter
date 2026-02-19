"use client"

import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLayout } from "@/components/layout/app-layout"
import { IngestionOverview } from "@/components/ingestion/overview"
import { IngestionImport } from "@/components/ingestion/import-tab"
import { IngestionSync } from "@/components/ingestion/sync-tab"
import { IngestionReconciliation } from "@/components/ingestion/reconciliation-tab"
import { IngestionHistory } from "@/components/ingestion/history-tab"
import { useSearchParams } from "next/navigation"

function IngestionContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Vista General</TabsTrigger>
        <TabsTrigger value="import">Importar</TabsTrigger>
        <TabsTrigger value="sync">Sincronizar</TabsTrigger>
        <TabsTrigger value="reconciliation">Reconciliacion</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <IngestionOverview />
      </TabsContent>
      <TabsContent value="import">
        <IngestionImport />
      </TabsContent>
      <TabsContent value="sync">
        <IngestionSync />
      </TabsContent>
      <TabsContent value="reconciliation">
        <IngestionReconciliation />
      </TabsContent>
      <TabsContent value="history">
        <IngestionHistory />
      </TabsContent>
    </Tabs>
  )
}

export default function IngestionPage() {
  return (
    <AppLayout title="Centro de Ingesta">
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
        <IngestionContent />
      </Suspense>
    </AppLayout>
  )
}
