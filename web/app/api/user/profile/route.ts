import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { ProfileSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

// Use admin client for server-side trusted operations to bypass RLS

export async function POST(req: Request) {
  const verifiedUserId = await verifyUser(req);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const rawBody = await req.json();
    const parseResult = ProfileSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.issues }, { status: 400 });
    }

    const { id, role, entity_type, nickname, wallet_address, avatar_url, location, contact_name, contact_number } = parseResult.data;

    if (id !== verifiedUserId) {
      return NextResponse.json({ error: "Forbidden: Cannot update another user's profile" }, { status: 403 });
    }
    
    // Upsert to handle cases where they might update it later
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        { id, role, entity_type, nickname, wallet_address, avatar_url, location, contact_name, contact_number }
      ])
      .select();
      
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, profile: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const verifiedUserId = await verifyUser(req);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    if (id !== verifiedUserId) {
      return NextResponse.json({ error: "Forbidden: Cannot update another user's profile" }, { status: 403 });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, profile: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message, notFound: true }, { status: 404 });
    }
    
    return NextResponse.json(
      { profile: data }, 
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
