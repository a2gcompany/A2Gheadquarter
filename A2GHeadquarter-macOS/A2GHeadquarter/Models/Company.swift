//
//  Company.swift
//  A2G Command Center
//
//  Data models for companies
//

import Foundation

struct Company: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let legalName: String?
    let description: String?
    let industry: String?
    let country: String?
    let currency: String
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case legalName = "legal_name"
        case description
        case industry
        case country
        case currency
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct Account: Identifiable, Codable {
    let id: UUID
    let companyId: UUID
    let name: String
    let type: AccountType
    let currency: String
    let balance: Decimal
    let bankName: String?
    let accountNumber: String?
    let isActive: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case companyId = "company_id"
        case name
        case type
        case currency
        case balance
        case bankName = "bank_name"
        case accountNumber = "account_number"
        case isActive = "is_active"
        case createdAt = "created_at"
    }
}

enum AccountType: String, Codable {
    case checking = "checking"
    case savings = "savings"
    case creditCard = "credit_card"
    case investment = "investment"
    case other = "other"
}
