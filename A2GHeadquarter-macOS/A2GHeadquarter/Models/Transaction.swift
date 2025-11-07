//
//  Transaction.swift
//  A2G Command Center
//
//  Transaction data models
//

import Foundation

struct Transaction: Identifiable, Codable {
    let id: UUID
    let accountId: UUID
    let date: Date
    let description: String
    let amount: Decimal
    let type: TransactionType
    let category: String?
    let subcategory: String?
    let merchant: String?
    let notes: String?
    let tags: [String]?
    let currency: String
    let exchangeRate: Decimal?
    let amountUsd: Decimal?
    let isRecurring: Bool?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case accountId = "account_id"
        case date
        case description
        case amount
        case type
        case category
        case subcategory
        case merchant
        case notes
        case tags
        case currency
        case exchangeRate = "exchange_rate"
        case amountUsd = "amount_usd"
        case isRecurring = "is_recurring"
        case createdAt = "created_at"
    }
}

enum TransactionType: String, Codable {
    case income = "income"
    case expense = "expense"
    case transfer = "transfer"
}
