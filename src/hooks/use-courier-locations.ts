"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadCachedLocations, type CourierLocations } from "@/lib/delivery/courier-utils";

interface UseCourierLocationsResult {
  locations: CourierLocations | null;
  loading: boolean;
  courierConnected: boolean;
}

/**
 * Hook that loads cached courier location data (states/districts + cities)
 * for the current business. Returns null if no courier is configured or
 * no cached data exists yet.
 */
export function useCourierLocations(): UseCourierLocationsResult {
  const [locations, setLocations] = useState<CourierLocations | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierConnected, setCourierConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        if (!profile?.business_id) {
          setLoading(false);
          return;
        }

        // Check if courier is connected
        const { data: courierSetting } = await supabase
          .from("business_settings")
          .select("value")
          .eq("business_id", profile.business_id)
          .eq("key", "courier_selected_provider")
          .single();

        const provider = courierSetting?.value;
        const isConnected = !!provider && provider !== "none";
        setCourierConnected(isConnected);

        if (!isConnected) {
          setLocations(null);
          setLoading(false);
          return;
        }

        // Load cached locations
        const cached = await loadCachedLocations(profile.business_id);
        if (!cancelled) {
          setLocations(cached);
        }
      } catch (err) {
        console.error("Failed to load courier locations:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { locations, loading, courierConnected };
}
