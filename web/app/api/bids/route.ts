import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with the Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, supplier_id, anonymous_alias, bid_values } = body;

    if (!project_id || !supplier_id || !anonymous_alias || !bid_values || bid_values.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert Bid into the database
    const { data: bidData, error: bidError } = await supabase
      .from("bids")
      .insert([
        {
          project_id,
          supplier_id,
          anonymous_alias,
          status: "submitted"
        }
      ])
      .select()
      .single();

    if (bidError) {
      // Handle unique constraint violation (supplier already bid on this project)
      if (bidError.code === '23505') {
        return NextResponse.json({ error: "You have already submitted a bid for this project." }, { status: 409 });
      }
      throw bidError;
    }

    const bidId = bidData.id;

    // 2. Format and insert Bid Values
    const valuesToInsert = bid_values.map((v: any) => ({
      bid_id: bidId,
      criteria_id: v.criteria_id,
      value: v.value
    }));

    const { error: valuesError } = await supabase
      .from("bid_values")
      .insert(valuesToInsert);

    if (valuesError) {
      // In a robust system, rollback bid insertion here
      throw valuesError;
    }

    return NextResponse.json({ success: true, bid: bidData }, { status: 201 });
    
  } catch (err: any) {
    console.error("Bidding API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit bid" }, { status: 500 });
  }
}
