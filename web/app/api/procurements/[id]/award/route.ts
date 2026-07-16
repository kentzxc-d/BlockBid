import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supplier_id, project_title } = await req.json();
    const projectId = params.id;
    
    if (!supplier_id || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // 1. Update project status and awarded supplier
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'awarded',
        awarded_supplier_id: supplier_id
      })
      .eq('id', projectId);
      
    if (updateError) {
      console.error("Failed to update project status:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // 2. Create a notification for the winning supplier
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        profile_id: supplier_id,
        type: 'award',
        title: '[ BID_AWARDED ]',
        message: `Congratulations! Your bid for "${project_title || 'a project'}" was selected as the winner.`,
        link: `/dashboard/procurements/${projectId}/workspace`
      });
      
    if (notifError) {
      console.error("Failed to insert notification:", notifError);
      // We don't fail the whole request just because notif failed, but it's good to log
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Award API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
