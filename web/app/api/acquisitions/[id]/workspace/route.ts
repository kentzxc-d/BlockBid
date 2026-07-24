import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;
    
    // Get Project Info
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projError) throw projError;
    
    // Get Contact Info for Requestor and Supplier
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', [project.requestor_id, project.awarded_supplier_id].filter(Boolean));
      
    if (profError) throw profError;
    
    const requestorProfile = profiles.find(p => p.id === project.requestor_id);
    const supplierProfile = profiles.find(p => p.id === project.awarded_supplier_id);
    
    // The requestor's contact info for this project is saved in the projects table
    if (requestorProfile && project) {
      requestorProfile.contact_name = project.contact_name || requestorProfile.contact_name;
      requestorProfile.contact_number = project.contact_number || requestorProfile.contact_number;
      requestorProfile.location = project.location || requestorProfile.location;
    }
    
    // Get Messages
    const { data: messages, error: msgError } = await supabase
      .from('workspace_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (msgError) throw msgError;
    
    return NextResponse.json({
      success: true,
      project,
      requestorProfile,
      supplierProfile,
      messages
    });
  } catch (err: any) {
    console.error("Workspace GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { sender_id, content } = await req.json();
    const projectId = params.id;
    
    if (!sender_id || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    // Insert Message
    const { data, error } = await supabase
      .from('workspace_messages')
      .insert({
        project_id: projectId,
        sender_id,
        content
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // (Optional) We could insert a Notification here for the other party
    // For brevity, we are just inserting the message for now
    
    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    console.error("Workspace POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
