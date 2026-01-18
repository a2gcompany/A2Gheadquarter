import { pgTable, uuid, text, timestamp, numeric, jsonb, date } from "drizzle-orm/pg-core"

// Project types
export type ProjectType = "artist" | "vertical"

// Transaction types
export type TransactionType = "income" | "expense"

// Release status
export type ReleaseStatus = "draft" | "shopping" | "accepted" | "released"

// Booking status
export type BookingStatus = "negotiating" | "confirmed" | "contracted" | "completed" | "cancelled"

// Projects table - artists and verticals
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<ProjectType>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Transactions table - for accounting per project
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").$type<TransactionType>().notNull(),
  category: text("category"),
  sourceFile: text("source_file"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Label contact type for releases
export type LabelContact = {
  label: string
  status: "pending" | "waiting" | "rejected" | "accepted"
  date: string
  notes?: string
}

// Releases table - for music releases
export const releases = pgTable("releases", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  trackName: text("track_name").notNull(),
  labelsContacted: jsonb("labels_contacted").$type<LabelContact[]>().default([]),
  status: text("status").$type<ReleaseStatus>().notNull().default("draft"),
  releaseDate: date("release_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Bookings table - for shows and events
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  fee: numeric("fee", { precision: 12, scale: 2 }),
  feeCurrency: text("fee_currency").default("EUR"),
  status: text("status").$type<BookingStatus>().notNull().default("negotiating"),
  showDate: date("show_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Report data type
export type ReportData = {
  metrics?: Record<string, number>
  notes?: string
  highlights?: string[]
  challenges?: string[]
  [key: string]: unknown
}

// Reports table - for team monthly reports
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  submittedBy: text("submitted_by").notNull(),
  period: text("period").notNull(), // e.g., "2024-01", "2024-Q1"
  department: text("department").notNull(),
  data: jsonb("data").$type<ReportData>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Type exports for use in application
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export type Release = typeof releases.$inferSelect
export type NewRelease = typeof releases.$inferInsert

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
