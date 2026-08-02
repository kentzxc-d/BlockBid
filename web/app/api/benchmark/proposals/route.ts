import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Using the service key here to allow Admin operations if needed, or fallback to publishable

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data: proposals, error } = await supabase
      .from("price_proposals")
      .select(`
        *,
        profiles:supplier_id(nickname, entity_type)
      `)
      .eq('status', status)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, proposals }, { status: 200 });
  } catch (err: any) {
    console.error("Proposals GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { supplier_id, item_name, category, subcategory, specs_description, proposed_price, proof_link } = body;

    if (!supplier_id || !item_name || !category || !proposed_price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: proposal, error } = await supabase
      .from("price_proposals")
      .insert([{
        supplier_id,
        item_name,
        category,
        subcategory,
        specs_description,
        proposed_price,
        proof_link,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (err: any) {
    console.error("Proposals POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit proposal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const { id, status } = body; // status can be 'approved' or 'rejected'

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update proposal status
    const { data: proposal, error: updateError } = await supabase
      .from("price_proposals")
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If approved, upsert into benchmark_items
    if (status === 'approved') {
      // For simplicity in MVP, we just insert a new benchmark item or we could try to match by name
      // Let's check if an item with exact name and category exists
      const { data: existingItem } = await supabase
        .from('benchmark_items')
        .select('id')
        .eq('name', proposal.item_name)
        .eq('category', proposal.category)
        .maybeSingle();

      if (existingItem) {
        // Update existing item's platform average
        await supabase
          .from('benchmark_items')
          .update({ 
            platform_average: proposal.proposed_price,
            specs_description: proposal.specs_description, // overwrite with new specs if provided
            subcategory: proposal.subcategory // update subcategory if new
          })
          .eq('id', existingItem.id);
      } else {
        // Create new benchmark item
        await supabase
          .from('benchmark_items')
          .insert([{
            name: proposal.item_name,
            category: proposal.category,
            subcategory: proposal.subcategory,
            specs_description: proposal.specs_description,
            platform_average: proposal.proposed_price
            // base_srp is null since it's user proposed
          }]);
      }
    }

    return NextResponse.json({ success: true, proposal }, { status: 200 });
  } catch (err: any) {
    console.error("Proposals PUT Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update proposal" }, { status: 500 });
  }
}
