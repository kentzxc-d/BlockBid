import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { wallet_address, user_id } = await req.json();

    if (!wallet_address || !user_id) {
      return NextResponse.json({ error: "Missing wallet_address or user_id" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Rate Limiting Check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: pastRequests, error: dbError } = await supabase
      .from('gas_sponsorships')
      .select('id')
      .eq('user_id', user_id)
      .gte('created_at', yesterday.toISOString());

    if (dbError) {
      // If table doesn't exist yet, we will just log it and bypass for now so development doesn't break
      console.warn("Could not check rate limit. Ensure gas_sponsorships table exists.", dbError);
    } else if (pastRequests && pastRequests.length >= 5) {
      return NextResponse.json({ error: "Rate limit exceeded. Max 5 gas requests per day." }, { status: 429 });
    }

    // 2. Viem Setup
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      return NextResponse.json({ error: "ADMIN_PRIVATE_KEY not configured" }, { status: 500 });
    }

    const account = privateKeyToAccount(`0x${adminPrivateKey.replace(/^0x/, '')}`);
    const client = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com")
    }).extend(publicActions);

    // 3. Fetch current network gas price
    const gasPrice = await client.getGasPrice();
    
    // We assume a generous 500,000 gas units for standard interactions (approve + commitBid)
    const assumedGasLimit = BigInt(500000);
    
    // Target balance = Gas Price * Gas Limit * 1.5 buffer
    const targetBalance = (gasPrice * assumedGasLimit * BigInt(150)) / BigInt(100);
    
    // 4. Fetch user's current balance
    const currentBalance = await client.getBalance({ address: wallet_address as `0x${string}` });
    
    if (currentBalance >= targetBalance) {
      return NextResponse.json({ 
        success: true, 
        message: "Sufficient gas balance exists.",
        amountSent: "0"
      });
    }

    // 5. Calculate amount to send
    const amountToSend = targetBalance - currentBalance;
    
    console.log(`Sending ${formatEther(amountToSend)} POL to ${wallet_address} for gas...`);

    // 6. Send the gas
    const hash = await client.sendTransaction({
      to: wallet_address as `0x${string}`,
      value: amountToSend,
      chain: polygonAmoy
    });

    // Wait for it so the frontend can immediately submit its own tx
    await client.waitForTransactionReceipt({ hash });

    // 7. Log to database
    await supabase.from('gas_sponsorships').insert({
      user_id,
      wallet_address,
      amount_sent: parseFloat(formatEther(amountToSend)),
      tx_hash: hash
    });

    return NextResponse.json({ 
      success: true, 
      message: "Gas sent successfully",
      amountSent: formatEther(amountToSend),
      txHash: hash 
    });

  } catch (err: any) {
    console.error("JIT Faucet error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
