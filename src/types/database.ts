export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          order_index: number
          points_reward: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id: string
          order_index?: number
          points_reward?: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          order_index?: number
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      challenge_announcements: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          priority: string | null
          title: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          priority?: string | null
          title: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_announcements_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_materials: {
        Row: {
          challenge_id: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          thumbnail_url: string | null
          title: string
          type: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          thumbnail_url?: string | null
          title: string
          type?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_materials_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_messages: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          user_avatar: string | null
          user_id: string | null
          user_name: string
          user_role: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_messages_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_mission_lists: {
        Row: {
          challenge_id: string
          color: string | null
          created_at: string
          daily_limit: number | null
          icon: string
          id: string
          key: string
          name: string
          order_index: number | null
          validation_type: string | null
        }
        Insert: {
          challenge_id: string
          color?: string | null
          created_at?: string
          daily_limit?: number | null
          icon?: string
          id?: string
          key: string
          name: string
          order_index?: number | null
          validation_type?: string | null
        }
        Update: {
          challenge_id?: string
          color?: string | null
          created_at?: string
          daily_limit?: number | null
          icon?: string
          id?: string
          key?: string
          name?: string
          order_index?: number | null
          validation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_mission_lists_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string
          payment_method: string | null
          payment_status: string | null
          student_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string
          payment_method?: string | null
          payment_status?: string | null
          student_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string
          payment_method?: string | null
          payment_status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "challenge_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_sponsors: {
        Row: {
          category: string
          challenge_id: string
          created_at: string
          discount_code: string | null
          discount_description: string
          id: string
          logo_url: string | null
          name: string
          whatsapp_or_link: string | null
        }
        Insert: {
          category?: string
          challenge_id: string
          created_at?: string
          discount_code?: string | null
          discount_description: string
          id?: string
          logo_url?: string | null
          name: string
          whatsapp_or_link?: string | null
        }
        Update: {
          category?: string
          challenge_id?: string
          created_at?: string
          discount_code?: string | null
          discount_description?: string
          id?: string
          logo_url?: string | null
          name?: string
          whatsapp_or_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_sponsors_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_squads: {
        Row: {
          challenge_id: string
          color_theme: string | null
          created_at: string
          id: string
          motto: string | null
          name: string
        }
        Insert: {
          challenge_id: string
          color_theme?: string | null
          created_at?: string
          id?: string
          motto?: string | null
          name: string
        }
        Update: {
          challenge_id?: string
          color_theme?: string | null
          created_at?: string
          id?: string
          motto?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_squads_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_weeks: {
        Row: {
          bonus_points: number
          challenge_id: string
          end_date: string | null
          id: string
          start_date: string | null
          title: string
          week_number: number
        }
        Insert: {
          bonus_points?: number
          challenge_id: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          title: string
          week_number: number
        }
        Update: {
          bonus_points?: number
          challenge_id?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_weeks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          end_date: string
          id: string
          is_active: boolean
          price: number
          professional_id: string
          start_date: string
          title: string
        }
        Insert: {
          end_date: string
          id?: string
          is_active?: boolean
          price?: number
          professional_id: string
          start_date: string
          title: string
        }
        Update: {
          end_date?: string
          id?: string
          is_active?: boolean
          price?: number
          professional_id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          instagram: string | null
          lead_type: string | null
          name: string
          role: string
          status: string | null
          students_range: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          instagram?: string | null
          lead_type?: string | null
          name: string
          role?: string
          status?: string | null
          students_range?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          instagram?: string | null
          lead_type?: string | null
          name?: string
          role?: string
          status?: string | null
          students_range?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      freeze_shield_logs: {
        Row: {
          activated_at: string
          challenge_id: string
          id: string
          reason: string | null
          shield_date: string
          student_id: string
        }
        Insert: {
          activated_at?: string
          challenge_id: string
          id?: string
          reason?: string | null
          shield_date?: string
          student_id: string
        }
        Update: {
          activated_at?: string
          challenge_id?: string
          id?: string
          reason?: string | null
          shield_date?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freeze_shield_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freeze_shield_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "freeze_shield_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_history: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          rank_position: number
          recorded_date: string
          student_id: string
          total_points: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          rank_position: number
          recorded_date?: string
          student_id: string
          total_points: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          rank_position?: number
          recorded_date?: string
          student_id?: string
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_history_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_standings: {
        Row: {
          challenge_id: string
          id: string
          student_id: string
          total_points: number
        }
        Insert: {
          challenge_id: string
          id?: string
          student_id: string
          total_points?: number
        }
        Update: {
          challenge_id?: string
          id?: string
          student_id?: string
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_standings_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_standings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "leaderboard_standings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          category: string | null
          challenge_id: string
          cooldown_hours: number | null
          daily_limit: number | null
          id: string
          is_bonus: boolean | null
          list_id: string | null
          order_index: number | null
          points_rewarded: number
          requires_cooldown: boolean | null
          target_frequency: number | null
          title: string
          validation_type: string | null
          week_id: string | null
        }
        Insert: {
          category?: string | null
          challenge_id: string
          cooldown_hours?: number | null
          daily_limit?: number | null
          id?: string
          is_bonus?: boolean | null
          list_id?: string | null
          order_index?: number | null
          points_rewarded: number
          requires_cooldown?: boolean | null
          target_frequency?: number | null
          title: string
          validation_type?: string | null
          week_id?: string | null
        }
        Update: {
          category?: string | null
          challenge_id?: string
          cooldown_hours?: number | null
          daily_limit?: number | null
          id?: string
          is_bonus?: boolean | null
          list_id?: string | null
          order_index?: number | null
          points_rewarded?: number
          requires_cooldown?: boolean | null
          target_frequency?: number | null
          title?: string
          validation_type?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "challenge_mission_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "challenge_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_box_rewards: {
        Row: {
          challenge_id: string | null
          created_at: string
          description: string
          id: string
          probability_weight: number
          rarity: string
          reward_type: string
          reward_value: string | null
          title: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          description: string
          id?: string
          probability_weight?: number
          rarity?: string
          reward_type: string
          reward_value?: string | null
          title: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          description?: string
          id?: string
          probability_weight?: number
          rarity?: string
          reward_type?: string
          reward_value?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_rewards_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          asaas_payment_id: string | null
          billing_type: string | null
          challenge_id: string | null
          created_at: string
          fee_platform_value: number
          gross_value: number
          id: string
          net_coach_value: number
          paid_at: string | null
          pix_code: string | null
          pix_qr_url: string | null
          professional_id: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          asaas_payment_id?: string | null
          billing_type?: string | null
          challenge_id?: string | null
          created_at?: string
          fee_platform_value: number
          gross_value: number
          id?: string
          net_coach_value: number
          paid_at?: string | null
          pix_code?: string | null
          pix_qr_url?: string | null
          professional_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          asaas_payment_id?: string | null
          billing_type?: string | null
          challenge_id?: string | null
          created_at?: string
          fee_platform_value?: number
          gross_value?: number
          id?: string
          net_coach_value?: number
          paid_at?: string | null
          pix_code?: string | null
          pix_qr_url?: string | null
          professional_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_ad_spend: {
        Row: {
          amount: number
          campaign_name: string | null
          created_at: string
          id: string
          notes: string | null
          platform: string
          spend_date: string
        }
        Insert: {
          amount: number
          campaign_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string
          spend_date: string
        }
        Update: {
          amount?: number
          campaign_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string
          spend_date?: string
        }
        Relationships: []
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
        Relationships: []
      }
      professionals: {
        Row: {
          address: string | null
          address_number: string | null
          asaas_customer_id: string | null
          asaas_pix_key: string | null
          asaas_subaccount_api_key: string | null
          asaas_subscription_id: string | null
          asaas_wallet_id: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          current_period_end: string | null
          document_number: string | null
          document_type: string | null
          full_name: string
          id: string
          instagram: string | null
          is_master_admin: boolean | null
          phone: string | null
          plan_cycle: string | null
          plan_status: string | null
          plan_tier: string | null
          platform_fee_percent: number | null
          postal_code: string | null
          province: string | null
          specialty: string | null
          state: string | null
          stripe_account_id: string | null
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          asaas_customer_id?: string | null
          asaas_pix_key?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subscription_id?: string | null
          asaas_wallet_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          current_period_end?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name: string
          id: string
          instagram?: string | null
          is_master_admin?: boolean | null
          phone?: string | null
          plan_cycle?: string | null
          plan_status?: string | null
          plan_tier?: string | null
          platform_fee_percent?: number | null
          postal_code?: string | null
          province?: string | null
          specialty?: string | null
          state?: string | null
          stripe_account_id?: string | null
        }
        Update: {
          address?: string | null
          address_number?: string | null
          asaas_customer_id?: string | null
          asaas_pix_key?: string | null
          asaas_subaccount_api_key?: string | null
          asaas_subscription_id?: string | null
          asaas_wallet_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          current_period_end?: string | null
          document_number?: string | null
          document_type?: string | null
          full_name?: string
          id?: string
          instagram?: string | null
          is_master_admin?: boolean | null
          phone?: string | null
          plan_cycle?: string | null
          plan_status?: string | null
          plan_tier?: string | null
          platform_fee_percent?: number | null
          postal_code?: string | null
          province?: string | null
          specialty?: string | null
          state?: string | null
          stripe_account_id?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          resource_path: string | null
          severity: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          resource_path?: string | null
          severity: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resource_path?: string | null
          severity?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string
          squad_id: string
          student_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string
          squad_id: string
          student_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string
          squad_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "challenge_squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squad_standings"
            referencedColumns: ["squad_id"]
          },
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "squad_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          challenge_id: string
          id: string
          student_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          challenge_id: string
          id?: string
          student_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          challenge_id?: string
          id?: string
          student_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_gamification_state: {
        Row: {
          best_streak: number
          challenge_id: string
          created_at: string
          current_streak: number
          freeze_shields_available: number
          freeze_shields_used: number
          id: string
          last_freeze_used_at: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          best_streak?: number
          challenge_id: string
          created_at?: string
          current_streak?: number
          freeze_shields_available?: number
          freeze_shields_used?: number
          id?: string
          last_freeze_used_at?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          best_streak?: number
          challenge_id?: string
          created_at?: string
          current_streak?: number
          freeze_shields_available?: number
          freeze_shields_used?: number
          id?: string
          last_freeze_used_at?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_gamification_state_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_gamification_state_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_gamification_state_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_mystery_box_claims: {
        Row: {
          challenge_id: string
          claimed_at: string
          id: string
          reward_id: string | null
          reward_title: string
          reward_type: string
          reward_value: string | null
          student_id: string
          week_number: number
        }
        Insert: {
          challenge_id: string
          claimed_at?: string
          id?: string
          reward_id?: string | null
          reward_title: string
          reward_type: string
          reward_value?: string | null
          student_id: string
          week_number: number
        }
        Update: {
          challenge_id?: string
          claimed_at?: string
          id?: string
          reward_id?: string | null
          reward_title?: string
          reward_type?: string
          reward_value?: string | null
          student_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_mystery_box_claims_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_mystery_box_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "mystery_box_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_mystery_box_claims_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_mystery_box_claims_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          student_id: string
          title: string
          type: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          student_id: string
          title: string
          type: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          student_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_submissions: {
        Row: {
          caption: string | null
          challenge_id: string | null
          client_captured_at: string | null
          duration_seconds: number | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          mission_id: string
          photo_url: string | null
          status: string | null
          student_id: string
          submitted_at: string
          text_response: string | null
        }
        Insert: {
          caption?: string | null
          challenge_id?: string | null
          client_captured_at?: string | null
          duration_seconds?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mission_id: string
          photo_url?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string
          text_response?: string | null
        }
        Update: {
          caption?: string | null
          challenge_id?: string | null
          client_captured_at?: string | null
          duration_seconds?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mission_id?: string
          photo_url?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string
          text_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_transformation_vault: {
        Row: {
          after_notes: string | null
          after_photo_url: string | null
          after_submitted_at: string | null
          after_weight_kg: number | null
          before_notes: string | null
          before_photo_url: string | null
          before_submitted_at: string | null
          before_weight_kg: number | null
          challenge_id: string
          created_at: string
          id: string
          is_completed: boolean
          is_public_story_approved: boolean
          is_revealed: boolean
          student_id: string
          updated_at: string
        }
        Insert: {
          after_notes?: string | null
          after_photo_url?: string | null
          after_submitted_at?: string | null
          after_weight_kg?: number | null
          before_notes?: string | null
          before_photo_url?: string | null
          before_submitted_at?: string | null
          before_weight_kg?: number | null
          challenge_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          is_public_story_approved?: boolean
          is_revealed?: boolean
          student_id: string
          updated_at?: string
        }
        Update: {
          after_notes?: string | null
          after_photo_url?: string | null
          after_submitted_at?: string | null
          after_weight_kg?: number | null
          before_notes?: string | null
          before_photo_url?: string | null
          before_submitted_at?: string | null
          before_weight_kg?: number | null
          challenge_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          is_public_story_approved?: boolean
          is_revealed?: boolean
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_transformation_vault_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transformation_vault_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_transformation_vault_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      submission_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          student_id: string
          submission_id: string
          user_avatar: string | null
          user_id: string | null
          user_name: string
          user_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          student_id: string
          submission_id: string
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          student_id?: string
          submission_id?: string
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "submission_comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_likes: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          student_id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          student_id: string
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          student_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_likes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "submission_likes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_likes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_likes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_student_id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string
          reporter_student_id: string
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_student_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_reports_reporter_student_id_fkey"
            columns: ["reporter_student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "submission_reports_reporter_student_id_fkey"
            columns: ["reporter_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_reports_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_reports_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          asaas_transfer_id: string | null
          created_at: string
          id: string
          pix_key: string
          professional_id: string
          status: string
        }
        Insert: {
          amount: number
          asaas_transfer_id?: string | null
          created_at?: string
          id?: string
          pix_key: string
          professional_id: string
          status?: string
        }
        Update: {
          amount?: number
          asaas_transfer_id?: string | null
          created_at?: string
          id?: string
          pix_key?: string
          professional_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      at_risk_students_view: {
        Row: {
          challenge_id: string | null
          challenge_title: string | null
          days_inactive: number | null
          last_activity_at: string | null
          student_id: string | null
          student_name: string | null
          student_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_standings: {
        Row: {
          challenge_id: string | null
          color_theme: string | null
          motto: string | null
          squad_average_points: number | null
          squad_id: string | null
          squad_name: string | null
          squad_total_points: number | null
          total_members: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_squads_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          challenge_id: string | null
          color_theme: string | null
          created_at: string | null
          id: string | null
          motto: string | null
          name: string | null
        }
        Insert: {
          challenge_id?: string | null
          color_theme?: string | null
          created_at?: string | null
          id?: string | null
          motto?: string | null
          name?: string | null
        }
        Update: {
          challenge_id?: string | null
          color_theme?: string | null
          created_at?: string | null
          id?: string | null
          motto?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_squads_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          caption: string | null
          challenge_id: string | null
          client_captured_at: string | null
          id: string | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          mission_id: string | null
          photo_url: string | null
          status: string | null
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          caption?: string | null
          challenge_id?: string | null
          client_captured_at?: string | null
          id?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mission_id?: string | null
          photo_url?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          caption?: string | null
          challenge_id?: string | null
          client_captured_at?: string | null
          id?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mission_id?: string | null
          photo_url?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "at_risk_students_view"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      seed_default_mission_lists: {
        Args: { p_challenge_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
