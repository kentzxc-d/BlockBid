import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Fetch project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      throw projectError;
    }

    // 2. Fetch project criteria
    const { data: criteria, error: criteriaError } = await supabase
      .from("project_criteria")
      .select("*")
      .eq("project_id", id);

    if (criteriaError) {
      throw criteriaError;
    }

    // Return combined data
    return NextResponse.json({
      project: {
        ...project,
        criteria: criteria || []
      }
    });

  } catch (err: any) {
    console.error("GET Acquisition API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch acquisition" }, { status: 500 });
  }
}
