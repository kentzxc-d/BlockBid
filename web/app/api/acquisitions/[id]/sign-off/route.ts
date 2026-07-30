import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { BlockBidABI } from "@/lib/abi";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
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
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || "";
      if (adminPrivateKey) {
        try {
          const account = privateKeyToAccount(`0x${adminPrivateKey.replace(/^0x/, '')}`);
          const client = createWalletClient({
            account,
            chain: polygonAmoy,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com")
          }).extend(publicActions);

          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
          
          if (contractAddress) {
            console.log(`Executing confirmDelivery for project ${projectId} on-chain...`);
            const hash = await client.writeContract({
              address: contractAddress,
              abi: BlockBidABI,
              functionName: 'confirmDelivery',
              args: [projectId]
            });
            
            await client.waitForTransactionReceipt({ hash });
            console.log(`Blockchain delivery confirmed. Tx Hash: ${hash}`);
            
            // Add system message for blockchain tx
            await supabase.from('workspace_messages').insert({
              project_id: projectId,
              sender_id, // System
              content: `[SYSTEM_BLOCKCHAIN_RECEIPT]\nTX_HASH: ${hash}`
            });
          }
        } catch (blockchainErr: any) {
          console.error("Blockchain Confirm Delivery Failed:", blockchainErr);
          // If blockchain fails, we should abort the completion process
          return NextResponse.json({ error: "Blockchain transaction failed: " + (blockchainErr.shortMessage || blockchainErr.message) }, { status: 500 });
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
