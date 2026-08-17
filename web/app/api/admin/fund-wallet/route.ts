import { NextResponse } from "next/server";
import { createWalletClient, http, parseEther, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { verifyUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const verifiedUserId = await verifyUser(req);
  if (!verifiedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', verifiedUserId).single();
    if (profile?.role !== 'admin' && profile?.role !== 'ict_head') {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { recipientAddress, amount } = await req.json();

    if (!recipientAddress || !amount) {
      return NextResponse.json({ error: "Missing address or amount" }, { status: 400 });
    }

    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: "ADMIN_PRIVATE_KEY not configured" }, { status: 500 });
    }

    // Format private key if needed
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);

    const client = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"),
    });

    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"),
    });

    // Send transaction
    const hash = await client.sendTransaction({
      to: recipientAddress as `0x${string}`,
      value: parseEther(amount.toString()),
    });

    // Wait for receipt (optional, but good to confirm)
    await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({ success: true, hash });
  } catch (error: any) {
    console.error("Fund wallet error:", error);
    return NextResponse.json({ error: error.message || "Failed to send funds" }, { status: 500 });
  }
}
