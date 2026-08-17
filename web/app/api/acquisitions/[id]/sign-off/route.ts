import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { BlockBidABI } from "@/lib/abi";
import { privy, verifyUser } from "@/lib/auth";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';


export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const verifiedUserId = await verifyUser(req);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    if (sender_id !== verifiedUserId) {
      return NextResponse.json({ error: "Forbidden: Cannot sign off for another user" }, { status: 403 });
    }
    
    // Verify the project is currently awarded
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('status, awarded_supplier_id, requestor_id, title')
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
            console.log(`Executing confirmDelivery for project ${projectId} on-chain...`);
            
            const account = privateKeyToAccount(`0x${adminPrivateKey.replace(/^0x/, '')}`);
            const client = createWalletClient({
              account,
              chain: polygonAmoy,
              transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com")
            }).extend(publicActions);

            const hash = await client.writeContract({
              address: contractAddress,
              abi: BlockBidABI,
              functionName: 'confirmDelivery',
              args: [projectId]
            });
            
            // Wait for receipt
            await client.waitForTransactionReceipt({ hash });
            console.log(`Blockchain confirmDelivery finalized. Tx Hash: ${hash}`);

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

      // Notify supplier they can claim their refund
      if (project.awarded_supplier_id) {
        await supabase.from('notifications').insert({
          profile_id: project.awarded_supplier_id,
          type: 'delivery_accepted',
          title: '[ DELIVERY_ACCEPTED ]',
          message: `The requestor has signed off on "${project.title || 'the project'}". You can now claim your escrow refund.`,
          link: `/dashboard/acquisitions/${projectId}/workspace`
        });
      }

      isCompleted = true;
    } else if (!existingSignOff) {
      // The other party hasn't signed yet, and this is a new sign-off. Notify them!
      const recipientId = role === 'requestor' ? project.awarded_supplier_id : project.requestor_id;
      
      if (recipientId) {
        try {
          const user = await privy.getUser(recipientId);
          const emailAccount = user.linkedAccounts.find((acc) => acc.type === 'email') as any;
          const googleAccount = user.linkedAccounts.find((acc) => acc.type === 'google_oauth') as any;
          
          let recipientEmail = '';
          if (emailAccount && emailAccount.address) recipientEmail = emailAccount.address;
          else if (googleAccount && googleAccount.email) recipientEmail = googleAccount.email;

          if (recipientEmail) {
            const resend = new Resend(process.env.RESEND_API_KEY || '');
            const otherParty = role === 'requestor' ? 'Requestor (ICT)' : 'Supplier';
            
            await resend.emails.send({
              from: 'BlockBid <onboarding@blockbid.site>',
              to: [recipientEmail],
              subject: `⚠️ Action Required: Multi-Sig for ${project.title}`,
              html: `
                <div style="font-family: monospace; padding: 24px; max-width: 600px; margin: 0 auto; background: #fafafa; border: 1px solid #eaeaea;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #111; font-family: sans-serif; text-transform: uppercase;">[ MULTI-SIG_AUTH_PENDING ]</h1>
                  </div>
                  
                  <p style="color: #333; font-size: 16px;">
                    The <strong>${otherParty}</strong> has just signed off on the project <strong>"${project.title}"</strong>.
                  </p>
                  
                  <div style="background: #eef2ff; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; color: #4f46e5; font-weight: bold;">YOUR SIGNATURE REQUIRED</p>
                    <p style="margin: 8px 0 0 0; color: #333;">
                      Please log in to your BlockBid Workspace and authorize the completion of this project so the smart contract can release the funds.
                    </p>
                  </div>
                  
                  <a href="https://ck-bid.vercel.app/dashboard/acquisitions/${projectId}/workspace" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 2px;">
                    OPEN WORKSPACE
                  </a>
                  
                  <hr style="border: none; border-top: 1px dashed #ccc; margin: 32px 0;" />
                  <p style="color: #888; font-size: 12px; text-align: center;">
                    This is an automated security message from BlockBid.
                  </p>
                </div>
              `
            });
            console.log(`Sent multi-sig email to ${recipientEmail}`);
          }
        } catch (emailErr) {
          console.error("Failed to send multi-sig email:", emailErr);
          // We don't throw here because we don't want to break the sign-off process if email fails
        }
      }
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
