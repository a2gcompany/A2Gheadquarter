//
//  A2GHeadquarterApp.swift
//  A2G Command Center
//
//  Enterprise Command Center for A2G businesses
//

import SwiftUI

@main
struct A2GHeadquarterApp: App {
    @StateObject private var authService = AuthService.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .frame(minWidth: 1200, minHeight: 800)
        }
        .windowStyle(.hiddenTitleBar)
        .windowToolbarStyle(.unified)

        Settings {
            SettingsView()
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authService: AuthService
    @State private var selectedTab: Tab = .dashboard

    enum Tab {
        case dashboard, finances, crm, documents
    }

    var body: some View {
        if authService.isAuthenticated {
            NavigationSplitView {
                SidebarView(selectedTab: $selectedTab)
            } detail: {
                DetailView(selectedTab: selectedTab)
            }
        } else {
            LoginView()
        }
    }
}

struct SidebarView: View {
    @Binding var selectedTab: ContentView.Tab

    var body: some View {
        List(selection: $selectedTab) {
            Section("Command Center") {
                Label("Dashboard", systemImage: "chart.line.uptrend.xyaxis")
                    .tag(ContentView.Tab.dashboard)
                Label("Finanzas", systemImage: "dollarsign.circle")
                    .tag(ContentView.Tab.finances)
                Label("CRM", systemImage: "person.2")
                    .tag(ContentView.Tab.crm)
                Label("Documentos", systemImage: "doc.text")
                    .tag(ContentView.Tab.documents)
            }
        }
        .navigationTitle("A2G HQ")
        .frame(minWidth: 200)
    }
}

struct DetailView: View {
    let selectedTab: ContentView.Tab

    var body: some View {
        Group {
            switch selectedTab {
            case .dashboard:
                DashboardView()
            case .finances:
                FinancesView()
            case .crm:
                CRMView()
            case .documents:
                DocumentsView()
            }
        }
    }
}
