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
      professionals: {
        Row: {
          id: string
          full_name: string
          specialty: 'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner' | null
          phone: string | null
          bio: string | null
          instagram: string | null
          avatar_url: string | null
          stripe_account_id: string | null
          document_type: 'CPF' | 'CNPJ' | null
          document_number: string | null
          plan_tier: 'starter' | 'pro' | 'studio'
          plan_status: 'active' | 'past_due' | 'canceled'
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          asaas_wallet_id: string | null
          asaas_pix_key: string | null
          plan_cycle: string | null
          current_period_end: string | null
          birth_date: string | null
          postal_code: string | null
          address: string | null
          address_number: string | null
          province: string | null
          city: string | null
          state: string | null
          platform_fee_percent: number
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          specialty?: 'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner' | null
          phone?: string | null
          bio?: string | null
          instagram?: string | null
          avatar_url?: string | null
          stripe_account_id?: string | null
          document_type?: 'CPF' | 'CNPJ' | null
          document_number?: string | null
          plan_tier?: 'starter' | 'pro' | 'studio'
          plan_status?: 'active' | 'past_due' | 'canceled'
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          asaas_wallet_id?: string | null
          asaas_pix_key?: string | null
          plan_cycle?: string | null
          current_period_end?: string | null
          birth_date?: string | null
          postal_code?: string | null
          address?: string | null
          address_number?: string | null
          province?: string | null
          city?: string | null
          state?: string | null
          platform_fee_percent?: number
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          specialty?: 'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner' | null
          phone?: string | null
          bio?: string | null
          instagram?: string | null
          avatar_url?: string | null
          stripe_account_id?: string | null
          document_type?: 'CPF' | 'CNPJ' | null
          document_number?: string | null
          plan_tier?: 'starter' | 'pro' | 'studio'
          plan_status?: 'active' | 'past_due' | 'canceled'
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          asaas_wallet_id?: string | null
          asaas_pix_key?: string | null
          plan_cycle?: string | null
          current_period_end?: string | null
          birth_date?: string | null
          postal_code?: string | null
          address?: string | null
          address_number?: string | null
          province?: string | null
          city?: string | null
          state?: string | null
          platform_fee_percent?: number
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          professional_id: string
          title: string
          start_date: string
          end_date: string
          price: number
          is_active: boolean
        }
        Insert: {
          id?: string
          professional_id: string
          title: string
          start_date: string
          end_date: string
          price?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          professional_id?: string
          title?: string
          start_date?: string
          end_date?: string
          price?: number
          is_active?: boolean
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          phone: string | null
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
        }
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          student_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          student_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          student_id?: string
          joined_at?: string
        }
      }
      missions: {
        Row: {
          id: string
          challenge_id: string
          title: string
          points_rewarded: number
        }
        Insert: {
          id?: string
          challenge_id: string
          title: string
          points_rewarded: number
        }
        Update: {
          id?: string
          challenge_id?: string
          title?: string
          points_rewarded?: number
        }
      }
      student_submissions: {
        Row: {
          id: string
          mission_id: string
          student_id: string
          photo_url: string
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          student_id: string
          photo_url: string
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          student_id?: string
          photo_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
        }
      }
      leaderboard_standings: {
        Row: {
          id: string
          challenge_id: string
          student_id: string
          total_points: number
        }
        Insert: {
          id?: string
          challenge_id: string
          student_id: string
          total_points?: number
        }
        Update: {
          id?: string
          challenge_id?: string
          student_id?: string
          total_points?: number
        }
      }
      payments: {
        Row: {
          id: string
          challenge_id: string | null
          student_id: string | null
          professional_id: string
          asaas_payment_id: string | null
          billing_type: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
          gross_value: number
          net_coach_value: number
          fee_platform_value: number
          status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'REFUNDED' | 'OVERDUE'
          pix_code: string | null
          pix_qr_url: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id?: string | null
          student_id?: string | null
          professional_id: string
          asaas_payment_id?: string | null
          billing_type?: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
          gross_value: number
          net_coach_value: number
          fee_platform_value: number
          status?: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'REFUNDED' | 'OVERDUE'
          pix_code?: string | null
          pix_qr_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string | null
          student_id?: string | null
          professional_id?: string
          asaas_payment_id?: string | null
          billing_type?: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
          gross_value?: number
          net_coach_value?: number
          fee_platform_value?: number
          status?: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'REFUNDED' | 'OVERDUE'
          pix_code?: string | null
          pix_qr_url?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      processed_webhooks: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          professional_id: string
          amount: number
          pix_key: string
          asaas_transfer_id: string
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          error_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          amount: number
          pix_key: string
          asaas_transfer_id: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          error_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          amount?: number
          pix_key?: string
          asaas_transfer_id?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          error_reason?: string | null
          created_at?: string
        }
      }
      coach_leads: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          whatsapp: string
          role: string
          students_range: string
          instagram: string | null
          lead_type: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          whatsapp: string
          role?: string
          students_range: string
          instagram?: string | null
          lead_type?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          whatsapp?: string
          role?: string
          students_range?: string
          instagram?: string | null
          lead_type?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          status?: string
        }
      }
    }
  }
}
