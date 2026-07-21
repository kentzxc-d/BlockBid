import { NextResponse } from "next/server";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains"; // Testnet
import BlockBidTokenArtifact from "../../../../lib/BlockBidToken.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Verify Xendit Signature (for security in production)
    const callbackToken = req.headers.get("x-callback-token");
    // require(callbackToken === process.env.XENDIT_CALLBACK_TOKEN)

    // 2. Check if the payment was successfully PAID
    if (body.status === "PAID" || body.status === "COMPLETED") {
      const amountPaid = body.amount;
      // We designed the frontend to pass the user's wallet address and original amount
      // as the "external_id" format: "address|amount"
      let userWalletAddress = body.external_id; 
      let amountToMint = amountPaid; // Default to paid amount if no original amount is passed

      if (userWalletAddress && userWalletAddress.includes("|")) {
        const parts = userWalletAddress.split("|");
        userWalletAddress = parts[0];
        amountToMint = Number(parts[1]);
      }

      console.log(`[XENDIT WEBHOOK] Received payment of ${amountPaid} PHP from invoice ${body.id}`);
      console.log(`[BLOCKCHAIN] Preparing to mint ${amountToMint} BlockBid Tokens to ${userWalletAddress}`);
      
      // 3. Connect to Blockchain via viem
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
      const contractAddress = process.env.NEXT_PUBLIC_BLOCKBID_TOKEN_ADDRESS;
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org";

      if (adminPrivateKey && contractAddress) {
        const account = privateKeyToAccount(`0x${adminPrivateKey}`);
        const client = createWalletClient({
          account,
          chain: sepolia,
          transport: http(rpcUrl)
        });

        const txHash = await client.writeContract({
          address: contractAddress as `0x${string}`,
          abi: BlockBidTokenArtifact.abi,
          functionName: 'mint',
          args: [userWalletAddress as `0x${string}`, parseEther(amountToMint.toString())]
        });

        console.log(`[SUCCESS] Tokens successfully minted! TX Hash: ${txHash}`);
        return NextResponse.json({ success: true, message: "Tokens minted", txHash: txHash });
      } else {
        console.warn(`[WARNING] Missing ENV variables for blockchain. Simulating mint...`);
        return NextResponse.json({ success: true, message: "Simulated token mint (Missing env)" });
      }
    }

    return NextResponse.json({ success: true, message: "Webhook ignored (status not PAID)" });
  } catch (error) {
    console.error("Xendit Webhook error:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
