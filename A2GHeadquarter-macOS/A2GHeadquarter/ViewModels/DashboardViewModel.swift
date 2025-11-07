//
//  DashboardViewModel.swift
//  A2G Command Center
//
//  ViewModel for Dashboard
//

import Foundation
import Combine

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var companies: [Company] = []
    @Published var selectedCompany: Company?
    @Published var financialSummary: FinancialSummary?
    @Published var recentTransactions: [Transaction] = []
    @Published var kpis: [KPI] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let supabaseService = SupabaseService.shared

    func loadData() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                // Load companies
                companies = try await supabaseService.fetchCompanies()

                // Load data for selected company (or aggregate if nil)
                if let companyId = selectedCompany?.id {
                    try await loadCompanyData(companyId: companyId)
                } else if let firstCompany = companies.first {
                    selectedCompany = firstCompany
                    try await loadCompanyData(companyId: firstCompany.id)
                }

                isLoading = false
            } catch {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    func selectCompany(_ company: Company?) {
        selectedCompany = company

        Task {
            if let companyId = company?.id {
                try await loadCompanyData(companyId: companyId)
            }
        }
    }

    private func loadCompanyData(companyId: UUID) async throws {
        async let summary = supabaseService.fetchFinancialSummary(companyId: companyId)
        async let transactions = supabaseService.fetchTransactions(limit: 10)
        async let fetchedKpis = supabaseService.fetchKPIs(companyId: companyId)

        financialSummary = try await summary
        recentTransactions = try await transactions
        kpis = try await fetchedKpis
    }
}
