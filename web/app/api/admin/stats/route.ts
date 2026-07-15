import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // Fetch counts in parallel for performance
    const [
      { count: usersCount },
      { count: procurementsCount },
      { count: bidsCount },
      { count: wonBidsCount }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: 'exact', head: true }),
      supabase.from("projects").select("*", { count: 'exact', head: true }),
      supabase.from("bids").select("*", { count: 'exact', head: true }),
      supabase.from("bids").select("*", { count: 'exact', head: true }).eq('status', 'won')
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersCount || 0,
        totalProcurements: procurementsCount || 0,
        totalBids: bidsCount || 0,
        totalWonContracts: wonBidsCount || 0
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error("Admin Stats API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch admin stats" }, { status: 500 });
  }
}
