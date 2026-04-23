import type { Session } from "@supabase/supabase-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, type AppStateStatus, LogBox } from "react-native";

import { supabase } from "./supabase";

/** GoTrue logs this before clearing the session; RN LogBox treats it as fatal. */
LogBox.ignoreLogs([
  "AuthApiError: Invalid Refresh Token: Refresh Token Not Found",
]);

interface AuthContextValue {
  session: Session | null;
  isSignedIn: boolean;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const clearLocalSession = async () => {
      await supabase.auth.signOut({ scope: "local" });
      if (mounted) setSession(null);
    };

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          void clearLocalSession();
          return;
        }
        setSession(data.session);
      })
      .catch(() => {
        void clearLocalSession();
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /** Supabase RN: only auto-refresh while app is active to avoid bad refresh races. */
  useEffect(() => {
    const syncAutoRefresh = (state: AppStateStatus) => {
      if (state === "active") {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    syncAutoRefresh(AppState.currentState);
    const sub = AppState.addEventListener("change", syncAutoRefresh);
    return () => {
      sub.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isSignedIn: !!session,
      isReady,
      signIn,
      signOut,
    }),
    [session, isReady, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
