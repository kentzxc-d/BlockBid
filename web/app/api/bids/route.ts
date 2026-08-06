import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with the Service Role Key to bypass RLS
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { project_id, supplier_id, anonymous_alias, bid_values, on_chain_hash } = body;

    if (!project_id || !supplier_id || !anonymous_alias || !bid_values || bid_values.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- VERIFICATION CHECK ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('id', supplier_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Failed to verify supplier status." }, { status: 500 });
    }

    if (profile.verification_status !== 'verified') {
      return NextResponse.json({ error: "Unauthorized. Only verified suppliers can submit bids." }, { status: 403 });
    }
    // --- END VERIFICATION CHECK ---

    // --- BID BOND LOGIC ---
    // Removed! Bid Bond deduction is now handled on-chain by the BlockBid Escrow Smart Contract.
    // The Frontend Web3 logic handles the transaction before calling this API route.
    // --- END BID BOND LOGIC ---

    // 6. Insert Bid into the database
    const { data: bidData, error: bidError } = await supabase
      .from("bids")
      .insert([
        {
          project_id,
          supplier_id,
          anonymous_alias,
          on_chain_hash,
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

    // 3. Notify the Requestor (Agency)
    const { data: projectData } = await supabase
      .from('projects')
      .select('requestor_id, title')
      .eq('id', project_id)
      .single();

    if (projectData && projectData.requestor_id) {
      await supabase.from('notifications').insert({
        profile_id: projectData.requestor_id,
        type: 'bid_received',
        title: '[ NEW_BID_SUBMITTED ]',
        message: `A new bid was submitted for "${projectData.title}".`,
        link: `/dashboard/acquisitions/${project_id}/evaluate`
      });
    }

    return NextResponse.json({ success: true, bid: bidData }, { status: 201 });
    
  } catch (err: any) {
    console.error("Bidding API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit bid" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

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
          deadline,
          status
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
