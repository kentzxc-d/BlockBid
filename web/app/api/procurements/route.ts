import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

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

    // 1. Anti-Spam: Check active projects limit
    const { count: activeCount, error: countError } = await supabase
      .from("procurements")
      .select("*", { count: 'exact', head: true })
      .eq("requestor_id", requestor_id)
      .in("status", ["open", "pending_approval"]);

    if (countError) throw countError;
    if (activeCount !== null && activeCount >= 5) {
      return NextResponse.json({ error: "Limit reached: You can only have up to 5 active or pending projects at a time." }, { status: 400 });
    }

    // 2. AI Auto-Moderation
    const moderationSchema = z.object({
      qualityScore: z.number().describe("Score from 0 to 100 representing clarity, professionalism, and detail."),
      isSpam: z.boolean().describe("True if spam, gibberish, or test data."),
      reasoning: z.string().describe("Brief reason for the score.")
    });

    const prompt = `
      Evaluate the quality and legitimacy of this new procurement request.
      Title: "${title}"
      Description: "${description}"
      Criteria: ${JSON.stringify(criteria)}
      
      Score it from 0 to 100 based on detail, professionalism, and clarity. Flag as spam if it is gibberish, offensive, or clearly a test.
    `;

    const { object } = await generateObject({
      model: google('gemini-3.5-flash'),
      schema: moderationSchema,
      prompt: prompt,
    });

    let projectStatus = "open";
    if (object.qualityScore < 90 || object.isSpam) {
      projectStatus = "pending_approval";
    }

    // 3. Insert Project into the database
    const { data: projectData, error: projectError } = await supabase
      .from("procurements")
      .insert([
        {
          requestor_id,
          title,
          description,
          deadline,
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
      project: projectData,
      moderation: {
        score: object.qualityScore,
        status: projectStatus,
        reasoning: object.reasoning
      }
    }, { status: 201 });
    
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
    
    let query = supabase.from("procurements").select(`
      id,
      requestor_id,
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
