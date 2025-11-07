"use client"

import { useState } from "react"
import { CompanySelector } from "@/components/dashboard/company-selector"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentsList } from "@/components/documents/documents-list"
import { AIChat } from "@/components/chat/ai-chat"
import {
  Upload,
  MessageSquare,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-sm text-muted-foreground">
                Enterprise Business Intelligence Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CompanySelector
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Subir Documento</DialogTitle>
                    <DialogDescription>
                      Sube PDFs, Excel, CSV o imágenes. La IA los analizará automáticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <DocumentUpload companyId={selectedCompany} />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-premium">
                    <MessageSquare className="h-4 w-4" />
                    Chat IA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Chat con IA</DialogTitle>
                    <DialogDescription>
                      Pregunta sobre tus datos financieros, métricas y KPIs.
                    </DialogDescription>
                  </DialogHeader>
                  <AIChat companyId={selectedCompany} userId="demo-user" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Documents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Documentos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona y analiza tus documentos empresariales
              </p>
            </div>
          </div>

          <DocumentsList companyId={selectedCompany} />
        </div>
      </main>
    </div>
  )
}
