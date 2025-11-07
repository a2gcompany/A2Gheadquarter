//
//  KPICard.swift
//  A2G Command Center
//
//  Reusable KPI card component
//

import SwiftUI

struct KPICard: View {
    let title: String
    let value: String
    let subtitle: String?
    let trend: Trend?
    let icon: String

    enum Trend {
        case up(Double)
        case down(Double)
        case neutral

        var color: Color {
            switch self {
            case .up: return .green
            case .down: return .red
            case .neutral: return .gray
            }
        }

        var icon: String {
            switch self {
            case .up: return "arrow.up.right"
            case .down: return "arrow.down.right"
            case .neutral: return "minus"
            }
        }

        var text: String {
            switch self {
            case .up(let value): return "+\(String(format: "%.1f", value))%"
            case .down(let value): return "\(String(format: "%.1f", value))%"
            case .neutral: return "0%"
            }
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(.blue.gradient)

                Spacer()

                if let trend = trend {
                    HStack(spacing: 4) {
                        Image(systemName: trend.icon)
                        Text(trend.text)
                    }
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(trend.color)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(value)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.primary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(nsColor: .controlBackgroundColor))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 2)
    }
}
