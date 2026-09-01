'use client';

import { useCallback, useEffect, useState } from 'react';

const AUTH_KEY = 'lifecare-auth-user';

/**
 * Lightweight demo auth state for the LifeCare navbar profile icon.
 * Persists the signed-in user in localStorage so the session survives
 * navigation between the landing, services, doctors and channeling pages.
 */
export function useLifeCareAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(AUTH_KEY);
    } catch {
      /* localStorage unavailable — stay signed out */
    }
    // Deferred: avoids synchronous setState inside the effect (cascading renders)
    const id = window.setTimeout(() => {
      setUser(stored);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const login = useCallback((name: string) => {
    try {
      window.localStorage.setItem(AUTH_KEY, name);
    } catch {
      /* localStorage unavailable — session stays in memory only */
    }
    setUser(name);
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      /* localStorage unavailable — ignore */
    }
    setUser(null);
  }, []);

  return { user, hydrated, login, logout };
}