export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: number
          listing_id: number | null
          parent_id: number | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          listing_id?: number | null
          parent_id?: number | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          listing_id?: number | null
          parent_id?: number | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: number
          last_message_at: string | null
          listing_id: number | null
          seller_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: number
          last_message_at?: string | null
          listing_id?: number | null
          seller_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: number
          last_message_at?: string | null
          listing_id?: number | null
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: number
          listing_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          listing_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          listing_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          brand_id: number | null
          category_id: number | null
          child_category_id: number | null
          comments_enabled: boolean | null
          condition: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          gallery_images: Json | null
          id: number
          lat: number | null
          listing_type: string
          lng: number | null
          main_image_url: string | null
          negotiable: boolean | null
          phone_hidden: boolean | null
          price: number
          status: string | null
          subcategory_id: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          address?: string | null
          brand_id?: number | null
          category_id?: number | null
          child_category_id?: number | null
          comments_enabled?: boolean | null
          condition?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          gallery_images?: Json | null
          id?: number
          lat?: number | null
          listing_type: string
          lng?: number | null
          main_image_url?: string | null
          negotiable?: boolean | null
          phone_hidden?: boolean | null
          price: number
          status?: string | null
          subcategory_id?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          address?: string | null
          brand_id?: number | null
          category_id?: number | null
          child_category_id?: number | null
          comments_enabled?: boolean | null
          condition?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          gallery_images?: Json | null
          id?: number
          lat?: number | null
          listing_type?: string
          lng?: number | null
          main_image_url?: string | null
          negotiable?: boolean | null
          phone_hidden?: boolean | null
          price?: number
          status?: string | null
          subcategory_id?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string | null
          id: number
          message_type: string | null
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: number
          identifier: string
          otp_code: string
          purpose: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: number
          identifier: string
          otp_code: string
          purpose: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: number
          identifier?: string
          otp_code?: string
          purpose?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: number
          listing_id: number | null
          payment_method: string | null
          payment_type: string
          purpose: string
          status: string | null
          stripe_payment_intent_id: string | null
          transaction_id: string | null
          transfer_receipt_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: number
          listing_id?: number | null
          payment_method?: string | null
          payment_type: string
          purpose: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          transfer_receipt_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: number
          listing_id?: number | null
          payment_method?: string | null
          payment_type?: string
          purpose?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          transfer_receipt_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          phone: string | null
          updated_at: string | null
          username: string | null
          verified: boolean | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          id: number
          payment_id: number | null
          purpose: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          id?: number
          payment_id?: number | null
          purpose: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          id?: number
          payment_id?: number | null
          purpose?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
