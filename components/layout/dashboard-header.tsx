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
  Sparkles,
  Upload,
  MessageSquare,
  BarChart3,
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
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Dashboard title */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="font-semibold">Command Center</span>
        </div>

        {/* Right side - Company selector and actions */}
        <div className="flex items-center gap-3">
          <CompanySelector
            value={selectedCompany}
            onValueChange={onCompanyChange}
          />

          {/* Upload Document */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Subir Documento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
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
            <DialogContent className="max-w-3xl max-h-[80vh]">
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

      {/* Welcome message */}
      <div className="px-6 py-4 border-t border-border/30">
        <h1 className="text-2xl font-bold">A2G Command Center</h1>
        <p className="text-muted-foreground mt-1">
          Enterprise Business Intelligence Platform
        </p>
      </div>
    </header>
  )
}
