//
//  LoginView.swift
//  A2G Command Center
//
//  Login screen
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "0A0E27"), Color(hex: "1A1F3A")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 30) {
                // Logo and title
                VStack(spacing: 16) {
                    Image(systemName: "chart.line.uptrend.xyaxis.circle.fill")
                        .resizable()
                        .frame(width: 80, height: 80)
                        .foregroundStyle(.blue.gradient)

                    Text("A2G Command Center")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)

                    Text("Enterprise Business Intelligence")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                // Login form
                VStack(spacing: 20) {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                        .frame(width: 300)

                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.password)
                        .frame(width: 300)

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }

                    Button(action: signIn) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(.circular)
                                .tint(.white)
                        } else {
                            Text("Sign In")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(width: 300, height: 44)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .disabled(isLoading || email.isEmpty || password.isEmpty)
                }
                .padding(40)
                .background(Color.white.opacity(0.05))
                .cornerRadius(16)
            }
        }
        .frame(minWidth: 600, minHeight: 500)
    }

    private func signIn() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                try await authService.signIn(email: email, password: password)
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

// Helper for hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
