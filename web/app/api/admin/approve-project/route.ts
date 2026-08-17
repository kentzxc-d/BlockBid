import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUser } from "@/lib/auth";
import { AdminApproveSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const verifiedUserId = await verifyUser(request);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', verifiedUserId)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'ict_head')) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const rawBody = await request.json();
    const parseResult = AdminApproveSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.issues }, { status: 400 });
    }

    const { project_id, status: action } = parseResult.data;

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
      .from("projects")
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
