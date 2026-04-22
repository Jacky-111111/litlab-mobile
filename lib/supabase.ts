import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { AppConfig } from "./config";

/**
 * Shared Supabase client. Session persistence is handled by supabase-js using
 * AsyncStorage — do not manage refresh tokens manually per spec §4.
 */
export const supabase = createClient(
  AppConfig.supabaseURL,
  AppConfig.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
