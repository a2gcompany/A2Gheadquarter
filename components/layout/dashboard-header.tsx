"use client"

import { Button } from "@/components/ui/button"
import { CompanySelector } from "@/components/dashboard/company-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/documents/document-upload"
import { AIChat } from "@/components/chat/ai-chat"
import {
  Upload,
  MessageSquare,
} from "lucide-react"

interface DashboardHeaderProps {
  selectedCompany: string
  onCompanyChange: (value: string) => void
}

export function DashboardHeader({
  selectedCompany,
  onCompanyChange,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
      {/* Title and actions row */}
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title */}
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl sm:text-2xl font-bold">A2G Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Business Intelligence Platform
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <CompanySelector
              value={selectedCompany}
              onValueChange={onCompanyChange}
            />

            {/* Upload Document */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Subir</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4">
                <DialogHeader>
                  <DialogTitle>Subir Documento</DialogTitle>
                  <DialogDescription>
                    Sube PDFs, Excel, CSV o imagenes. La IA los analizara automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload companyId={selectedCompany} />
              </DialogContent>
            </Dialog>

            {/* AI Chat */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat IA</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] mx-4">
                <DialogHeader>
                  <DialogTitle>Chat con IA</DialogTitle>
                  <DialogDescription>
                    Pregunta sobre tus datos financieros, metricas y KPIs.
                  </DialogDescription>
                </DialogHeader>
                <AIChat companyId={selectedCompany} userId="demo-user" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  )
}
