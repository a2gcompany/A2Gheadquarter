//
//  Document.swift
//  A2G Command Center
//
//  Document data models
//

import Foundation

struct DocumentItem: Identifiable, Codable {
    let id: UUID
    let companyId: UUID?
    let fileName: String
    let fileType: String
    let fileSize: Int
    let storagePath: String
    let uploadedBy: UUID
    let uploadedAt: Date
    let documentType: String?
    let status: DocumentStatus
    let processedAt: Date?
    let extractedText: String?
    let summary: String?
    let metadata: [String: String]?

    enum CodingKeys: String, CodingKey {
        case id
        case companyId = "company_id"
        case fileName = "file_name"
        case fileType = "file_type"
        case fileSize = "file_size"
        case storagePath = "storage_path"
        case uploadedBy = "uploaded_by"
        case uploadedAt = "uploaded_at"
        case documentType = "document_type"
        case status
        case processedAt = "processed_at"
        case extractedText = "extracted_text"
        case summary
        case metadata
    }
}

enum DocumentStatus: String, Codable {
    case pending = "pending"
    case processing = "processing"
    case completed = "completed"
    case failed = "failed"
}
