export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string; name: string; monthly_price: number;
          order_limit: number; expense_limit: number; product_limit: number;
          quotation_limit: number; inventory_limit: number;
          storage_limit_mb: number;
          courier_accounts: number; whatsapp_templates: number; team_members: number;
          bulk_import: boolean; activity_log: boolean;
          smart_automation: boolean; ai_assistant: boolean;
          features: Json; is_active: boolean;
          sort_order: number; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; name: string; monthly_price: number;
          order_limit: number; expense_limit: number; product_limit: number;
          quotation_limit?: number; inventory_limit?: number;
          storage_limit_mb?: number;
          courier_accounts?: number; whatsapp_templates?: number; team_members?: number;
          bulk_import?: boolean; activity_log?: boolean;
          smart_automation?: boolean; ai_assistant?: boolean;
          features?: Json; is_active?: boolean;
          sort_order?: number; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; name?: string; monthly_price?: number;
          order_limit?: number; expense_limit?: number; product_limit?: number;
          quotation_limit?: number; inventory_limit?: number;
          storage_limit_mb?: number;
          courier_accounts?: number; whatsapp_templates?: number; team_members?: number;
          bulk_import?: boolean; activity_log?: boolean;
          smart_automation?: boolean; ai_assistant?: boolean;
          features?: Json; is_active?: boolean;
          sort_order?: number; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string; owner_id: string; name: string; type: string | null;
          phone: string | null; district: string | null; address: string | null;
          logo_url: string | null; theme_prefs: Json; plan_id: string | null;
          account_status: "trial" | "trial_expired" | "pending_payment" | "active" | "expired" | "suspended" | "archived" | "deleted";
          trial_started_at: string | null; trial_ends_at: string | null;
          subscription_started_at: string | null; subscription_ends_at: string | null;
          data_delete_after: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; owner_id: string; name: string; type?: string | null;
          phone?: string | null; district?: string | null; address?: string | null;
          logo_url?: string | null; theme_prefs?: Json; plan_id?: string | null;
          account_status?: "trial" | "trial_expired" | "pending_payment" | "active" | "expired" | "suspended" | "archived" | "deleted";
          trial_started_at?: string | null; trial_ends_at?: string | null;
          subscription_started_at?: string | null; subscription_ends_at?: string | null;
          data_delete_after?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; owner_id?: string; name?: string; type?: string | null;
          phone?: string | null; district?: string | null; address?: string | null;
          logo_url?: string | null; theme_prefs?: Json; plan_id?: string | null;
          account_status?: "trial" | "trial_expired" | "pending_payment" | "active" | "expired" | "suspended" | "archived" | "deleted";
          trial_started_at?: string | null; trial_ends_at?: string | null;
          subscription_started_at?: string | null; subscription_ends_at?: string | null;
          data_delete_after?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string; user_id: string; business_id: string | null;
          full_name: string; phone: string | null;
          role: "owner" | "admin" | "member";
          avatar_url: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; business_id?: string | null;
          full_name: string; phone?: string | null;
          role?: "owner" | "admin" | "member";
          avatar_url?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; user_id?: string; business_id?: string | null;
          full_name?: string; phone?: string | null;
          role?: "owner" | "admin" | "member";
          avatar_url?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      payment_proofs: {
        Row: {
          id: string; business_id: string; plan_id: string | null;
          amount: number; payment_method: string; proof_image_url: string | null;
          notes: string | null; status: "pending" | "approved" | "rejected";
          admin_note: string | null; approved_by: string | null;
          approved_at: string | null; created_at: string;
        };
        Insert: {
          id?: string; business_id: string; plan_id?: string | null;
          amount: number; payment_method?: string; proof_image_url?: string | null;
          notes?: string | null; status?: "pending" | "approved" | "rejected";
          admin_note?: string | null; approved_by?: string | null;
          approved_at?: string | null; created_at?: string;
        };
        Update: {
          id?: string; business_id?: string; plan_id?: string | null;
          amount?: number; payment_method?: string; proof_image_url?: string | null;
          notes?: string | null; status?: "pending" | "approved" | "rejected";
          admin_note?: string | null; approved_by?: string | null;
          approved_at?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string; business_id: string; name: string; category: string | null;
          size_variant: string | null; selling_price: number; cost_price: number | null;
          profit_margin: number | null; image_url: string | null;
          inventory_item_id: string | null; is_active: boolean;
          created_by: string | null; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; name: string; category?: string | null;
          size_variant?: string | null; selling_price: number; cost_price?: number | null;
          image_url?: string | null; inventory_item_id?: string | null; is_active?: boolean;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; name?: string; category?: string | null;
          size_variant?: string | null; selling_price?: number; cost_price?: number | null;
          image_url?: string | null; inventory_item_id?: string | null; is_active?: boolean;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      price_snapshots: {
        Row: {
          id: string; business_id: string; product_id: string;
          selling_price: number; cost_price: number | null;
          effective_date: string; created_at: string;
        };
        Insert: {
          id?: string; business_id: string; product_id: string;
          selling_price: number; cost_price?: number | null;
          effective_date: string; created_at?: string;
        };
        Update: {
          id?: string; business_id?: string; product_id?: string;
          selling_price?: number; cost_price?: number | null;
          effective_date?: string; created_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string; business_id: string; name: string; category: string | null;
          size_variant: string | null; current_stock: number; unit_cost: number | null;
          supplier: string | null; reorder_level: number;
          last_restocked_at: string | null; created_by: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; name: string; category?: string | null;
          size_variant?: string | null; current_stock?: number; unit_cost?: number | null;
          supplier?: string | null; reorder_level?: number;
          last_restocked_at?: string | null; created_by?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; name?: string; category?: string | null;
          size_variant?: string | null; current_stock?: number; unit_cost?: number | null;
          supplier?: string | null; reorder_level?: number;
          last_restocked_at?: string | null; created_by?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          id: string; business_id: string; inventory_item_id: string;
          type: "stock_in" | "stock_out" | "adjustment";
          quantity: number; unit_cost: number | null;
          reference_type: string | null; reference_id: string | null;
          notes: string | null; created_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; business_id: string; inventory_item_id: string;
          type: "stock_in" | "stock_out" | "adjustment";
          quantity: number; unit_cost?: number | null;
          reference_type?: string | null; reference_id?: string | null;
          notes?: string | null; created_by?: string | null; created_at?: string;
        };
        Update: {
          id?: string; business_id?: string; inventory_item_id?: string;
          type?: "stock_in" | "stock_out" | "adjustment";
          quantity?: number; unit_cost?: number | null;
          reference_type?: string | null; reference_id?: string | null;
          notes?: string | null; created_by?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string; business_id: string; name: string;
          phone: string | null; whatsapp: string | null; email: string | null;
          address: string | null; district: string | null; nearest_city: string | null;
          lifetime_spend: number; total_orders: number; pending_balance: number;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; name: string;
          phone?: string | null; whatsapp?: string | null; email?: string | null;
          address?: string | null; district?: string | null; nearest_city?: string | null;
          lifetime_spend?: number; total_orders?: number; pending_balance?: number;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; name?: string;
          phone?: string | null; whatsapp?: string | null; email?: string | null;
          address?: string | null; district?: string | null; nearest_city?: string | null;
          lifetime_spend?: number; total_orders?: number; pending_balance?: number;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string; business_id: string; order_number: string; customer_id: string | null;
          customer_name: string; customer_phone: string | null; customer_address: string | null;
          customer_district: string | null; customer_city: string | null; customer_whatsapp: string | null;
          customer_email: string | null; expected_delivery_date: string | null; dispatched_date: string | null;
          delivery_charge: number; subtotal: number; discount: number;
          discount_type: "percentage" | "fixed" | null; advance_paid: number;
          balance_remaining: number; total: number;
          waybill_id: string | null;
          payment_method: "cod" | "bank_transfer" | "cash" | "other" | null;
          payment_status: "pending" | "advanced" | "paid";
          status: "new_order" | "ready" | "packed" | "dispatched" | "delivered" | "cancelled" | "returned";
          remarks: string | null; images: Json;
          created_by: string | null; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; order_number: string; customer_id?: string | null;
          customer_name: string; customer_phone?: string | null; customer_address?: string | null;
          customer_district?: string | null; customer_city?: string | null; customer_whatsapp?: string | null;
          customer_email?: string | null; expected_delivery_date?: string | null; dispatched_date?: string | null;
          waybill_id?: string | null;
          delivery_charge?: number; subtotal: number; discount?: number;
          discount_type?: "percentage" | "fixed" | null; advance_paid?: number;
          payment_method?: "cod" | "bank_transfer" | "cash" | "other" | null;
          payment_status?: "pending" | "advanced" | "paid";
          status?: "new_order" | "ready" | "packed" | "dispatched" | "delivered" | "cancelled" | "returned";
          remarks?: string | null; images?: Json;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; order_number?: string; customer_id?: string | null;
          customer_name?: string; customer_phone?: string | null; customer_address?: string | null;
          customer_district?: string | null; customer_city?: string | null; customer_whatsapp?: string | null;
          customer_email?: string | null; expected_delivery_date?: string | null; dispatched_date?: string | null;
          waybill_id?: string | null;
          delivery_charge?: number; subtotal?: number; discount?: number;
          discount_type?: "percentage" | "fixed" | null; advance_paid?: number;
          payment_method?: "cod" | "bank_transfer" | "cash" | "other" | null;
          payment_status?: "pending" | "advanced" | "paid";
          status?: "new_order" | "ready" | "packed" | "dispatched" | "delivered" | "cancelled" | "returned";
          remarks?: string | null; images?: Json;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string; order_id: string; business_id: string; product_id: string | null;
          product_name: string; category: string | null; unit_price: number;
          quantity: number; total_price: number; notes: string | null;
          sort_order: number; created_at: string;
        };
        Insert: {
          id?: string; order_id: string; business_id: string; product_id?: string | null;
          product_name: string; category?: string | null; unit_price: number;
          quantity: number; notes?: string | null; sort_order?: number; created_at?: string;
        };
        Update: {
          id?: string; order_id?: string; business_id?: string; product_id?: string | null;
          product_name?: string; category?: string | null; unit_price?: number;
          quantity?: number; notes?: string | null; sort_order?: number; created_at?: string;
        };
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string; order_id: string; business_id: string;
          from_status: string | null; to_status: string;
          changed_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; order_id: string; business_id: string;
          from_status?: string | null; to_status: string;
          changed_by?: string | null; created_at?: string;
        };
        Update: {
          id?: string; order_id?: string; business_id?: string;
          from_status?: string | null; to_status?: string;
          changed_by?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string; business_id: string; quotation_number: string; customer_id: string | null;
          customer_name: string; customer_phone: string | null; customer_address: string | null;
          customer_whatsapp: string | null; customer_email: string | null;
          expiry_date: string | null; expected_delivery_date: string | null;
          subtotal: number; discount: number; discount_type: "percentage" | "fixed" | null;
          delivery_charge: number; grand_total: number;
          status: "draft" | "sent" | "accepted" | "rejected" | "converted" | "expired";
          remarks: string | null; converted_order_id: string | null;
          created_by: string | null; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; quotation_number: string; customer_id?: string | null;
          customer_name: string; customer_phone?: string | null; customer_address?: string | null;
          customer_whatsapp?: string | null; customer_email?: string | null;
          expiry_date?: string | null; expected_delivery_date?: string | null;
          subtotal: number; discount?: number; discount_type?: "percentage" | "fixed" | null;
          delivery_charge?: number;
          status?: "draft" | "sent" | "accepted" | "rejected" | "converted" | "expired";
          remarks?: string | null; converted_order_id?: string | null;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; quotation_number?: string; customer_id?: string | null;
          customer_name?: string; customer_phone?: string | null; customer_address?: string | null;
          customer_whatsapp?: string | null; customer_email?: string | null;
          expiry_date?: string | null; expected_delivery_date?: string | null;
          subtotal?: number; discount?: number; discount_type?: "percentage" | "fixed" | null;
          delivery_charge?: number;
          status?: "draft" | "sent" | "accepted" | "rejected" | "converted" | "expired";
          remarks?: string | null; converted_order_id?: string | null;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string; quotation_id: string; business_id: string; product_id: string | null;
          product_name: string; category: string | null; unit_price: number;
          quantity: number; total_price: number; notes: string | null;
          sort_order: number; created_at: string;
        };
        Insert: {
          id?: string; quotation_id: string; business_id: string; product_id?: string | null;
          product_name: string; category?: string | null; unit_price: number;
          quantity: number; notes?: string | null; sort_order?: number; created_at?: string;
        };
        Update: {
          id?: string; quotation_id?: string; business_id?: string; product_id?: string | null;
          product_name?: string; category?: string | null; unit_price?: number;
          quantity?: number; notes?: string | null; sort_order?: number; created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string; business_id: string; expense_number: string | null;
          expense_date: string; category: "inventory" | "other";
          supplier: string | null; item_name: string;
          quantity: number; unit_cost: number; total_cost: number;
          payment_method: "cash" | "bank_transfer" | "card" | "online" | null;
          payment_status: "pending" | "paid";
          add_to_inventory: boolean; inventory_item_id: string | null;
          remarks: string | null; created_by: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string; expense_number?: string | null;
          expense_date: string; category?: "inventory" | "other";
          supplier?: string | null; item_name: string;
          quantity?: number; unit_cost: number;
          payment_method?: "cash" | "bank_transfer" | "card" | "online" | null;
          payment_status?: "pending" | "paid";
          add_to_inventory?: boolean; inventory_item_id?: string | null;
          remarks?: string | null; created_by?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string; expense_number?: string | null;
          expense_date?: string; category?: "inventory" | "other";
          supplier?: string | null; item_name?: string;
          quantity?: number; unit_cost?: number;
          payment_method?: "cash" | "bank_transfer" | "card" | "online" | null;
          payment_status?: "pending" | "paid";
          add_to_inventory?: boolean; inventory_item_id?: string | null;
          remarks?: string | null; created_by?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      deliveries: {
        Row: {
          id: string; business_id: string; order_id: string;
          waybill_id: string | null; courier: string | null; courier_charge: number | null;
          status: "confirmed" | "to_dispatch" | "in_branch" | "assigned_to_rider" | "delivered" | "cancelled" | "returned";
          tracking_url: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_id: string; order_id: string;
          waybill_id?: string | null; courier?: string | null; courier_charge?: number | null;
          status?: "confirmed" | "to_dispatch" | "in_branch" | "assigned_to_rider" | "delivered" | "cancelled" | "returned";
          tracking_url?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; business_id?: string; order_id?: string;
          waybill_id?: string | null; courier?: string | null; courier_charge?: number | null;
          status?: "confirmed" | "to_dispatch" | "in_branch" | "assigned_to_rider" | "delivered" | "cancelled" | "returned";
          tracking_url?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string; business_id: string; user_id: string;
          type: string; title: string; message: string | null;
          data: Json; is_read: boolean; created_at: string;
        };
        Insert: {
          id?: string; business_id: string; user_id: string;
          type: string; title: string; message?: string | null;
          data?: Json; is_read?: boolean; created_at?: string;
        };
        Update: {
          id?: string; business_id?: string; user_id?: string;
          type?: string; title?: string; message?: string | null;
          data?: Json; is_read?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          id: string; business_id: string; key: string; value: Json;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_id: string; key: string; value: Json;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; business_id?: string; key?: string; value?: Json;
          created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      message_templates: {
        Row: {
          id: string; business_id: string;
          template_context: "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
          title: string; channel: "whatsapp"; content: string;
          is_default: boolean; is_active: boolean; sort_order: number;
          created_by: string | null; created_at: string;
          updated_by: string | null; updated_at: string;
          deleted_at: string | null; deleted_by: string | null;
        };
        Insert: {
          id?: string; business_id: string;
          template_context: "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
          title: string; channel?: "whatsapp"; content: string;
          is_default?: boolean; is_active?: boolean; sort_order?: number;
          created_by?: string | null; created_at?: string;
          updated_by?: string | null; updated_at?: string;
          deleted_at?: string | null; deleted_by?: string | null;
        };
        Update: {
          id?: string; business_id?: string;
          template_context?: "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
          title?: string; channel?: "whatsapp"; content?: string;
          is_default?: boolean; is_active?: boolean; sort_order?: number;
          created_by?: string | null; created_at?: string;
          updated_by?: string | null; updated_at?: string;
          deleted_at?: string | null; deleted_by?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string; business_id: string;
          reference_type: "order" | "expense" | "inventory" | "quotation" | "general";
          reference_id: string | null; title: string;
          assigned_to: string | null; is_completed: boolean; due_date: string | null;
          created_by: string | null; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; business_id: string;
          reference_type: "order" | "expense" | "inventory" | "quotation" | "general";
          reference_id?: string | null; title: string;
          assigned_to?: string | null; is_completed?: boolean; due_date?: string | null;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; business_id?: string;
          reference_type?: "order" | "expense" | "inventory" | "quotation" | "general";
          reference_id?: string | null; title?: string;
          assigned_to?: string | null; is_completed?: boolean; due_date?: string | null;
          created_by?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      admin_activity_log: {
        Row: {
          id: string; admin_id: string; action: string;
          target_type: string | null; target_id: string | null;
          details: Json; created_at: string;
        };
        Insert: {
          id?: string; admin_id: string; action: string;
          target_type?: string | null; target_id?: string | null;
          details?: Json; created_at?: string;
        };
        Update: {
          id?: string; admin_id?: string; action?: string;
          target_type?: string | null; target_id?: string | null;
          details?: Json; created_at?: string;
        };
        Relationships: [];
      };
      team_invitations: {
        Row: {
          id: string; business_id: string; email: string;
          role: "admin" | "member";
          token: string; status: "pending" | "accepted" | "expired" | "cancelled";
          invited_by: string; expires_at: string; accepted_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_id: string; email: string;
          role?: "admin" | "member";
          token?: string; status?: "pending" | "accepted" | "expired" | "cancelled";
          invited_by: string; expires_at?: string; accepted_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; business_id?: string; email?: string;
          role?: "admin" | "member";
          token?: string; status?: "pending" | "accepted" | "expired" | "cancelled";
          invited_by?: string; expires_at?: string; accepted_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_emails: {
        Args: Record<string, never>;
        Returns: Array<{ id: string; email: string }>;
      };
      get_pending_invitations: {
        Args: { target_email: string };
        Returns: Array<{
          id: string;
          business_id: string;
          business_name: string;
          role: string;
          token: string;
          expires_at: string;
          created_at: string;
        }>;
      };
      accept_invitation: {
        Args: { invitation_token: string; accepting_user_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
