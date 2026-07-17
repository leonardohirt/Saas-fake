import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith("https://") && !url.includes("your-supabase-url");
  } catch {
    return false;
  }
};

const isConfigured = 
  isValidUrl(supabaseUrl) && 
  supabaseAnonKey && 
  !supabaseAnonKey.includes("your-supabase-anon-key");

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseReady = !!isConfigured;
