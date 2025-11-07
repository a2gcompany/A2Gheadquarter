//
//  SettingsView.swift
//  A2G Command Center
//
//  Settings view
//

import SwiftUI

struct SettingsView: View {
    @AppStorage("supabase_url") private var supabaseUrl = ""
    @AppStorage("supabase_key") private var supabaseKey = ""
    @AppStorage("anthropic_api_key") private var anthropicKey = ""

    var body: some View {
        TabView {
            Form {
                Section("Supabase Configuration") {
                    TextField("Supabase URL", text: $supabaseUrl)
                    SecureField("Supabase API Key", text: $supabaseKey)
                }

                Section("Claude AI Configuration") {
                    SecureField("Anthropic API Key", text: $anthropicKey)
                }

                Section {
                    Text("Configura tus credenciales para conectar con Supabase y Claude AI")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .formStyle(.grouped)
            .tabItem {
                Label("General", systemImage: "gear")
            }
        }
        .frame(width: 500, height: 400)
    }
}
