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
      profiles: {
        Row: {
          id: string
          user_id: string
          role: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collection_requests: {
        Row: {
          id: string
          user_id: string
          collector_id: string | null
          status: string
          latitude: number
          longitude: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          collector_id?: string | null
          status?: string
          latitude: number
          longitude: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          collector_id?: string | null
          status?: string
          latitude?: number
          longitude?: number
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}