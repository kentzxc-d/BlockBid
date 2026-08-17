import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUser } from "@/lib/auth";
import { actionRateLimiter } from "@/lib/rate-limit";
import { AcquisitionSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';
import { z } from 'zod';

export const runtime = 'edge';

// Initialize Supabase client with the Service Role Key to bypass RLS

export async function POST(request: Request) {
  const verifiedUserId = await verifyUser(request);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply strict rate limiting for creating projects
  if (actionRateLimiter) {
    const { success, limit, remaining, reset } = await actionRateLimiter.limit(`create_acq_${verifiedUserId}`);
    if (!success) {
      return NextResponse.json({ 
        error: "Too many project creations. Please try again later." 
      }, { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        }
      });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const rawBody = await request.json();
    const parseResult = AcquisitionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data", details: parseResult.error.issues }, { status: 400 });
    }

    const { requestor_id, title, description, deadline, criteria, budget, location, contact_name, contact_number } = parseResult.data;

    if (requestor_id !== verifiedUserId) {
      return NextResponse.json({ error: "Forbidden: Cannot create projects for another user" }, { status: 403 });
    }

    // 1. Anti-Spam: Check active projects limit
    const { count: activeCount, error: countError } = await supabase
      .from("projects")
      .select("*", { count: 'exact', head: true })
      .eq("requestor_id", requestor_id)
      .in("status", ["open", "pending_approval"]);

    if (countError) throw countError;
    if (activeCount !== null && activeCount >= 5) {
      return NextResponse.json({ error: "Limit reached: You can only have up to 5 active or pending projects at a time." }, { status: 400 });
    }

    const projectStatus = "open";

    // 3. Insert Project into the database
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert([
        {
          requestor_id,
          title,
          description,
          deadline,
          budget,
          location,
          contact_name,
          contact_number,
          status: projectStatus,
          // Optional: we could save the reasoning, but let's just save the status
        }
      ])
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    const projectId = projectData.id;

    // 4. Format and insert Criteria
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

    return NextResponse.json({ 
      success: true, 
      project: projectData
    }, { status: 201 });
    
  } catch (err: any) {
    console.error("Acquisition API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create acquisition" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const requestor_id = searchParams.get("requestor_id");
    
    let query = supabase.from("projects").select(`
      id,
      requestor_id,
      title,
      description,
      status,
      deadline,
      budget,
      location,
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
    console.error("Acquisition API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch acquisitions" }, { status: 500 });
  }
}

