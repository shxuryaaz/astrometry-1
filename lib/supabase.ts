import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;

export const getSupabasePublicClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public credentials missing");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const getSupabaseServiceClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase service credentials missing");
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
};

