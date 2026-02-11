// ============================================
// A2G Command Center — Unified Database Types
// Source of truth for all Supabase table types
// ============================================

// --- Projects ---
export type ProjectType = "artist" | "vertical"
export type Project = {
  id: string
  name: string
  type: ProjectType
  created_at: string
}
export type NewProject = Omit<Project, "id" | "created_at">

// --- Transactions ---
export type TransactionType = "income" | "expense"
export type Transaction = {
  id: string
  project_id: string
  date: string
  description: string
  amount: string
  type: TransactionType
  category: string | null
  source_file: string | null
  payment_source_id: string | null
  business_unit_id: string | null
  created_at: string
}
export type NewTransaction = Omit<Transaction, "id" | "created_at" | "payment_source_id" | "business_unit_id"> & {
  payment_source_id?: string | null
  business_unit_id?: string | null
}

// --- Bookings ---
export type BookingStatus = "negotiating" | "confirmed" | "contracted" | "completed" | "cancelled"
export type Booking = {
  id: string
  project_id: string
  venue: string
  city: string
  country: string
  fee: string | null
  fee_currency: string | null
  status: BookingStatus
  show_date: string | null
  notes: string | null
  contract_id: string | null
  region: string | null
  fee_usd: string | null
  artist_name: string | null
  event_name: string | null
  created_at: string
}
export type NewBooking = Omit<Booking, "id" | "created_at">

// --- Releases ---
export type ReleaseStatus = "draft" | "shopping" | "accepted" | "released"
export type LabelContact = {
  label: string
  status: "pending" | "waiting" | "rejected" | "accepted"
  date: string
  notes?: string
}
export type Release = {
  id: string
  project_id: string
  track_name: string
  labels_contacted: LabelContact[] | null
  status: ReleaseStatus
  release_date: string | null
  notes: string | null
  created_at: string
}
export type NewRelease = Omit<Release, "id" | "created_at">

// --- Reports ---
export type ReportData = {
  metrics?: Record<string, number>
  notes?: string
  highlights?: string[]
  challenges?: string[]
  [key: string]: unknown
}
export type Report = {
  id: string
  project_id: string | null
  submitted_by: string
  period: string
  department: string
  data: ReportData
  created_at: string
}
export type NewReport = Omit<Report, "id" | "created_at">

// --- Employees ---
export type EmployeeStatus = "active" | "inactive" | "contractor"
export type Employee = {
  id: string
  business_unit_id: string | null
  name: string
  role: string
  email: string | null
  monthly_cost: number | null
  currency: string
  start_date: string | null
  status: EmployeeStatus
  notes: string | null
  created_at: string
}
export type EmployeeWithUnit = Employee & {
  business_unit_name: string | null
  business_unit_slug: string | null
}

// --- Business Units ---
export type BusinessUnitType = "holding" | "management" | "software" | "marketing" | "media"
export type BusinessUnit = {
  id: string
  slug: string
  name: string
  type: BusinessUnitType
  description: string | null
  created_at: string
}

// --- Payment Sources ---
export type PaymentSourceType = "bank" | "stripe" | "paypal" | "wise" | "cash" | "crypto"
export type PaymentSource = {
  id: string
  business_unit_id: string | null
  name: string
  type: PaymentSourceType
  account_identifier: string | null
  currency: string
  is_active: boolean
  created_at: string
}

// --- Integrations ---
export type IntegrationType = "bank" | "stripe" | "paypal" | "shopify"
export type Integration = {
  id: string
  business_unit_id: string | null
  type: IntegrationType
  name: string
  config: Record<string, unknown>
  is_active: boolean
  last_synced_at: string | null
  created_at: string
}

// --- Audesign KPIs ---
export type AudesignKPI = {
  id: string
  period: string
  mrr: number | null
  active_users: number
  new_users: number
  churned_users: number
  stripe_revenue: number | null
  paypal_revenue: number | null
  conversion_rate: number | null
  arpu: number | null
  notes: string | null
  created_at: string
}
