import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with the Service Role Key to bypass RLS
export const dynamic = 'force-dynamic';
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

    // --- BID BOND LOGIC ---
    // 1. Fetch Project Budget
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("budget")
      .eq("id", project_id)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Fetch Supplier Profile for Wallet Balance
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", supplier_id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "Supplier profile not found" }, { status: 404 });
    }

    // 3. Calculate 1% Bid Bond
    const bidBond = projectData.budget * 0.01;
    const currentBalance = Number(profileData.wallet_balance) || 0;

    // 4. Check for sufficient funds
    if (currentBalance < bidBond) {
      return NextResponse.json(
        { error: `Insufficient balance for Bid Bond. Required: ₱${bidBond.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Your balance: ₱${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` }, 
        { status: 402 } // 402 Payment Required
      );
    }

    // 5. Deduct Bid Bond from Wallet Balance
    const newBalance = currentBalance - bidBond;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", supplier_id);

    if (updateError) {
      throw new Error("Failed to deduct Bid Bond from wallet balance.");
    }
    // --- END BID BOND LOGIC ---

    // 6. Insert Bid into the database
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplier_id = searchParams.get("supplier_id");
    
    if (!supplier_id) {
      return NextResponse.json({ error: "Missing supplier_id" }, { status: 400 });
    }
    
    const { data: bids, error } = await supabase
      .from("bids")
      .select(`
        id,
        project_id,
        status,
        created_at,
        projects (
          title,
          location,
          budget,
          description,
          deadline
        ),
        bid_values (
          value
        )
      `)
      .eq("supplier_id", supplier_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, bids }, { status: 200 });
  } catch (err: any) {
    console.error("Bids API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch bids" }, { status: 500 });
  }
}
