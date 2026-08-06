import { NextResponse } from "next/server";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { activeChain } from "@/utils/network";
import BlockBidTokenArtifact from "../../../../lib/BlockBidToken.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // In production, we should verify the PayMongo signature here using process.env.PAYMONGO_WEBHOOK_SECRET_KEY
    // For now, we trust the incoming webhook payload.

    const eventType = body?.data?.attributes?.type;

    // Check if the event is a successful payment from a PayMongo Link
    if (eventType === "link.payment.paid") {
      const resourceData = body.data.attributes.data;
      const amountPaidInCentavos = resourceData.attributes.amount;
      const amountPaid = amountPaidInCentavos / 100;
      
      // We designed the frontend to pass the user's wallet address and original amount
      // as the "remarks" format: "address|amount" in the links API
      let userWalletAddress = resourceData.attributes.remarks;
      let amountToMint = amountPaid; // Default to paid amount if parsing fails

      if (userWalletAddress && userWalletAddress.includes("|")) {
        const parts = userWalletAddress.split("|");
        userWalletAddress = parts[0];
        amountToMint = Number(parts[1]);
      }

      console.log(`[PAYMONGO WEBHOOK] Received payment of ${amountPaid} PHP`);
      console.log(`[BLOCKCHAIN] Preparing to mint ${amountToMint} BlockBid Tokens to ${userWalletAddress}`);

      // Connect to Blockchain via viem
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
      const contractAddress = process.env.NEXT_PUBLIC_PHPB_ADDRESS;
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com";

      if (adminPrivateKey && contractAddress) {
        const account = privateKeyToAccount(`0x${adminPrivateKey}`);
        const client = createWalletClient({
          account,
          chain: activeChain,
          transport: http(rpcUrl)
        });

        const txHash = await client.writeContract({
          address: contractAddress as `0x${string}`,
          abi: BlockBidTokenArtifact.abi,
          functionName: 'mint',
          args: [userWalletAddress as `0x${string}`, parseEther(amountToMint.toString())]
        });

        console.log(`[SUCCESS] Tokens successfully minted! TX Hash: ${txHash}`);

        // (Gas is now sponsored Just-In-Time via /api/gas-sponsor right before transactions)

        return NextResponse.json({ success: true, message: "Tokens minted and Gas sponsored", txHash: txHash });
      } else {
        console.warn(`[WARNING] Missing ENV variables for blockchain. Simulating mint...`);
        return NextResponse.json({ success: true, message: "Simulated token mint (Missing env)" });
      }
    }

    return NextResponse.json({ success: true, message: `Webhook ignored (event type: ${eventType})` });
  } catch (error) {
    console.error("PayMongo Webhook error:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
