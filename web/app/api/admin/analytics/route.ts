import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function isAdmin(adminId: string) {
  if (!adminId) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single();
  return profile?.role === 'admin';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId || !(await isAdmin(adminId))) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // Date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString();

    const [profilesRes, projectsRes, bidsRes] = await Promise.all([
      supabase.from('profiles').select('created_at').gte('created_at', dateString),
      supabase.from('procurements').select('created_at').gte('created_at', dateString),
      supabase.from('bids').select('created_at').gte('created_at', dateString)
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (projectsRes.error) throw projectsRes.error;
    if (bidsRes.error) throw bidsRes.error;

    // Helper to format date "Jul 14"
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const dataMap: Record<string, { date: string, users: number, procurements: number, bids: number, timestamp: number }> = {};

    // Initialize map for the last 30 days to ensure continuous line chart
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Reset hours to 0 to compare days properly if needed, but we are mapping by string 'Jul 14'
      dataMap[formatted] = { date: formatted, users: 0, procurements: 0, bids: 0, timestamp: d.getTime() };
    }

    profilesRes.data.forEach(p => {
      const d = formatDate(p.created_at);
      if (dataMap[d]) dataMap[d].users++;
    });

    projectsRes.data.forEach(p => {
      const d = formatDate(p.created_at);
      if (dataMap[d]) dataMap[d].procurements++;
    });

    bidsRes.data.forEach(b => {
      const d = formatDate(b.created_at);
      if (dataMap[d]) dataMap[d].bids++;
    });

    const analyticsData = Object.values(dataMap).sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ success: true, data: analyticsData }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Analytics API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
