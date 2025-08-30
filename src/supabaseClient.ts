import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string; // service_role uniquement backend !

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase non configuré : ajoute SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
