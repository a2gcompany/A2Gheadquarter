//
//  KPI.swift
//  A2G Command Center
//
//  KPI data models
//

import Foundation

struct KPI: Identifiable, Codable {
    let id: UUID
    let documentId: UUID?
    let companyId: UUID?
    let kpiType: String
    let name: String
    let value: Decimal?
    let valueText: String?
    let unit: String?
    let period: String?
    let date: Date?
    let metadata: [String: String]?
    let extractedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case documentId = "document_id"
        case companyId = "company_id"
        case kpiType = "kpi_type"
        case name
        case value
        case valueText = "value_text"
        case unit
        case period
        case date
        case metadata
        case extractedAt = "extracted_at"
    }
}

struct FinancialSummary: Codable {
    let companyId: UUID
    let totalRevenue: Decimal
    let totalExpenses: Decimal
    let netProfit: Decimal
    let profitMargin: Decimal
    let totalCash: Decimal
    let totalDebt: Decimal
    let runway: Int?
    let burnRate: Decimal?

    enum CodingKeys: String, CodingKey {
        case companyId = "company_id"
        case totalRevenue = "total_revenue"
        case totalExpenses = "total_expenses"
        case netProfit = "net_profit"
        case profitMargin = "profit_margin"
        case totalCash = "total_cash"
        case totalDebt = "total_debt"
        case runway
        case burnRate = "burn_rate"
    }
}
