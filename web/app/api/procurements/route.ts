import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with the Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestor_id, title, description, deadline, criteria } = body;

    if (!requestor_id || !title || !deadline || !criteria || criteria.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert Project into the database
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert([
        {
          requestor_id,
          title,
          description,
          deadline,
          status: "open"
        }
      ])
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    const projectId = projectData.id;

    // 2. Format and insert Criteria
    const criteriaToInsert = criteria.map((c: any) => ({
      project_id: projectId,
      name: c.name,
      description: c.description || "",
      weight_percentage: c.weight
    }));

    const { error: criteriaError } = await supabase
      .from("project_criteria")
      .insert(criteriaToInsert);

    if (criteriaError) {
      // In a robust system, we would rollback the project insertion here if criteria fails
      throw criteriaError;
    }

    return NextResponse.json({ success: true, project: projectData }, { status: 201 });
    
  } catch (err: any) {
    console.error("Procurement API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create procurement" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const requestor_id = searchParams.get("requestor_id");
    
    let query = supabase.from("projects").select(`
      id,
      title,
      description,
      status,
      deadline,
      created_at,
      bids ( count )
    `);
    
    if (filter === "open") {
      query = query.eq("status", "open");
    }
    if (requestor_id) {
      query = query.eq("requestor_id", requestor_id);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, projects }, { status: 200 });
  } catch (err: any) {
    console.error("Procurement API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch procurements" }, { status: 500 });
  }
}
