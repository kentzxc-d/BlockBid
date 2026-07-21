import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Expected from frontend: { amount: 1000, userAddress: "0x..." }
    const { amount, userAddress } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum amount is 100 PHP" }, { status: 400 });
    }

    // We pass the userAddress as the external_id so the Webhook knows exactly who to mint tokens to.
    const external_id = userAddress || `invoice-${Date.now()}`;

    const xenditApiKey = process.env.XENDIT_SECRET_KEY;
    if (!xenditApiKey) {
      console.warn("[WARNING] Missing XENDIT_SECRET_KEY in .env.local, returning mock URL");
      // Return a simulated URL if they haven't set up Xendit yet
      return NextResponse.json({ url: "https://checkout.xendit.co/web/mock-payment-link-for-testing" });
    }

    const xenditAuth = Buffer.from(`${xenditApiKey}:`).toString('base64');

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${xenditAuth}`
      },
      body: JSON.stringify({
        external_id: external_id,
        amount: amount,
        description: "BlockBid Token Escrow Deposit",
        invoice_duration: 3600, // 1 hour expiration
        currency: "PHP"
      })
    });

    const data = await response.json();

    if (data.invoice_url) {
      return NextResponse.json({ url: data.invoice_url });
    } else {
      console.error("Xendit API returned error:", data);
      return NextResponse.json({ error: "Xendit API Error", details: data }, { status: 500 });
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
