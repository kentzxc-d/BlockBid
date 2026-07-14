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

    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Users API GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { admin_id, target_user_id, new_role } = body;

    if (!admin_id || !target_user_id || !new_role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!(await isAdmin(admin_id))) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update({ role: new_role })
      .eq("id", target_user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Users API PATCH Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update user role" }, { status: 500 });
  }
}
