import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Expected from frontend: { amount: 1000, userAddress: "0x..." }
    const { amount, userAddress } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum amount is 100 PHP" }, { status: 400 });
    }

    // Calculate 2.5% platform fee
    const platformFee = amount * 0.025;
    const totalAmountToPay = Math.round(amount + platformFee);
    
    // PayMongo requires amount in centavos (e.g. 100.00 PHP = 10000)
    const amountInCentavos = totalAmountToPay * 100;

    // We pass the userAddress and original amount in remarks so the webhook mints the right amount.
    const external_id = userAddress ? `${userAddress}|${amount}` : `invoice-${Date.now()}`;

    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!paymongoSecretKey) {
      console.warn("[WARNING] Missing PAYMONGO_SECRET_KEY in .env.local, returning mock URL");
      // Return a simulated URL if they haven't set up PayMongo yet
      return NextResponse.json({ url: "https://links.paymongo.com/mock-payment-link-for-testing" });
    }

    const paymongoAuth = Buffer.from(`${paymongoSecretKey}:`).toString('base64');

    const response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${paymongoAuth}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            description: `BlockBid Token Escrow Deposit (₱${amount} + 2.5% Fee)`,
            remarks: external_id
          }
        }
      })
    });

    const data = await response.json();

    if (data.data?.attributes?.checkout_url) {
      return NextResponse.json({ url: data.data.attributes.checkout_url });
    } else {
      console.error("PayMongo API returned error:", data);
      return NextResponse.json({ error: "PayMongo API Error", details: data }, { status: 500 });
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
