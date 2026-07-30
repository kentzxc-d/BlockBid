import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    // First check if the project is actually awarded
    const { data: projectData, error: projError } = await supabase
      .from('projects')
      .select('status, awarded_supplier_id')
      .eq('id', projectId)
      .single();
      
    if (projError || !projectData) {
      return NextResponse.json({ error: "Project not found or error fetching project" }, { status: 404 });
    }
    
    if (projectData.status !== 'awarded') {
      return NextResponse.json({ error: "Project is not yet awarded" }, { status: 400 });
    }

    // Get the winning bid
    const { data: winningBid, error: bidError } = await supabase
      .from('bids')
      .select('supplier_id, bid_values, on_chain_hash')
      .eq('project_id', projectId)
      .eq('status', 'won')
      .single();

    if (bidError || !winningBid) {
      return NextResponse.json({ error: "Winning bid not found" }, { status: 404 });
    }

    // Get the winning supplier's profile name
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', winningBid.supplier_id)
      .single();
      
    const winnerName = profileData?.nickname || "Undisclosed Supplier";
    
    // Extract a summary from the bid values (e.g., total price, delivery time)
    // We don't want to expose every single detail, just a summary.
    let bidSummary = "N/A";
    if (winningBid.bid_values && Array.isArray(winningBid.bid_values)) {
      // Find a value that looks like the price/budget or combine them
      const values = winningBid.bid_values.map((v: any) => v.value).filter(Boolean);
      if (values.length > 0) {
        // Just take the first two values for the summary to not leak everything
        bidSummary = values.slice(0, 2).join(" | ");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        winnerName,
        bidSummary,
        onChainHash: winningBid.on_chain_hash || "N/A"
      }
    });

  } catch (err: any) {
    console.error("Award Results API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
