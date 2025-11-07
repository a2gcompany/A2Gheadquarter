//
//  ClaudeService.swift
//  A2G Command Center
//
//  Claude AI service for document analysis and chat
//

import Foundation

class ClaudeService {
    static let shared = ClaudeService()

    private let apiKey: String
    private let apiUrl = "https://api.anthropic.com/v1/messages"
    private let model = "claude-sonnet-4-5-20250929"

    private init() {
        self.apiKey = ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] ?? ""
    }

    // MARK: - Document Analysis

    func analyzeDocument(text: String, documentType: String?) async throws -> DocumentAnalysis {
        let prompt = """
        Analiza el siguiente documento financiero y extrae todos los KPIs relevantes.

        Tipo de documento: \(documentType ?? "desconocido")

        Documento:
        \(text)

        Por favor extrae:
        1. KPIs financieros (revenue, expenses, profit, etc.)
        2. Fechas relevantes
        3. Monedas y cantidades
        4. Categorías de gastos/ingresos
        5. Un resumen ejecutivo

        Responde en formato JSON.
        """

        let response = try await sendMessage(prompt: prompt)

        return try parseDocumentAnalysis(from: response)
    }

    // MARK: - Chat with Data

    func chat(message: String, context: ChatContext) async throws -> String {
        let contextPrompt = buildContextPrompt(context)

        let fullPrompt = """
        \(contextPrompt)

        Usuario: \(message)

        Responde de forma concisa y accionable. Si mencionas números, incluye la moneda.
        """

        return try await sendMessage(prompt: fullPrompt)
    }

    // MARK: - Transaction Categorization

    func categorizeTransaction(description: String, amount: Decimal) async throws -> TransactionCategory {
        let prompt = """
        Categoriza la siguiente transacción:

        Descripción: \(description)
        Monto: \(amount)

        Responde con una categoría y subcategoría apropiadas.
        Categorías posibles: marketing, operations, payroll, taxes, software, travel, food, entertainment, other

        Responde en formato JSON: {"category": "...", "subcategory": "..."}
        """

        let response = try await sendMessage(prompt: prompt)

        return try parseTransactionCategory(from: response)
    }

    // MARK: - Private Methods

    private func sendMessage(prompt: String) async throws -> String {
        guard !apiKey.isEmpty else {
            throw ClaudeError.configurationError
        }

        guard let url = URL(string: apiUrl) else {
            throw ClaudeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 4096,
            "messages": [
                [
                    "role": "user",
                    "content": prompt
                ]
            ]
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ClaudeError.networkError
        }

        guard httpResponse.statusCode == 200 else {
            throw ClaudeError.apiError(statusCode: httpResponse.statusCode)
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let content = json?["content"] as? [[String: Any]],
              let text = content.first?["text"] as? String else {
            throw ClaudeError.invalidResponse
        }

        return text
    }

    private func buildContextPrompt(_ context: ChatContext) -> String {
        var prompt = "Eres un asistente financiero experto para A2G Command Center.\n\n"

        if !context.companies.isEmpty {
            prompt += "Empresas en el sistema:\n"
            for company in context.companies {
                prompt += "- \(company.name) (\(company.currency))\n"
            }
            prompt += "\n"
        }

        if let summary = context.financialSummary {
            prompt += "Resumen financiero actual:\n"
            prompt += "- Revenue: \(summary.totalRevenue)\n"
            prompt += "- Expenses: \(summary.totalExpenses)\n"
            prompt += "- Net Profit: \(summary.netProfit)\n"
            prompt += "- Cash: \(summary.totalCash)\n"
            if let runway = summary.runway {
                prompt += "- Runway: \(runway) meses\n"
            }
            prompt += "\n"
        }

        return prompt
    }

    private func parseDocumentAnalysis(from text: String) throws -> DocumentAnalysis {
        // Extract JSON from markdown code blocks if present
        var jsonText = text
        if let jsonStart = text.range(of: "```json")?.upperBound,
           let jsonEnd = text.range(of: "```", range: jsonStart..<text.endIndex)?.lowerBound {
            jsonText = String(text[jsonStart..<jsonEnd]).trimmingCharacters(in: .whitespacesAndNewlines)
        }

        guard let data = jsonText.data(using: .utf8) else {
            throw ClaudeError.invalidResponse
        }

        return try JSONDecoder().decode(DocumentAnalysis.self, from: data)
    }

    private func parseTransactionCategory(from text: String) throws -> TransactionCategory {
        var jsonText = text
        if let jsonStart = text.range(of: "{"),
           let jsonEnd = text.range(of: "}", options: .backwards) {
            jsonText = String(text[jsonStart.lowerBound...jsonEnd.upperBound])
        }

        guard let data = jsonText.data(using: .utf8) else {
            throw ClaudeError.invalidResponse
        }

        return try JSONDecoder().decode(TransactionCategory.self, from: data)
    }
}

// MARK: - Supporting Types

struct ChatContext {
    let companies: [Company]
    let financialSummary: FinancialSummary?
    let recentTransactions: [Transaction]?
}

struct DocumentAnalysis: Codable {
    let summary: String
    let kpis: [ExtractedKPI]
    let dates: [String]?
    let categories: [String]?

    struct ExtractedKPI: Codable {
        let name: String
        let value: String
        let unit: String?
    }
}

struct TransactionCategory: Codable {
    let category: String
    let subcategory: String?
}

enum ClaudeError: LocalizedError {
    case configurationError
    case invalidURL
    case networkError
    case apiError(statusCode: Int)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .configurationError:
            return "Claude API key is missing"
        case .invalidURL:
            return "Invalid API URL"
        case .networkError:
            return "Network error occurred"
        case .apiError(let statusCode):
            return "API error: \(statusCode)"
        case .invalidResponse:
            return "Invalid response from API"
        }
    }
}
