// Generated from supabase/migrations/0001_init.sql
// Run `npx supabase gen types typescript --project-id oigtfxmhdugpjccgbffo --schema public > src/lib/supabase/types.ts` to regenerate.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          role: "owner" | "editor"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "owner" | "editor"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "owner" | "editor"
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          email: string
          first_name: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          send_day: number
          send_hour: number
          send_minute: number
          timezone: string
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          send_day?: number
          send_hour?: number
          send_minute?: number
          timezone?: string
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          send_day?: number
          send_hour?: number
          send_minute?: number
          timezone?: string
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          member_id: string
          partner_first_name: string
          years_together: number | null
          partner_birthday: string | null
          anniversary_date: string | null
          budget_tier: Database["public"]["Enums"]["budget_tier"]
          kids: Json
          has_childcare: boolean
          city_type: Database["public"]["Enums"]["city_type"] | null
          love_language: Database["public"]["Enums"]["love_language"] | null
          free_context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          partner_first_name: string
          years_together?: number | null
          partner_birthday?: string | null
          anniversary_date?: string | null
          budget_tier?: Database["public"]["Enums"]["budget_tier"]
          kids?: Json
          has_childcare?: boolean
          city_type?: Database["public"]["Enums"]["city_type"] | null
          love_language?: Database["public"]["Enums"]["love_language"] | null
          free_context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          partner_first_name?: string
          years_together?: number | null
          partner_birthday?: string | null
          anniversary_date?: string | null
          budget_tier?: Database["public"]["Enums"]["budget_tier"]
          kids?: Json
          has_childcare?: boolean
          city_type?: Database["public"]["Enums"]["city_type"] | null
          love_language?: Database["public"]["Enums"]["love_language"] | null
          free_context?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          slug: string
          label: string
          family: Database["public"]["Enums"]["tag_family"]
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          family: Database["public"]["Enums"]["tag_family"]
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          family?: Database["public"]["Enums"]["tag_family"]
          created_at?: string
        }
      }
      couple_tags: {
        Row: {
          couple_id: string
          tag_id: string
          kind: Database["public"]["Enums"]["couple_tag_kind"]
        }
        Insert: {
          couple_id: string
          tag_id: string
          kind: Database["public"]["Enums"]["couple_tag_kind"]
        }
        Update: {
          couple_id?: string
          tag_id?: string
          kind?: Database["public"]["Enums"]["couple_tag_kind"]
        }
      }
      occasions: {
        Row: {
          id: string
          couple_id: string
          kind: Database["public"]["Enums"]["occasion_kind"]
          label: string | null
          date: string
          recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          kind: Database["public"]["Enums"]["occasion_kind"]
          label?: string | null
          date: string
          recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          kind?: Database["public"]["Enums"]["occasion_kind"]
          label?: string | null
          date?: string
          recurring?: boolean
          created_at?: string
        }
      }
      attentions: {
        Row: {
          id: string
          category: Database["public"]["Enums"]["attention_category"]
          title: string
          base_text: string
          effort: Database["public"]["Enums"]["effort_level"]
          budget_tier: Database["public"]["Enums"]["budget_tier"]
          months: number[]
          occasions: Database["public"]["Enums"]["occasion_kind"][]
          requires_childcare: boolean
          requires_big_city: boolean
          requires_car: boolean
          url: string | null
          status: Database["public"]["Enums"]["attention_status"]
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: Database["public"]["Enums"]["attention_category"]
          title: string
          base_text: string
          effort?: Database["public"]["Enums"]["effort_level"]
          budget_tier?: Database["public"]["Enums"]["budget_tier"]
          months?: number[]
          occasions?: Database["public"]["Enums"]["occasion_kind"][]
          requires_childcare?: boolean
          requires_big_city?: boolean
          requires_car?: boolean
          url?: string | null
          status?: Database["public"]["Enums"]["attention_status"]
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: Database["public"]["Enums"]["attention_category"]
          title?: string
          base_text?: string
          effort?: Database["public"]["Enums"]["effort_level"]
          budget_tier?: Database["public"]["Enums"]["budget_tier"]
          months?: number[]
          occasions?: Database["public"]["Enums"]["occasion_kind"][]
          requires_childcare?: boolean
          requires_big_city?: boolean
          requires_car?: boolean
          url?: string | null
          status?: Database["public"]["Enums"]["attention_status"]
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attention_tags: {
        Row: {
          attention_id: string
          tag_id: string
          kind: Database["public"]["Enums"]["attention_tag_kind"]
        }
        Insert: {
          attention_id: string
          tag_id: string
          kind: Database["public"]["Enums"]["attention_tag_kind"]
        }
        Update: {
          attention_id?: string
          tag_id?: string
          kind?: Database["public"]["Enums"]["attention_tag_kind"]
        }
      }
      weekly_batches: {
        Row: {
          id: string
          member_id: string
          week_start: string
          generated_at: string
          reviewed_at: string | null
          sent_at: string | null
          opened_at: string | null
          reminder_sent_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          week_start: string
          generated_at?: string
          reviewed_at?: string | null
          sent_at?: string | null
          opened_at?: string | null
          reminder_sent_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          week_start?: string
          generated_at?: string
          reviewed_at?: string | null
          sent_at?: string | null
          opened_at?: string | null
          reminder_sent_at?: string | null
        }
      }
      batch_items: {
        Row: {
          id: string
          batch_id: string
          attention_id: string
          category: Database["public"]["Enums"]["attention_category"]
          personalized_text: string
          done_token: string
          done_token_expires_at: string
          done_at: string | null
          reaction: Database["public"]["Enums"]["reaction"] | null
          note: string | null
        }
        Insert: {
          id?: string
          batch_id: string
          attention_id: string
          category: Database["public"]["Enums"]["attention_category"]
          personalized_text: string
          done_token: string
          done_token_expires_at: string
          done_at?: string | null
          reaction?: Database["public"]["Enums"]["reaction"] | null
          note?: string | null
        }
        Update: {
          id?: string
          batch_id?: string
          attention_id?: string
          category?: Database["public"]["Enums"]["attention_category"]
          personalized_text?: string
          done_token?: string
          done_token_expires_at?: string
          done_at?: string | null
          reaction?: Database["public"]["Enums"]["reaction"] | null
          note?: string | null
        }
      }
    }
    Enums: {
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "incomplete"
      attention_category: "de_toi" | "materiel" | "moment_a_deux"
      effort_level: "leger" | "moyen" | "lourd"
      budget_tier: "zero" | "moins_20" | "20_50" | "50_150" | "plus_150"
      attention_status: "draft" | "published" | "retired"
      occasion_kind: "anniversaire" | "rencontre" | "mariage" | "saint_valentin" | "fete_des_meres" | "noel" | "rentree" | "autre"
      tag_family: "interest" | "constraint" | "avoid"
      couple_tag_kind: "loves" | "avoids"
      attention_tag_kind: "fits" | "avoid"
      city_type: "grande_ville" | "periurbain" | "campagne"
      love_language: "mots" | "temps" | "cadeaux" | "services" | "contact"
      reaction: "adore" | "contente" | "neutre" | "rate"
    }
  }
}
