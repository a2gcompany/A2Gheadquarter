//
//  DocumentsView.swift
//  A2G Command Center
//
//  Documents management and AI analysis view
//

import SwiftUI
import UniformTypeIdentifiers

struct DocumentsView: View {
    @State private var documents: [DocumentItem] = []
    @State private var isLoading = false
    @State private var showingUpload = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Documentos")
                        .font(.title2)
                        .fontWeight(.bold)

                    Spacer()

                    Button(action: { showingUpload = true }) {
                        Label("Subir Documento", systemImage: "plus.circle.fill")
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()

                Divider()

                // Documents grid
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if documents.isEmpty {
                    emptyState
                } else {
                    documentsGrid
                }
            }
            .navigationTitle("Documentos")
        }
        .sheet(isPresented: $showingUpload) {
            DocumentUploadView(onUpload: { url in
                loadDocuments()
            })
        }
        .onAppear(perform: loadDocuments)
    }

    @ViewBuilder
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text")
                .font(.system(size: 64))
                .foregroundStyle(.gray.gradient)

            Text("No hay documentos")
                .font(.headline)

            Text("Sube documentos para que la IA los analice automáticamente")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button(action: { showingUpload = true }) {
                Label("Subir primer documento", systemImage: "plus")
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    @ViewBuilder
    private var documentsGrid: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 200))
            ], spacing: 16) {
                ForEach(documents) { document in
                    DocumentCard(document: document)
                }
            }
            .padding()
        }
    }

    private func loadDocuments() {
        isLoading = true

        Task {
            do {
                documents = try await SupabaseService.shared.fetchDocuments()
                isLoading = false
            } catch {
                print("Error loading documents: \(error)")
                isLoading = false
            }
        }
    }
}

struct DocumentCard: View {
    let document: DocumentItem

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: iconForFileType(document.fileType))
                    .font(.title)
                    .foregroundStyle(.blue.gradient)

                Spacer()

                statusBadge
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(document.fileName)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(2)

                Text(formatFileSize(document.fileSize))
                    .font(.caption)
                    .foregroundColor(.secondary)

                if let summary = document.summary {
                    Text(summary)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(3)
                        .padding(.top, 4)
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(nsColor: .controlBackgroundColor))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 2)
    }

    @ViewBuilder
    private var statusBadge: some View {
        HStack(spacing: 4) {
            switch document.status {
            case .completed:
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            case .processing:
                ProgressView()
                    .scaleEffect(0.7)
            case .pending:
                Image(systemName: "clock")
                    .foregroundColor(.orange)
            case .failed:
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.red)
            }

            Text(document.status.rawValue.capitalized)
                .font(.caption2)
        }
    }

    private func iconForFileType(_ type: String) -> String {
        switch type.lowercased() {
        case "pdf":
            return "doc.fill"
        case "xlsx", "xls", "csv":
            return "tablecells"
        case "jpg", "jpeg", "png":
            return "photo"
        default:
            return "doc.text"
        }
    }

    private func formatFileSize(_ bytes: Int) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
}

struct DocumentUploadView: View {
    @Environment(\.dismiss) var dismiss
    let onUpload: (URL) -> Void

    @State private var isTargeted = false
    @State private var selectedFile: URL?

    var body: some View {
        VStack(spacing: 24) {
            Text("Subir Documento")
                .font(.title)
                .fontWeight(.bold)

            // Drop zone
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(style: StrokeStyle(lineWidth: 2, dash: [8]))
                    .foregroundColor(isTargeted ? .blue : .gray)

                VStack(spacing: 16) {
                    Image(systemName: "arrow.down.doc")
                        .font(.system(size: 48))
                        .foregroundStyle(.blue.gradient)

                    Text("Arrastra un archivo aquí")
                        .font(.headline)

                    Text("o")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Button("Seleccionar archivo") {
                        selectFile()
                    }
                    .buttonStyle(.bordered)

                    Text("PDF, Excel, CSV, Imágenes")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .frame(height: 300)
            .padding()
            .onDrop(of: [.fileURL], isTargeted: $isTargeted) { providers in
                handleDrop(providers: providers)
            }

            HStack {
                Button("Cancelar") {
                    dismiss()
                }
                .buttonStyle(.bordered)

                Spacer()
            }
            .padding(.horizontal)
        }
        .frame(width: 500, height: 500)
        .padding()
    }

    private func selectFile() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.allowedContentTypes = [.pdf, .commaSeparatedText, .spreadsheet, .image]

        if panel.runModal() == .OK, let url = panel.url {
            selectedFile = url
            onUpload(url)
            dismiss()
        }
    }

    private func handleDrop(providers: [NSItemProvider]) -> Bool {
        guard let provider = providers.first else { return false }

        _ = provider.loadObject(ofClass: URL.self) { url, error in
            if let url = url {
                DispatchQueue.main.async {
                    selectedFile = url
                    onUpload(url)
                    dismiss()
                }
            }
        }

        return true
    }
}
