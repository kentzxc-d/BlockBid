import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUser } from "@/lib/auth";
import { AdminUsersSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

async function isAdmin(adminId: string, supabase: any) {
  if (!adminId) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminId)
    .single();
  return profile?.role === 'admin';
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const verifiedUserId = await verifyUser(request);
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId || adminId !== verifiedUserId || !(await isAdmin(adminId, supabase))) {
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
  const verifiedUserId = await verifyUser(request);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', verifiedUserId).single();
    if (profile?.role !== 'admin' && profile?.role !== 'ict_head') {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const rawBody = await request.json();
    const parseResult = AdminUsersSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.issues }, { status: 400 });
    }

    const { admin_id, target_user_id, new_role } = parseResult.data;

    if (!admin_id || !target_user_id || !new_role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (admin_id !== verifiedUserId || !(await isAdmin(admin_id, supabase))) {
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
