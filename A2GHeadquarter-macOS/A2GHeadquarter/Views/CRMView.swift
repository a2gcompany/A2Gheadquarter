//
//  CRMView.swift
//  A2G Command Center
//
//  CRM and contacts view
//

import SwiftUI

struct CRMView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Image(systemName: "person.2")
                    .font(.system(size: 64))
                    .foregroundStyle(.blue.gradient)
                    .padding()

                Text("CRM Module")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Gestión de contactos y pipeline de ventas")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()

                Button("Coming Soon") {}
                    .disabled(true)
                    .buttonStyle(.borderedProminent)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .navigationTitle("CRM")
        }
    }
}
