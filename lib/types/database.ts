export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Role types for the application
export type UserRoleType = 'admin' | 'cofounder' | 'worker' | 'provider'

// Vertical slugs
export type VerticalSlug = 'a2g-company' | 'audesign' | 'a2g-talents'

// Booking statuses
export type BookingStatus = 'inquiry' | 'negotiation' | 'confirmed' | 'contract_sent' | 'contract_signed' | 'completed' | 'cancelled'

// Payment statuses
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'overdue'

// Report statuses
export type ReportStatus = 'draft' | 'submitted' | 'reviewed' | 'approved'

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
          role_type: UserRoleType
          department: string | null
          vertical: string | null
          default_company_id: string | null
          preferences: Json
          invited_by: string | null
          invited_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          role_type?: UserRoleType
          department?: string | null
          vertical?: string | null
          default_company_id?: string | null
          preferences?: Json
          invited_by?: string | null
          invited_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          role_type?: UserRoleType
          department?: string | null
          vertical?: string | null
          default_company_id?: string | null
          preferences?: Json
          invited_by?: string | null
          invited_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      verticals: {
        Row: {
          id: string
          name: string
          slug: VerticalSlug
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: VerticalSlug
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: VerticalSlug
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_vertical_permissions: {
        Row: {
          id: string
          user_id: string
          vertical_id: string
          can_view: boolean
          can_edit: boolean
          can_delete: boolean
          can_manage_users: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vertical_id: string
          can_view?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vertical_id?: string
          can_view?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role_type: UserRoleType
          vertical_ids: string[]
          department: string | null
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role_type?: UserRoleType
          vertical_ids?: string[]
          department?: string | null
          invited_by: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role_type?: UserRoleType
          vertical_ids?: string[]
          department?: string | null
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          stage_name: string | null
          email: string | null
          phone: string | null
          photo_url: string | null
          bio: string | null
          contract_start_date: string | null
          contract_end_date: string | null
          contract_type: string | null
          contract_document_url: string | null
          commission_percentage: number
          manager_name: string | null
          manager_email: string | null
          manager_phone: string | null
          agent_name: string | null
          agent_email: string | null
          agent_phone: string | null
          spotify_url: string | null
          instagram_url: string | null
          soundcloud_url: string | null
          youtube_url: string | null
          website_url: string | null
          rider_document_url: string | null
          tech_requirements: Json
          status: 'active' | 'inactive' | 'pending' | 'archived'
          genres: string[]
          tags: string[]
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          stage_name?: string | null
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          bio?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          contract_type?: string | null
          contract_document_url?: string | null
          commission_percentage?: number
          manager_name?: string | null
          manager_email?: string | null
          manager_phone?: string | null
          agent_name?: string | null
          agent_email?: string | null
          agent_phone?: string | null
          spotify_url?: string | null
          instagram_url?: string | null
          soundcloud_url?: string | null
          youtube_url?: string | null
          website_url?: string | null
          rider_document_url?: string | null
          tech_requirements?: Json
          status?: 'active' | 'inactive' | 'pending' | 'archived'
          genres?: string[]
          tags?: string[]
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          stage_name?: string | null
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          bio?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          contract_type?: string | null
          contract_document_url?: string | null
          commission_percentage?: number
          manager_name?: string | null
          manager_email?: string | null
          manager_phone?: string | null
          agent_name?: string | null
          agent_email?: string | null
          agent_phone?: string | null
          spotify_url?: string | null
          instagram_url?: string | null
          soundcloud_url?: string | null
          youtube_url?: string | null
          website_url?: string | null
          rider_document_url?: string | null
          tech_requirements?: Json
          status?: 'active' | 'inactive' | 'pending' | 'archived'
          genres?: string[]
          tags?: string[]
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      artist_bookings: {
        Row: {
          id: string
          artist_id: string
          event_name: string
          event_type: 'festival' | 'club' | 'private' | 'corporate' | 'other' | null
          event_date: string
          event_time: string | null
          event_end_date: string | null
          set_duration_minutes: number | null
          venue_name: string | null
          venue_address: string | null
          venue_city: string | null
          venue_country: string | null
          venue_capacity: number | null
          fee_amount: number | null
          fee_currency: string
          deposit_amount: number | null
          deposit_paid: boolean
          deposit_paid_date: string | null
          final_payment_amount: number | null
          final_payment_paid: boolean
          final_payment_date: string | null
          payment_status: PaymentStatus
          commission_percentage: number | null
          commission_amount: number | null
          travel_included: boolean
          accommodation_included: boolean
          estimated_expenses: number | null
          actual_expenses: number | null
          promoter_name: string | null
          promoter_email: string | null
          promoter_phone: string | null
          promoter_company: string | null
          contract_url: string | null
          invoice_url: string | null
          booking_status: BookingStatus
          cancellation_reason: string | null
          notes: string | null
          internal_notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          artist_id: string
          event_name: string
          event_type?: 'festival' | 'club' | 'private' | 'corporate' | 'other' | null
          event_date: string
          event_time?: string | null
          event_end_date?: string | null
          set_duration_minutes?: number | null
          venue_name?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_country?: string | null
          venue_capacity?: number | null
          fee_amount?: number | null
          fee_currency?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_paid_date?: string | null
          final_payment_amount?: number | null
          final_payment_paid?: boolean
          final_payment_date?: string | null
          payment_status?: PaymentStatus
          commission_percentage?: number | null
          commission_amount?: number | null
          travel_included?: boolean
          accommodation_included?: boolean
          estimated_expenses?: number | null
          actual_expenses?: number | null
          promoter_name?: string | null
          promoter_email?: string | null
          promoter_phone?: string | null
          promoter_company?: string | null
          contract_url?: string | null
          invoice_url?: string | null
          booking_status?: BookingStatus
          cancellation_reason?: string | null
          notes?: string | null
          internal_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          artist_id?: string
          event_name?: string
          event_type?: 'festival' | 'club' | 'private' | 'corporate' | 'other' | null
          event_date?: string
          event_time?: string | null
          event_end_date?: string | null
          set_duration_minutes?: number | null
          venue_name?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_country?: string | null
          venue_capacity?: number | null
          fee_amount?: number | null
          fee_currency?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_paid_date?: string | null
          final_payment_amount?: number | null
          final_payment_paid?: boolean
          final_payment_date?: string | null
          payment_status?: PaymentStatus
          commission_percentage?: number | null
          commission_amount?: number | null
          travel_included?: boolean
          accommodation_included?: boolean
          estimated_expenses?: number | null
          actual_expenses?: number | null
          promoter_name?: string | null
          promoter_email?: string | null
          promoter_phone?: string | null
          promoter_company?: string | null
          contract_url?: string | null
          invoice_url?: string | null
          booking_status?: BookingStatus
          cancellation_reason?: string | null
          notes?: string | null
          internal_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      music_releases: {
        Row: {
          id: string
          artist_id: string
          title: string
          release_type: 'single' | 'ep' | 'album' | 'remix' | 'compilation'
          release_date: string | null
          label_name: string | null
          catalog_number: string | null
          spotify_url: string | null
          apple_music_url: string | null
          beatport_url: string | null
          soundcloud_url: string | null
          youtube_url: string | null
          cover_art_url: string | null
          status: 'planned' | 'announced' | 'released' | 'cancelled'
          isrc: string | null
          upc: string | null
          genres: string[]
          metadata: Json
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          release_type: 'single' | 'ep' | 'album' | 'remix' | 'compilation'
          release_date?: string | null
          label_name?: string | null
          catalog_number?: string | null
          spotify_url?: string | null
          apple_music_url?: string | null
          beatport_url?: string | null
          soundcloud_url?: string | null
          youtube_url?: string | null
          cover_art_url?: string | null
          status?: 'planned' | 'announced' | 'released' | 'cancelled'
          isrc?: string | null
          upc?: string | null
          genres?: string[]
          metadata?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          release_type?: 'single' | 'ep' | 'album' | 'remix' | 'compilation'
          release_date?: string | null
          label_name?: string | null
          catalog_number?: string | null
          spotify_url?: string | null
          apple_music_url?: string | null
          beatport_url?: string | null
          soundcloud_url?: string | null
          youtube_url?: string | null
          cover_art_url?: string | null
          status?: 'planned' | 'announced' | 'released' | 'cancelled'
          isrc?: string | null
          upc?: string | null
          genres?: string[]
          metadata?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      personal_investments: {
        Row: {
          id: string
          investment_type: 'stocks' | 'crypto' | 'etf' | 'bonds' | 'real_estate' | 'other'
          asset_name: string
          asset_symbol: string | null
          quantity: number | null
          purchase_price: number | null
          purchase_date: string | null
          current_value: number | null
          currency: string
          month_year: string | null
          month_value: number | null
          month_change_percent: number | null
          platform: string | null
          account_reference: string | null
          status: 'active' | 'sold' | 'transferred'
          sold_date: string | null
          sold_price: number | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          investment_type: 'stocks' | 'crypto' | 'etf' | 'bonds' | 'real_estate' | 'other'
          asset_name: string
          asset_symbol?: string | null
          quantity?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          current_value?: number | null
          currency?: string
          month_year?: string | null
          month_value?: number | null
          month_change_percent?: number | null
          platform?: string | null
          account_reference?: string | null
          status?: 'active' | 'sold' | 'transferred'
          sold_date?: string | null
          sold_price?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          investment_type?: 'stocks' | 'crypto' | 'etf' | 'bonds' | 'real_estate' | 'other'
          asset_name?: string
          asset_symbol?: string | null
          quantity?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          current_value?: number | null
          currency?: string
          month_year?: string | null
          month_value?: number | null
          month_change_percent?: number | null
          platform?: string | null
          account_reference?: string | null
          status?: 'active' | 'sold' | 'transferred'
          sold_date?: string | null
          sold_price?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          meeting_date: string
          duration_minutes: number | null
          meeting_type: 'team' | 'board' | 'client' | 'partner' | 'one_on_one' | 'other' | null
          location: string | null
          vertical_id: string | null
          attendees: string[] | null
          organized_by: string | null
          agenda: string | null
          notes: string | null
          summary: string | null
          agreements: Json
          action_items: Json
          attachments: Json
          follow_up_date: string | null
          follow_up_notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          meeting_date: string
          duration_minutes?: number | null
          meeting_type?: 'team' | 'board' | 'client' | 'partner' | 'one_on_one' | 'other' | null
          location?: string | null
          vertical_id?: string | null
          attendees?: string[] | null
          organized_by?: string | null
          agenda?: string | null
          notes?: string | null
          summary?: string | null
          agreements?: Json
          action_items?: Json
          attachments?: Json
          follow_up_date?: string | null
          follow_up_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          meeting_date?: string
          duration_minutes?: number | null
          meeting_type?: 'team' | 'board' | 'client' | 'partner' | 'one_on_one' | 'other' | null
          location?: string | null
          vertical_id?: string | null
          attendees?: string[] | null
          organized_by?: string | null
          agenda?: string | null
          notes?: string | null
          summary?: string | null
          agreements?: Json
          action_items?: Json
          attachments?: Json
          follow_up_date?: string | null
          follow_up_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string | null
          description: string | null
          product_type: 'plugin' | 'sample_pack' | 'preset_pack' | 'course' | 'bundle' | 'subscription' | 'other' | null
          price: number
          currency: string
          compare_at_price: number | null
          platform: string | null
          external_product_id: string | null
          product_url: string | null
          status: 'draft' | 'active' | 'archived'
          cover_image_url: string | null
          images: Json
          categories: string[]
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          description?: string | null
          product_type?: 'plugin' | 'sample_pack' | 'preset_pack' | 'course' | 'bundle' | 'subscription' | 'other' | null
          price: number
          currency?: string
          compare_at_price?: number | null
          platform?: string | null
          external_product_id?: string | null
          product_url?: string | null
          status?: 'draft' | 'active' | 'archived'
          cover_image_url?: string | null
          images?: Json
          categories?: string[]
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          description?: string | null
          product_type?: 'plugin' | 'sample_pack' | 'preset_pack' | 'course' | 'bundle' | 'subscription' | 'other' | null
          price?: number
          currency?: string
          compare_at_price?: number | null
          platform?: string | null
          external_product_id?: string | null
          product_url?: string | null
          status?: 'draft' | 'active' | 'archived'
          cover_image_url?: string | null
          images?: Json
          categories?: string[]
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      product_sales: {
        Row: {
          id: string
          product_id: string | null
          order_id: string | null
          order_date: string
          customer_email_hash: string | null
          customer_country: string | null
          sale_price: number
          currency: string
          platform_fees: number
          net_revenue: number | null
          refunded: boolean
          refund_date: string | null
          refund_reason: string | null
          source: string | null
          campaign_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          order_id?: string | null
          order_date: string
          customer_email_hash?: string | null
          customer_country?: string | null
          sale_price: number
          currency?: string
          platform_fees?: number
          net_revenue?: number | null
          refunded?: boolean
          refund_date?: string | null
          refund_reason?: string | null
          source?: string | null
          campaign_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          order_id?: string | null
          order_date?: string
          customer_email_hash?: string | null
          customer_country?: string | null
          sale_price?: number
          currency?: string
          platform_fees?: number
          net_revenue?: number | null
          refunded?: boolean
          refund_date?: string | null
          refund_reason?: string | null
          source?: string | null
          campaign_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      audesign_metrics: {
        Row: {
          id: string
          month_year: string
          total_revenue: number
          total_sales: number
          aov: number
          refund_count: number
          refund_amount: number
          refund_rate: number
          mrr: number
          new_subscribers: number
          churned_subscribers: number
          churn_rate: number
          ltv: number
          ad_spend: number
          roas: number
          cac: number
          website_visits: number
          conversion_rate: number
          revenue_by_product: Json
          sales_by_product: Json
          revenue_by_channel: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          month_year: string
          total_revenue?: number
          total_sales?: number
          aov?: number
          refund_count?: number
          refund_amount?: number
          refund_rate?: number
          mrr?: number
          new_subscribers?: number
          churned_subscribers?: number
          churn_rate?: number
          ltv?: number
          ad_spend?: number
          roas?: number
          cac?: number
          website_visits?: number
          conversion_rate?: number
          revenue_by_product?: Json
          sales_by_product?: Json
          revenue_by_channel?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          month_year?: string
          total_revenue?: number
          total_sales?: number
          aov?: number
          refund_count?: number
          refund_amount?: number
          refund_rate?: number
          mrr?: number
          new_subscribers?: number
          churned_subscribers?: number
          churn_rate?: number
          ltv?: number
          ad_spend?: number
          roas?: number
          cac?: number
          website_visits?: number
          conversion_rate?: number
          revenue_by_product?: Json
          sales_by_product?: Json
          revenue_by_channel?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          slug: string
          vertical_id: string | null
          report_fields: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          vertical_id?: string | null
          report_fields?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          vertical_id?: string | null
          report_fields?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      monthly_reports: {
        Row: {
          id: string
          month_year: string
          department_id: string
          vertical_id: string | null
          submitted_by: string
          submitted_at: string
          report_data: Json
          status: ReportStatus
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          month_year: string
          department_id: string
          vertical_id?: string | null
          submitted_by: string
          submitted_at?: string
          report_data?: Json
          status?: ReportStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          month_year?: string
          department_id?: string
          vertical_id?: string | null
          submitted_by?: string
          submitted_at?: string
          report_data?: Json
          status?: ReportStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      csv_imports: {
        Row: {
          id: string
          filename: string
          file_size: number | null
          import_type: string
          vertical_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          rows_total: number
          rows_imported: number
          rows_failed: number
          errors: Json
          imported_by: string
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          file_size?: number | null
          import_type: string
          vertical_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          rows_total?: number
          rows_imported?: number
          rows_failed?: number
          errors?: Json
          imported_by: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          file_size?: number | null
          import_type?: string
          vertical_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          rows_total?: number
          rows_imported?: number
          rows_failed?: number
          errors?: Json
          imported_by?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
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
      a2g_talents_summary: {
        Row: {
          artist_id: string
          artist_name: string
          commission_percentage: number
          total_bookings: number
          confirmed_bookings: number
          completed_bookings: number
          total_fees: number
          total_commissions: number
          total_expenses: number
        }
      }
      audesign_monthly_summary: {
        Row: {
          month_year: string
          total_orders: number
          gross_revenue: number
          net_revenue: number
          aov: number
          refunds: number
          refund_amount: number
        }
      }
    }
  }
}

// Export convenience types
export type Company = Database['public']['Tables']['companies']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Vertical = Database['public']['Tables']['verticals']['Row']
export type UserVerticalPermission = Database['public']['Tables']['user_vertical_permissions']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']
export type Artist = Database['public']['Tables']['artists']['Row']
export type ArtistBooking = Database['public']['Tables']['artist_bookings']['Row']
export type MusicRelease = Database['public']['Tables']['music_releases']['Row']
export type PersonalInvestment = Database['public']['Tables']['personal_investments']['Row']
export type Meeting = Database['public']['Tables']['meetings']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductSale = Database['public']['Tables']['product_sales']['Row']
export type AudesignMetrics = Database['public']['Tables']['audesign_metrics']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type MonthlyReport = Database['public']['Tables']['monthly_reports']['Row']
export type CsvImport = Database['public']['Tables']['csv_imports']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type KPI = Database['public']['Tables']['kpis_extracted']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type MarketingCampaign = Database['public']['Tables']['marketing_campaigns']['Row']
export type FinancialSummary = Database['public']['Views']['company_financial_summary']['Row']
export type TalentsSummary = Database['public']['Views']['a2g_talents_summary']['Row']
export type AudesignMonthlySummary = Database['public']['Views']['audesign_monthly_summary']['Row']

// Report field definition type
export interface ReportFieldDefinition {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'currency' | 'percentage' | 'date'
  required: boolean
  placeholder?: string
}

// Action item type for meetings
export interface ActionItem {
  task: string
  assigned_to: string
  due_date: string
  completed: boolean
}

// Agreement type for meetings
export interface Agreement {
  text: string
  assigned_to?: string
  due_date?: string
}
