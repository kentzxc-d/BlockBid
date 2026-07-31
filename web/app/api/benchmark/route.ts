import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data: benchmarks, error } = await supabase
      .from("benchmark_items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, benchmarks }, { status: 200 });
  } catch (err: any) {
    console.error("Benchmark API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch benchmarks" }, { status: 500 });
  }
}
