//
//  SupabaseService.swift
//  A2G Command Center
//
//  Supabase database and storage service
//

import Foundation

class SupabaseService {
    static let shared = SupabaseService()

    private let supabaseUrl: String
    private let supabaseKey: String
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        self.supabaseUrl = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
        self.supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_KEY"] ?? ""

        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    // MARK: - Generic Database Operations

    func fetch<T: Decodable>(_ table: String, select: String = "*", filter: [String: Any]? = nil) async throws -> [T] {
        var urlString = "\(supabaseUrl)/rest/v1/\(table)?select=\(select)"

        if let filter = filter {
            for (key, value) in filter {
                urlString += "&\(key)=eq.\(value)"
            }
        }

        guard let url = URL(string: urlString) else {
            throw SupabaseError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(getAuthToken())", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        return try decoder.decode([T].self, from: data)
    }

    func insert<T: Encodable>(_ table: String, data: T) async throws {
        guard let url = URL(string: "\(supabaseUrl)/rest/v1/\(table)") else {
            throw SupabaseError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(getAuthToken())", forHTTPHeaderField: "Authorization")
        request.httpBody = try encoder.encode(data)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw SupabaseError.insertFailed
        }
    }

    // MARK: - Company Operations

    func fetchCompanies() async throws -> [Company] {
        return try await fetch("companies")
    }

    func fetchCompany(id: UUID) async throws -> Company {
        let companies: [Company] = try await fetch("companies", filter: ["id": id.uuidString])
        guard let company = companies.first else {
            throw SupabaseError.notFound
        }
        return company
    }

    // MARK: - Account Operations

    func fetchAccounts(companyId: UUID? = nil) async throws -> [Account] {
        if let companyId = companyId {
            return try await fetch("accounts", filter: ["company_id": companyId.uuidString])
        }
        return try await fetch("accounts")
    }

    // MARK: - Transaction Operations

    func fetchTransactions(accountId: UUID? = nil, limit: Int = 100) async throws -> [Transaction] {
        var urlString = "\(supabaseUrl)/rest/v1/transactions?select=*&limit=\(limit)&order=date.desc"

        if let accountId = accountId {
            urlString += "&account_id=eq.\(accountId.uuidString)"
        }

        guard let url = URL(string: urlString) else {
            throw SupabaseError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(getAuthToken())", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        return try decoder.decode([Transaction].self, from: data)
    }

    // MARK: - KPI Operations

    func fetchKPIs(companyId: UUID? = nil) async throws -> [KPI] {
        if let companyId = companyId {
            return try await fetch("kpis_extracted", filter: ["company_id": companyId.uuidString])
        }
        return try await fetch("kpis_extracted")
    }

    func fetchFinancialSummary(companyId: UUID) async throws -> FinancialSummary {
        let summaries: [FinancialSummary] = try await fetch(
            "company_financial_summary",
            filter: ["company_id": companyId.uuidString]
        )
        guard let summary = summaries.first else {
            throw SupabaseError.notFound
        }
        return summary
    }

    // MARK: - Document Operations

    func fetchDocuments(companyId: UUID? = nil) async throws -> [DocumentItem] {
        if let companyId = companyId {
            return try await fetch("documents", filter: ["company_id": companyId.uuidString])
        }
        return try await fetch("documents")
    }

    func uploadDocument(data: Data, fileName: String, companyId: UUID?) async throws -> String {
        let path = "documents/\(UUID().uuidString)_\(fileName)"
        guard let url = URL(string: "\(supabaseUrl)/storage/v1/object/documents/\(path)") else {
            throw SupabaseError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(getAuthToken())", forHTTPHeaderField: "Authorization")
        request.httpBody = data

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw SupabaseError.uploadFailed
        }

        return path
    }

    // MARK: - Helper Methods

    private func getAuthToken() -> String {
        return UserDefaults.standard.string(forKey: "auth_token") ?? ""
    }
}

enum SupabaseError: LocalizedError {
    case invalidURL
    case notFound
    case insertFailed
    case uploadFailed
    case networkError

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .notFound:
            return "Resource not found"
        case .insertFailed:
            return "Failed to insert data"
        case .uploadFailed:
            return "Failed to upload file"
        case .networkError:
            return "Network error occurred"
        }
    }
}
