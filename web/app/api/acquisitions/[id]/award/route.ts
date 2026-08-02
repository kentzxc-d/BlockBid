import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { BlockBidABI } from "@/lib/abi";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "dummy_key_for_build";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "dummy_key_for_build";
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || "dummy_key_for_build";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { supplier_id, project_title } = await req.json();
    const projectId = params.id;
    
    if (!supplier_id || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- BLOCKCHAIN TRANSACTION (Admin Relayer) ---
    if (adminPrivateKey) {
      try {
        const account = privateKeyToAccount(`0x${adminPrivateKey.replace(/^0x/, '')}`);
        const client = createWalletClient({
          account,
          chain: polygonAmoy,
          transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com")
        }).extend(publicActions);

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
        
        // Get supplier wallet address
        const { data: profileData } = await supabase.from('profiles').select('wallet_address').eq('id', supplier_id).single();
        const realSupplierAddress = profileData?.wallet_address;

        if (contractAddress && realSupplierAddress) {
          console.log(`Executing finalizeAward for project ${projectId} on-chain...`);
          const dummyHash = "0x" + "0".repeat(64);
          
          const hash = await client.writeContract({
            address: contractAddress,
            abi: BlockBidABI,
            functionName: 'finalizeAward',
            args: [projectId, realSupplierAddress as `0x${string}`, dummyHash]
          });
          
          // Wait for receipt
          await client.waitForTransactionReceipt({ hash });
          console.log(`Blockchain award finalized. Tx Hash: ${hash}`);
        } else {
           console.error("Missing contractAddress or supplier wallet_address for blockchain tx.");
        }
      } catch (blockchainErr: any) {
        console.error("Blockchain Award Failed:", blockchainErr);
        return NextResponse.json({ error: "Blockchain transaction failed: " + blockchainErr.message }, { status: 500 });
      }
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
    
    // 1.5 Update the winning bid's status to 'won'
    const { error: bidUpdateError } = await supabase
      .from('bids')
      .update({ status: 'won' })
      .eq('project_id', projectId)
      .eq('supplier_id', supplier_id);

    if (bidUpdateError) console.error("Failed to update winning bid status:", bidUpdateError);

    // 1.6 Update losing bids to 'rejected'
    const { error: loserUpdateError } = await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('project_id', projectId)
      .neq('supplier_id', supplier_id);
      
    if (loserUpdateError) console.error("Failed to update losing bids:", loserUpdateError);
    
    // 2. Create a notification for the winning supplier
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        profile_id: supplier_id,
        type: 'award',
        title: '[ BID_AWARDED ]',
        message: `Congratulations! Your bid for "${project_title || 'a project'}" was selected as the winner.`,
        link: `/dashboard/acquisitions/${projectId}/workspace`
      });
      
    if (notifError) console.error("Failed to insert notification:", notifError);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Award API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
