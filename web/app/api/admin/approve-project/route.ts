import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admin_id, project_id, action } = body;

    if (!admin_id || !project_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', admin_id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    let newStatus = "";
    if (action === "approve") {
      newStatus = "open";
    } else if (action === "reject") {
      newStatus = "rejected";
    } else {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'." }, { status: 400 });
    }

    // Update project status
    const { error: updateError } = await supabase
      .from("procurements")
      .update({ status: newStatus })
      .eq("id", project_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, newStatus }, { status: 200 });

  } catch (err: any) {
    console.error("Admin Approve API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process project" }, { status: 500 });
  }
}
