import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (token?: string) =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    }
  );
