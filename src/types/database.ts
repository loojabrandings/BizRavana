export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      request_rate_limits: {
        Row: {
          scope: string; key_hash: string; window_started_at: string;
          request_count: number; updated_at: string;
        };
        Insert: {
          scope: string; key_hash: string; window_started_at?: string;
          request_count?: number; updated_at?: string;
        };
        Update: {
          scope?: string; key_hash?: string; window_started_at?: string;
          request_count?: number; updated_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string; name: string; monthly_price: number; yearly_price: number;
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
          id?: string; name: string; monthly_price: number; yearly_price?: number;
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
          id?: string; name?: string; monthly_price?: number; yearly_price?: number;
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
      ad_campaigns: {
        Row: {
          id: string; title: string; description: string; label: "Special Offer" | "Announcement" | "New Feature" | "Upgrade" | "Recommended for You";
          image_path: string | null; image_fit: "cover" | "contain";
          cta_text: string | null; cta_url: string | null; target_plan_ids: string[];
          website_target: "all" | "missing" | "present"; target_business_id: string | null;
          priority: number; starts_at: string | null; ends_at: string | null;
          is_active: boolean; created_by: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; title: string; description: string; label?: "Special Offer" | "Announcement" | "New Feature" | "Upgrade" | "Recommended for You";
          image_path?: string | null; image_fit?: "cover" | "contain";
          cta_text?: string | null; cta_url?: string | null; target_plan_ids?: string[];
          website_target?: "all" | "missing" | "present"; target_business_id?: string | null;
          priority?: number; starts_at?: string | null; ends_at?: string | null;
          is_active?: boolean; created_by?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; title?: string; description?: string; label?: "Special Offer" | "Announcement" | "New Feature" | "Upgrade" | "Recommended for You";
          image_path?: string | null; image_fit?: "cover" | "contain";
          cta_text?: string | null; cta_url?: string | null; target_plan_ids?: string[];
          website_target?: "all" | "missing" | "present"; target_business_id?: string | null;
          priority?: number; starts_at?: string | null; ends_at?: string | null;
          is_active?: boolean; created_by?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      ad_dismissals: {
        Row: {
          ad_id: string; user_id: string; business_id: string;
          dismissed_until: string; created_at: string;
        };
        Insert: {
          ad_id: string; user_id: string; business_id: string;
          dismissed_until: string; created_at?: string;
        };
        Update: {
          ad_id?: string; user_id?: string; business_id?: string;
          dismissed_until?: string; created_at?: string;
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
          data_delete_after: string | null; billing_period: "monthly" | "yearly" | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: {
          id?: string; owner_id: string; name: string; type?: string | null;
          phone?: string | null; district?: string | null; address?: string | null;
          logo_url?: string | null; theme_prefs?: Json; plan_id?: string | null;
          account_status?: "trial" | "trial_expired" | "pending_payment" | "active" | "expired" | "suspended" | "archived" | "deleted";
          trial_started_at?: string | null; trial_ends_at?: string | null;
          subscription_started_at?: string | null; subscription_ends_at?: string | null;
          data_delete_after?: string | null; billing_period?: "monthly" | "yearly" | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Update: {
          id?: string; owner_id?: string; name?: string; type?: string | null;
          phone?: string | null; district?: string | null; address?: string | null;
          logo_url?: string | null; theme_prefs?: Json; plan_id?: string | null;
          account_status?: "trial" | "trial_expired" | "pending_payment" | "active" | "expired" | "suspended" | "archived" | "deleted";
          trial_started_at?: string | null; trial_ends_at?: string | null;
          subscription_started_at?: string | null; subscription_ends_at?: string | null;
          data_delete_after?: string | null; billing_period?: "monthly" | "yearly" | null;
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
          proof_image_path: string | null; submitted_by: string | null;
          previous_account_status: string | null; reviewed_at: string | null;
          notes: string | null; status: "pending" | "approved" | "rejected";
          admin_note: string | null; approved_by: string | null;
          approved_at: string | null; billing_period: "monthly" | "yearly";
          created_at: string;
        };
        Insert: {
          id?: string; business_id: string; plan_id?: string | null;
          amount: number; payment_method?: string; proof_image_url?: string | null;
          proof_image_path?: string | null; submitted_by?: string | null;
          previous_account_status?: string | null; reviewed_at?: string | null;
          notes?: string | null; status?: "pending" | "approved" | "rejected";
          admin_note?: string | null; approved_by?: string | null;
          approved_at?: string | null; billing_period?: "monthly" | "yearly";
          created_at?: string;
        };
        Update: {
          id?: string; business_id?: string; plan_id?: string | null;
          amount?: number; payment_method?: string; proof_image_url?: string | null;
          proof_image_path?: string | null; submitted_by?: string | null;
          previous_account_status?: string | null; reviewed_at?: string | null;
          notes?: string | null; status?: "pending" | "approved" | "rejected";
          admin_note?: string | null; approved_by?: string | null;
          approved_at?: string | null; billing_period?: "monthly" | "yearly";
          created_at?: string;
        };
        Relationships: [];
      };
      payhere_payments: {
        Row: {
          id: string; business_id: string; user_id: string | null; plan_id: string;
          order_id: string; merchant_id: string; item_name: string;
          amount: number; currency: string;
          status: "created" | "pending" | "success" | "canceled" | "failed" | "chargedback" | "invalid";
          payhere_payment_id: string | null; payment_method: string | null;
          status_code: number | null; status_message: string | null;
          customer_first_name: string; customer_last_name: string;
          customer_email: string; customer_phone: string;
          customer_address: string; customer_city: string; customer_country: string;
          card_holder_name: string | null; card_no: string | null; card_expiry: string | null;
          signature_verified: boolean; notification_payload: Json;
          previous_plan_id: string | null; previous_account_status: string | null;
          previous_subscription_started_at: string | null;
          previous_subscription_ends_at: string | null;
          billing_period: "monthly" | "yearly";
          initiated_at: string; last_notified_at: string | null;
          paid_at: string | null; activated_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_id: string; user_id?: string | null; plan_id: string;
          order_id: string; merchant_id: string; item_name: string;
          amount: number; currency?: string;
          status?: "created" | "pending" | "success" | "canceled" | "failed" | "chargedback" | "invalid";
          payhere_payment_id?: string | null; payment_method?: string | null;
          status_code?: number | null; status_message?: string | null;
          customer_first_name: string; customer_last_name: string;
          customer_email: string; customer_phone: string;
          customer_address: string; customer_city: string; customer_country: string;
          card_holder_name?: string | null; card_no?: string | null; card_expiry?: string | null;
          signature_verified?: boolean; notification_payload?: Json;
          previous_plan_id?: string | null; previous_account_status?: string | null;
          previous_subscription_started_at?: string | null;
          previous_subscription_ends_at?: string | null;
          billing_period?: "monthly" | "yearly";
          initiated_at?: string; last_notified_at?: string | null;
          paid_at?: string | null; activated_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; business_id?: string; user_id?: string | null; plan_id?: string;
          order_id?: string; merchant_id?: string; item_name?: string;
          amount?: number; currency?: string;
          status?: "created" | "pending" | "success" | "canceled" | "failed" | "chargedback" | "invalid";
          payhere_payment_id?: string | null; payment_method?: string | null;
          status_code?: number | null; status_message?: string | null;
          customer_first_name?: string; customer_last_name?: string;
          customer_email?: string; customer_phone?: string;
          customer_address?: string; customer_city?: string; customer_country?: string;
          card_holder_name?: string | null; card_no?: string | null; card_expiry?: string | null;
          signature_verified?: boolean; notification_payload?: Json;
          previous_plan_id?: string | null; previous_account_status?: string | null;
          previous_subscription_started_at?: string | null;
          previous_subscription_ends_at?: string | null;
          billing_period?: "monthly" | "yearly";
          initiated_at?: string; last_notified_at?: string | null;
          paid_at?: string | null; activated_at?: string | null;
          created_at?: string; updated_at?: string;
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
          source_order_id: string | null;
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
          source_order_id?: string | null;
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
          source_order_id?: string | null;
          remarks?: string | null; created_by?: string | null;
          created_at?: string; updated_at?: string; deleted_at?: string | null;
        };
        Relationships: [];
      };
      bug_reports: {
        Row: {
          id: string; business_id: string; user_id: string;
          title: string; description: string; expected_result: string | null;
          page_url: string | null; browser_info: string | null;
          screenshot_path: string | null;
          status: "new" | "reviewing" | "in_progress" | "resolved" | "closed";
          admin_notes: string | null; resolved_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_id: string; user_id: string;
          title: string; description: string; expected_result?: string | null;
          page_url?: string | null; browser_info?: string | null;
          screenshot_path?: string | null;
          status?: "new" | "reviewing" | "in_progress" | "resolved" | "closed";
          admin_notes?: string | null; resolved_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          title?: string; description?: string; expected_result?: string | null;
          page_url?: string | null; browser_info?: string | null;
          screenshot_path?: string | null;
          status?: "new" | "reviewing" | "in_progress" | "resolved" | "closed";
          admin_notes?: string | null; resolved_at?: string | null;
          updated_at?: string;
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
          source: string; priority: string; category: string;
          expires_at: string | null; action_label: string | null;
          action_url: string | null; broadcast_id: string | null;
        };
        Insert: {
          id?: string; business_id: string; user_id: string;
          type: string; title: string; message?: string | null;
          data?: Json; is_read?: boolean; created_at?: string;
          source?: string; priority?: string; category?: string;
          expires_at?: string | null; action_label?: string | null;
          action_url?: string | null; broadcast_id?: string | null;
        };
        Update: {
          id?: string; business_id?: string; user_id?: string;
          type?: string; title?: string; message?: string | null;
          data?: Json; is_read?: boolean; created_at?: string;
          source?: string; priority?: string; category?: string;
          expires_at?: string | null; action_label?: string | null;
          action_url?: string | null; broadcast_id?: string | null;
        };
        Relationships: [];
      };
      notification_broadcasts: {
        Row: {
          id: string; title: string; message: string; category: string;
          priority: string; source: string; audience_type: string;
          audience_config: Json; action_label: string | null;
          action_url: string | null; status: string;
          scheduled_at: string | null; sent_at: string | null;
          expires_at: string | null; recipient_count: number;
          read_count: number; created_by: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; title: string; message: string; category?: string;
          priority?: string; source?: string; audience_type?: string;
          audience_config?: Json; action_label?: string | null;
          action_url?: string | null; status?: string;
          scheduled_at?: string | null; sent_at?: string | null;
          expires_at?: string | null; recipient_count?: number;
          read_count?: number; created_by?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; title?: string; message?: string; category?: string;
          priority?: string; source?: string; audience_type?: string;
          audience_config?: Json; action_label?: string | null;
          action_url?: string | null; status?: string;
          scheduled_at?: string | null; sent_at?: string | null;
          expires_at?: string | null; recipient_count?: number;
          read_count?: number; created_by?: string | null;
          created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      notification_recipients: {
        Row: {
          id: string; broadcast_id: string | null;
          notification_id: string | null; business_id: string;
          user_id: string | null; read_at: string | null;
          delivered_at: string; dismissed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; broadcast_id?: string | null;
          notification_id?: string | null; business_id: string;
          user_id?: string | null; read_at?: string | null;
          delivered_at?: string; dismissed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string; broadcast_id?: string | null;
          notification_id?: string | null; business_id?: string;
          user_id?: string | null; read_at?: string | null;
          delivered_at?: string; dismissed_at?: string | null;
          created_at?: string;
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
          template_context: "order_whatsapp" | "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
          title: string; channel: "whatsapp"; content: string;
          is_default: boolean; is_active: boolean; sort_order: number;
          created_by: string | null; created_at: string;
          updated_by: string | null; updated_at: string;
          deleted_at: string | null; deleted_by: string | null;
        };
        Insert: {
          id?: string; business_id: string;
          template_context: "order_whatsapp" | "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
          title: string; channel?: "whatsapp"; content: string;
          is_default?: boolean; is_active?: boolean; sort_order?: number;
          created_by?: string | null; created_at?: string;
          updated_by?: string | null; updated_at?: string;
          deleted_at?: string | null; deleted_by?: string | null;
        };
        Update: {
          id?: string; business_id?: string;
          template_context?: "order_whatsapp" | "order_table_whatsapp" | "order_preview_whatsapp" | "quotation_preview_whatsapp";
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
          id: string; admin_id: string | null; action: string;
          target_type: string | null; target_id: string | null;
          details: Json; created_at: string;
        };
        Insert: {
          id?: string; admin_id?: string | null; action: string;
          target_type?: string | null; target_id?: string | null;
          details?: Json; created_at?: string;
        };
        Update: {
          id?: string; admin_id?: string | null; action?: string;
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
      consume_request_rate_limit: {
        Args: {
          p_scope: string;
          p_key_hash: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: Array<{
          allowed: boolean;
          remaining: number;
          retry_after_seconds: number;
        }>;
      };
      cleanup_request_rate_limits: {
        Args: Record<string, never>;
        Returns: number;
      };
      deliver_notification_broadcast: {
        Args: { p_broadcast_id: string };
        Returns: Json;
      };
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
      create_bank_transfer_payment: {
        Args: {
          p_business_id: string;
          p_plan_id: string;
          p_proof_image_path: string;
          p_notes: string;
          p_submitted_by: string;
          p_billing_period: string;
        };
        Returns: string;
      };
      review_bank_transfer_payment: {
        Args: {
          p_payment_id: string;
          p_action: "approve" | "reject";
          p_admin_note?: string | null;
        };
        Returns: Json;
      };
      complete_payhere_payment: {
        Args: {
          p_order_id: string;
          p_payhere_payment_id: string;
          p_status_message: string;
          p_payment_method: string;
          p_card_holder_name: string;
          p_card_no: string;
          p_card_expiry: string;
          p_notification_payload: Json;
          p_billing_period: string;
        };
        Returns: Json;
      };
      purge_business_data: {
        Args: {
          p_business_id: string;
          p_delete_root?: boolean;
        };
        Returns: Json;
      };
      soft_delete_message_template: {
        Args: { p_template_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
