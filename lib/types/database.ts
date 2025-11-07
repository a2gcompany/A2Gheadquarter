export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          type: string
          logo_url: string | null
          primary_color: string | null
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type: string
          logo_url?: string | null
          primary_color?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: string
          logo_url?: string | null
          primary_color?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          default_company_id: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          default_company_id?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          default_company_id?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          company_id: string
          name: string
          account_type: string
          provider: string
          currency: string
          balance: number
          account_number_encrypted: string | null
          last_synced_at: string | null
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          account_type: string
          provider: string
          currency?: string
          balance?: number
          account_number_encrypted?: string | null
          last_synced_at?: string | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          account_type?: string
          provider?: string
          currency?: string
          balance?: number
          account_number_encrypted?: string | null
          last_synced_at?: string | null
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          company_id: string
          transaction_date: string
          description: string
          amount: number
          currency: string
          category: string | null
          subcategory: string | null
          type: string
          merchant_name: string | null
          location_country: string | null
          location_city: string | null
          tags: string[]
          notes: string | null
          receipt_url: string | null
          is_recurring: boolean
          ai_categorized: boolean
          ai_confidence: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          company_id: string
          transaction_date: string
          description: string
          amount: number
          currency?: string
          category?: string | null
          subcategory?: string | null
          type: string
          merchant_name?: string | null
          location_country?: string | null
          location_city?: string | null
          tags?: string[]
          notes?: string | null
          receipt_url?: string | null
          is_recurring?: boolean
          ai_categorized?: boolean
          ai_confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          company_id?: string
          transaction_date?: string
          description?: string
          amount?: number
          currency?: string
          category?: string | null
          subcategory?: string | null
          type?: string
          merchant_name?: string | null
          location_country?: string | null
          location_city?: string | null
          tags?: string[]
          notes?: string | null
          receipt_url?: string | null
          is_recurring?: boolean
          ai_categorized?: boolean
          ai_confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          company_id: string
          uploaded_by: string | null
          filename: string
          file_path: string
          file_size: number
          file_type: string
          mime_type: string
          document_type: string | null
          processing_status: string
          processing_error: string | null
          ai_extracted_data: Json
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          uploaded_by?: string | null
          filename: string
          file_path: string
          file_size: number
          file_type: string
          mime_type: string
          document_type?: string | null
          processing_status?: string
          processing_error?: string | null
          ai_extracted_data?: Json
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          uploaded_by?: string | null
          filename?: string
          file_path?: string
          file_size?: number
          file_type?: string
          mime_type?: string
          document_type?: string | null
          processing_status?: string
          processing_error?: string | null
          ai_extracted_data?: Json
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      kpis_extracted: {
        Row: {
          id: string
          company_id: string
          document_id: string | null
          kpi_type: string
          kpi_name: string
          value: number
          currency: string
          period_start: string | null
          period_end: string | null
          period_type: string | null
          source: string
          confidence: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          document_id?: string | null
          kpi_type: string
          kpi_name: string
          value: number
          currency?: string
          period_start?: string | null
          period_end?: string | null
          period_type?: string | null
          source: string
          confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          document_id?: string | null
          kpi_type?: string
          kpi_name?: string
          value?: number
          currency?: string
          period_start?: string | null
          period_end?: string | null
          period_type?: string | null
          source?: string
          confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company_name: string | null
          job_title: string | null
          contact_type: string
          status: string
          lead_stage: string | null
          lead_score: number
          deal_value: number | null
          deal_currency: string
          tags: string[]
          notes: string | null
          social_links: Json
          last_contact_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          company_id: string
          artist_name: string
          event_name: string
          event_type: string | null
          venue_name: string | null
          venue_country: string | null
          venue_city: string | null
          event_date: string
          event_end_date: string | null
          booking_status: string
          fee_amount: number | null
          fee_currency: string
          commission_rate: number | null
          commission_amount: number | null
          expenses: number
          contact_id: string | null
          contract_url: string | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
      tasks: {
        Row: {
          id: string
          company_id: string
          created_by: string | null
          assigned_to: string | null
          title: string
          description: string | null
          status: string
          priority: string
          project_name: string | null
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
      marketing_campaigns: {
        Row: {
          id: string
          company_id: string
          campaign_name: string
          platform: string
          campaign_type: string | null
          status: string
          start_date: string
          end_date: string | null
          budget: number | null
          spend: number
          revenue: number
          impressions: number
          clicks: number
          conversions: number
          currency: string
          target_audience: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      company_financial_summary: {
        Row: {
          company_id: string
          company_name: string
          total_balance: number
          active_accounts: number
          monthly_income: number
          monthly_expenses: number
          last_updated: string
        }
      }
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type KPI = Database['public']['Tables']['kpis_extracted']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type MarketingCampaign = Database['public']['Tables']['marketing_campaigns']['Row']
export type FinancialSummary = Database['public']['Views']['company_financial_summary']['Row']
