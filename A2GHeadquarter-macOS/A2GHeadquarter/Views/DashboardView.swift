//
//  DashboardView.swift
//  A2G Command Center
//
//  Main dashboard view
//

import SwiftUI
import Charts

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Command Center")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Enterprise overview and analytics")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    // Company selector
                    Menu {
                        Button("Todas las empresas") {
                            viewModel.selectCompany(nil)
                        }

                        Divider()

                        ForEach(viewModel.companies) { company in
                            Button(company.name) {
                                viewModel.selectCompany(company)
                            }
                        }
                    } label: {
                        HStack {
                            Text(viewModel.selectedCompany?.name ?? "Todas")
                            Image(systemName: "chevron.down")
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                    }
                    .menuStyle(.borderlessButton)
                }
                .padding(.horizontal)

                if viewModel.isLoading {
                    ProgressView()
                        .frame(height: 400)
                } else if let error = viewModel.errorMessage {
                    ErrorView(message: error) {
                        viewModel.loadData()
                    }
                } else {
                    dashboardContent
                }
            }
            .padding()
        }
        .onAppear {
            viewModel.loadData()
        }
    }

    @ViewBuilder
    private var dashboardContent: some View {
        // KPI Cards
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            if let summary = viewModel.financialSummary {
                KPICard(
                    title: "Total Revenue",
                    value: formatCurrency(summary.totalRevenue),
                    subtitle: nil,
                    trend: .up(12.5),
                    icon: "chart.line.uptrend.xyaxis"
                )

                KPICard(
                    title: "Net Profit",
                    value: formatCurrency(summary.netProfit),
                    subtitle: "Margin: \(String(format: "%.1f", summary.profitMargin))%",
                    trend: summary.netProfit > 0 ? .up(5.2) : .down(-3.1),
                    icon: "banknote"
                )

                KPICard(
                    title: "Cash Position",
                    value: formatCurrency(summary.totalCash),
                    subtitle: summary.runway.map { "Runway: \($0) months" },
                    trend: .neutral,
                    icon: "dollarsign.circle"
                )

                KPICard(
                    title: "Monthly Burn",
                    value: summary.burnRate.map { formatCurrency($0) } ?? "N/A",
                    subtitle: "Average",
                    trend: .down(-2.3),
                    icon: "flame"
                )
            }
        }
        .padding(.horizontal)

        // Recent transactions
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Transactions")
                .font(.headline)
                .padding(.horizontal)

            VStack(spacing: 0) {
                ForEach(viewModel.recentTransactions.prefix(8)) { transaction in
                    TransactionRow(transaction: transaction)
                    if transaction.id != viewModel.recentTransactions.prefix(8).last?.id {
                        Divider()
                    }
                }
            }
            .background(Color(nsColor: .controlBackgroundColor))
            .cornerRadius(12)
        }
        .padding(.horizontal)
    }

    private func formatCurrency(_ value: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: value as NSDecimalNumber) ?? "$0"
    }
}

struct TransactionRow: View {
    let transaction: Transaction

    var body: some View {
        HStack {
            Circle()
                .fill(transaction.type == .income ? Color.green : Color.red)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(.body)
                Text(transaction.category ?? "Uncategorized")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(formatAmount(transaction.amount))
                .font(.body.monospacedDigit())
                .fontWeight(.medium)
                .foregroundColor(transaction.type == .income ? .green : .primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func formatAmount(_ value: Decimal) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = transaction.currency
        return formatter.string(from: value as NSDecimalNumber) ?? "$0"
    }
}

struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.orange)

            Text("Error")
                .font(.headline)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button("Retry", action: retry)
                .buttonStyle(.borderedProminent)
        }
        .frame(height: 400)
    }
}
