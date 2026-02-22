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
  external_id: string | null
  import_id: string | null
  payment_source_id: string | null
  business_unit_id: string | null
  created_at: string
}
export type NewTransaction = Omit<Transaction, "id" | "created_at" | "payment_source_id" | "business_unit_id" | "import_id" | "external_id"> & {
  payment_source_id?: string | null
  business_unit_id?: string | null
  import_id?: string | null
  external_id?: string | null
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
export type IntegrationType = "bank" | "stripe" | "paypal" | "shopify" | "google_sheets"
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

// --- Import History ---
export type ImportStatus = "running" | "completed" | "failed" | "partial"
export type ImportTrigger = "manual" | "cron" | "api"
export type ImportSourceType = "stripe" | "paypal" | "shopify" | "bank_csv" | "google_sheets" | "csv_manual" | "excel_bookings"

export type ImportHistory = {
  id: string
  integration_id: string | null
  source_type: ImportSourceType
  source_name: string
  triggered_by: ImportTrigger
  status: ImportStatus
  rows_imported: number
  rows_skipped: number
  rows_errored: number
  error_message: string | null
  metadata: Record<string, unknown>
  started_at: string
  completed_at: string | null
  created_at: string
}
export type NewImportHistory = {
  integration_id?: string | null
  source_type: ImportSourceType
  source_name: string
  triggered_by: ImportTrigger
  metadata?: Record<string, unknown>
}

// --- Reconciliation ---
export type ReconciliationStatus = "pending" | "confirmed" | "rejected"
export type ReconciliationMatch = {
  id: string
  transaction_a_id: string
  transaction_b_id: string
  match_type: "auto" | "manual"
  match_confidence: number | null
  status: ReconciliationStatus
  matched_on: Record<string, unknown>
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

// --- Royalties ---
export type RoyaltyStatus = "pending" | "invoiced" | "paid" | "disputed" | "overdue"
export type Royalty = {
  id: string
  project_id: string | null
  track_name: string
  source: string
  amount: string
  currency: string
  status: RoyaltyStatus
  invoice_number: string | null
  invoice_date: string | null
  due_date: string | null
  paid_date: string | null
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
export type NewRoyalty = Omit<Royalty, "id" | "created_at" | "updated_at">

// --- Contracts ---
export type ContractType = "release" | "management" | "publishing" | "booking" | "licensing" | "other"
export type ContractStatus = "draft" | "negotiating" | "sent" | "signing" | "active" | "completed" | "terminated"
export type Contract = {
  id: string
  project_id: string | null
  title: string
  counterparty: string
  contract_type: ContractType
  status: ContractStatus
  value: string | null
  currency: string
  start_date: string | null
  end_date: string | null
  key_terms: string | null
  document_url: string | null
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
export type NewContract = Omit<Contract, "id" | "created_at" | "updated_at">

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

// --- Ad Campaigns ---
export type AdPlatform = "meta" | "google"
export type AdCampaignStatus = "active" | "paused" | "archived"
export type AdCampaign = {
  id: string
  platform: AdPlatform
  platform_campaign_id: string
  business_unit_id: string | null
  name: string
  status: AdCampaignStatus
  product: string | null
  campaign_type: string | null
  daily_budget: number | null
  currency: string
  geo_targeting: string | null
  created_at: string
  updated_at: string
}

// --- Ad Daily Metrics ---
export type AdDailyMetric = {
  id: string
  campaign_id: string
  date: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  conversions: number
  cpa: number
  revenue: number
  roas: number
  landing_views: number
  add_to_cart: number
  checkouts: number
  purchases: number
  search_impression_share: number | null
  created_at: string
}
