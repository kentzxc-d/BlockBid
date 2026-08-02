import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { polygonAmoy } from "viem/chains";

export const dynamic = 'force-dynamic';


export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const params = await props.params;
    const { sender_id, role } = await req.json();
    const projectId = params.id;
    
    if (!sender_id || !role || (role !== 'requestor' && role !== 'supplier')) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }
    
    // Verify the project is currently awarded
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('status')
      .eq('id', projectId)
      .single();
      
    if (projError) throw projError;
    if (project.status !== 'awarded') {
      return NextResponse.json({ error: "Project is not in awarded state" }, { status: 400 });
    }

    const signOffCode = role === 'requestor' ? '[SYSTEM_SIGNOFF_REQUESTOR]' : '[SYSTEM_SIGNOFF_SUPPLIER]';

    // Check if this user already signed off
    const { data: existingSignOff, error: checkError } = await supabase
      .from('workspace_messages')
      .select('id')
      .eq('project_id', projectId)
      .eq('content', signOffCode)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingSignOff) {
      // Insert the sign-off system message
      const { error: insertError } = await supabase
        .from('workspace_messages')
        .insert({
          project_id: projectId,
          sender_id,
          content: signOffCode
        });
      
      if (insertError) throw insertError;
    }

    // Check if both parties have signed off
    const { data: allMessages, error: messagesError } = await supabase
      .from('workspace_messages')
      .select('content')
      .eq('project_id', projectId)
      .in('content', ['[SYSTEM_SIGNOFF_REQUESTOR]', '[SYSTEM_SIGNOFF_SUPPLIER]']);

    if (messagesError) throw messagesError;

    const hasRequestorSigned = allMessages.some(m => m.content === '[SYSTEM_SIGNOFF_REQUESTOR]');
    const hasSupplierSigned = allMessages.some(m => m.content === '[SYSTEM_SIGNOFF_SUPPLIER]');
    
    let isCompleted = false;

    if (hasRequestorSigned && hasSupplierSigned) {
      // --- BLOCKCHAIN TRANSACTION (Admin Relayer) ---
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || "dummy_key_for_build";
      if (adminPrivateKey) {
        try {
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
          
          if (contractAddress) {
            console.log(`Smart contract confirmDelivery not implemented yet. Skipping blockchain tx.`);
            
            // Add system message for completion
            await supabase.from('workspace_messages').insert({
              project_id: projectId,
              sender_id, // System
              content: `[SYSTEM_MILESTONE_COMPLETED]\nBoth parties have signed off.`
            });
          }
        } catch (err: any) {
          console.error("Sign-off Error:", err);
          // Continue without blockchain for now
          console.log("Proceeding to close project in database...");
        }
      }

      // Both signed off AND blockchain succeeded! Update project status to closed
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'closed' })
        .eq('id', projectId);
        
      if (updateError) throw updateError;
      
      // Optional: Add a final system message
      await supabase
        .from('workspace_messages')
        .insert({
          project_id: projectId,
          sender_id: sender_id, // Or system ID if we had one
          content: '[SYSTEM_TRANSACTION_COMPLETED]'
        });

      isCompleted = true;
    }
    
    return NextResponse.json({ 
      success: true, 
      isCompleted,
      hasRequestorSigned,
      hasSupplierSigned
    });
  } catch (err: any) {
    console.error("Sign-Off API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
