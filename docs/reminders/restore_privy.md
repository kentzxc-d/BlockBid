# Reminder: Restore Privy Transactions

## Context
During testing on `2026-07-29`, we temporarily commented out the `walletClient.writeContract` calls for `approve` and `commitBid` in the bid submission page (`web/app/dashboard/acquisitions/[id]/bid/page.tsx`). 
This was done to allow testing the UI flow without requiring POL gas fees.

## Action Required
Before deploying to production or completing testing, you **MUST** uncomment the following blocks in `web/app/dashboard/acquisitions/[id]/bid/page.tsx`:

1. **Approve PHPB Transaction:**
   Remove the `/*` and `*/` around the `walletClient.readContract` and `walletClient.writeContract` logic for token allowance.
   Remove the `await new Promise(...)` mock delay.

2. **Commit Bid On-Chain Transaction:**
   Remove the `/*` and `*/` around the `walletClient.writeContract` for `commitBid`.
   Remove the `await new Promise(...)` mock delay and the dummy `commitHash`.

Failure to do this will result in bids being saved to Supabase without actual blockchain verification or bid bond locking!
