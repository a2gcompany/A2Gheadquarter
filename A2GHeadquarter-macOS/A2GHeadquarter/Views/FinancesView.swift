//
//  FinancesView.swift
//  A2G Command Center
//
//  Finances and transactions view
//

import SwiftUI

struct FinancesView: View {
    @State private var transactions: [Transaction] = []
    @State private var accounts: [Account] = []
    @State private var selectedAccount: Account?
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            HStack(spacing: 0) {
                // Accounts sidebar
                accountsSidebar
                    .frame(width: 250)

                Divider()

                // Transactions list
                transactionsList
            }
            .navigationTitle("Finanzas")
        }
        .onAppear(perform: loadData)
    }

    @ViewBuilder
    private var accountsSidebar: some View {
        List(selection: $selectedAccount) {
            Section("Cuentas") {
                ForEach(accounts) { account in
                    AccountRow(account: account)
                        .tag(account)
                }
            }
        }
        .listStyle(.sidebar)
    }

    @ViewBuilder
    private var transactionsList: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Transacciones")
                    .font(.title2)
                    .fontWeight(.bold)

                Spacer()

                Button(action: {}) {
                    Label("Exportar", systemImage: "square.and.arrow.up")
                }
                .buttonStyle(.bordered)
            }
            .padding()

            Divider()

            // Transactions table
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                Table(transactions) {
                    TableColumn("Fecha") { transaction in
                        Text(transaction.date, style: .date)
                    }
                    .width(min: 100, ideal: 120)

                    TableColumn("Descripción") { transaction in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(transaction.description)
                            if let merchant = transaction.merchant {
                                Text(merchant)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .width(min: 200, ideal: 300)

                    TableColumn("Categoría") { transaction in
                        Text(transaction.category ?? "Sin categoría")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(4)
                    }
                    .width(min: 120, ideal: 150)

                    TableColumn("Monto") { transaction in
                        Text(formatAmount(transaction.amount, currency: transaction.currency))
                            .fontWeight(.medium)
                            .foregroundColor(transaction.type == .income ? .green : .primary)
                    }
                    .width(min: 100, ideal: 120)
                }
            }
        }
    }

    private func loadData() {
        isLoading = true

        Task {
            do {
                accounts = try await SupabaseService.shared.fetchAccounts()
                transactions = try await SupabaseService.shared.fetchTransactions()
                isLoading = false
            } catch {
                print("Error loading data: \(error)")
                isLoading = false
            }
        }
    }

    private func formatAmount(_ value: Decimal, currency: String) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        return formatter.string(from: value as NSDecimalNumber) ?? "$0"
    }
}

struct AccountRow: View {
    let account: Account

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(account.name)
                .font(.body)
                .fontWeight(.medium)

            HStack {
                Text(formatBalance(account.balance))
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text(account.currency)
                    .font(.caption2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
    }

    private func formatBalance(_ value: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = account.currency
        return formatter.string(from: value as NSDecimalNumber) ?? "$0"
    }
}
