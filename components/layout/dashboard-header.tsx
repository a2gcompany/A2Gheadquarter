"use client"

import { CompanySelector } from "@/components/dashboard/company-selector"

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
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl sm:text-2xl font-bold">A2G Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Business Intelligence Platform
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <CompanySelector
              value={selectedCompany}
              onValueChange={onCompanyChange}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
