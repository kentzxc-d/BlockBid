import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch bids and their corresponding values using Supabase join syntax
    // Assuming foreign keys are set up correctly: bids -> bid_values
    const { data: bids, error } = await supabase
      .from("bids")
      .select(`
        id,
        supplier_id,
        anonymous_alias,
        status,
        ai_score,
        ai_reasoning,
        created_at,
        bid_values (
          criteria_id,
          value
        )
      `)
      .eq("project_id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ bids });

  } catch (err: any) {
    console.error("GET Bids API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch bids" }, { status: 500 });
  }
}
