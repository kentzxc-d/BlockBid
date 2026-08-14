import { NextResponse } from 'next/server';
import { privy } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Secret (to ensure request is from Supabase)
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await req.json();
    const { type, table, record, old_record } = body;

    // We only care about projects being updated to 'awarded'
    if (table !== 'projects' || type !== 'UPDATE') {
      return NextResponse.json({ message: 'Ignored: not a project update' });
    }

    // If status changed to awarded
    if (record.status === 'awarded' && old_record?.status !== 'awarded' && record.awarded_supplier_id) {
      // 3. Get supplier details from Privy
      let supplierEmail = '';
      let supplierName = 'Supplier';

      try {
        const user = await privy.getUser(record.awarded_supplier_id);
        // Privy stores emails in linked accounts
        const emailAccount = user.linkedAccounts.find((acc) => acc.type === 'email') as any;
        const googleAccount = user.linkedAccounts.find((acc) => acc.type === 'google_oauth') as any;
        
        if (emailAccount && emailAccount.address) {
          supplierEmail = emailAccount.address;
        } else if (googleAccount && googleAccount.email) {
          supplierEmail = googleAccount.email;
        }

        // Try to get nickname from customMetadata if available (or we just use 'Supplier')
        if (user.customMetadata?.nickname) {
          supplierName = String(user.customMetadata.nickname);
        }
      } catch (err) {
        console.error('Error fetching Privy user:', err);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
      }

      if (!supplierEmail) {
        console.error('No email found for supplier:', record.awarded_supplier_id);
        return NextResponse.json({ error: 'No email found for supplier' }, { status: 400 });
      }

      // 4. Send email using Resend
      const { data, error } = await resend.emails.send({
        from: 'BlockBid <onboarding@blockbid.site>',
        to: [supplierEmail],
        subject: `🎉 You've been awarded a contract: ${record.title}`,
        html: `
          <div style="font-family: monospace; padding: 24px; max-width: 600px; margin: 0 auto; background: #fafafa; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #111; font-family: sans-serif; text-transform: uppercase;">[ CONTRACT_AWARDED ]</h1>
            </div>
            
            <p style="color: #333; font-size: 16px;">Hello ${supplierName},</p>
            
            <p style="color: #333; font-size: 16px;">
              Congratulations! Your bid for the project <strong>"${record.title}"</strong> has been accepted and awarded to you.
            </p>
            
            <div style="background: #eef2ff; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #4f46e5; font-weight: bold;">NEXT STEPS</p>
              <p style="margin: 8px 0 0 0; color: #333;">
                Please log in to your BlockBid Dashboard to review the final contract terms, accept the award on-chain, and begin fulfillment.
              </p>
            </div>
            
            <a href="https://ck-bid.vercel.app/dashboard/my-bids" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 2px;">
              VIEW MY BIDS
            </a>
            
            <hr style="border: none; border-top: 1px dashed #ccc; margin: 32px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">
              This is an automated message from BlockBid. Please do not reply directly to this email.
            </p>
          </div>
        `
      });

      if (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Email sent successfully', data });
    }

    return NextResponse.json({ message: 'No action required' });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
