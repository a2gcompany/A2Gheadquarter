//
//  AuthService.swift
//  A2G Command Center
//
//  Authentication service using Supabase
//

import Foundation
import Combine

class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var isAuthenticated = false
    @Published var currentUser: User?

    private let supabaseUrl: String
    private let supabaseKey: String

    struct User: Codable {
        let id: UUID
        let email: String
        let createdAt: Date

        enum CodingKeys: String, CodingKey {
            case id
            case email
            case createdAt = "created_at"
        }
    }

    private init() {
        // Load from environment or configuration
        self.supabaseUrl = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
        self.supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_KEY"] ?? ""

        checkAuthStatus()
    }

    func checkAuthStatus() {
        // Check for stored auth token
        if let token = UserDefaults.standard.string(forKey: "auth_token") {
            // Validate token with Supabase
            validateToken(token)
        }
    }

    func signIn(email: String, password: String) async throws {
        guard !supabaseUrl.isEmpty && !supabaseKey.isEmpty else {
            throw AuthError.configurationError
        }

        let url = URL(string: "\(supabaseUrl)/auth/v1/token?grant_type=password")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")

        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AuthError.invalidCredentials
        }

        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)

        // Store token
        UserDefaults.standard.set(authResponse.accessToken, forKey: "auth_token")

        await MainActor.run {
            self.isAuthenticated = true
        }
    }

    func signOut() {
        UserDefaults.standard.removeObject(forKey: "auth_token")
        isAuthenticated = false
        currentUser = nil
    }

    private func validateToken(_ token: String) {
        // Implement token validation
        // For now, assume valid
        isAuthenticated = true
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let tokenType: String
    let expiresIn: Int
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case tokenType = "token_type"
        case expiresIn = "expires_in"
        case refreshToken = "refresh_token"
    }
}

enum AuthError: LocalizedError {
    case configurationError
    case invalidCredentials
    case networkError

    var errorDescription: String? {
        switch self {
        case .configurationError:
            return "Supabase configuration is missing"
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError:
            return "Network error occurred"
        }
    }
}
