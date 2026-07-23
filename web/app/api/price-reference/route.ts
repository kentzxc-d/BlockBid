import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ prices: [] });
    }

    // Search for item names that match the query (case insensitive)
    const { data, error } = await supabase
      .from("price_references")
      .select("item_name, suggested_price")
      .ilike("item_name", `%${query}%`)
      .order("last_updated", { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json({ prices: data });
  } catch (err: any) {
    console.error("Price reference error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
