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
          stripe_account_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          specialty?: 'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner' | null
          stripe_account_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          specialty?: 'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner' | null
          stripe_account_id?: string | null
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
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
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
    }
  }
}
