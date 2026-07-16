# BlockBid: Self-Sustaining Marketplace Design

## 1. Goal Description
The objective is to make BlockBid a self-sustaining B2B/B2G marketplace using blockchain technology. The system must accommodate non-crypto users (government agencies, traditional businesses) while leveraging smart contracts for transparency, trust, and platform monetization (to cover AI and API costs). Importantly, the design must comply with standard procurement laws (such as RA 9184 in the Philippines), which restrict advance payments.

## 2. Architecture: Verified Promissory Escrow with Optional Financing

### For Government / Requesters
*   **No Advance Payments:** Adapts to procurement laws where agencies pay only after delivery and inspection.
*   **On-Chain Budget Lock (Digital ABC):** Instead of fiat/crypto, the requester locks a verified "Approved Budget for the Contract" (ABC) or digital Notice of Award on the blockchain.
*   **Proof of Delivery:** Physical Delivery Receipts (DR) and Inspection and Acceptance Reports (IAR) are digitally signed by the requester via the platform and cryptographically hashed on-chain to trigger contract completion.

### For Bidders / Sellers
*   **Immutable Digital PO:** Winning bidders receive a "Digital Purchase Order" (NFT/Smart Contract token) guaranteeing they won the bid and that the budget is allocated.
*   **Factoring / Fast-Cash Option:** Sellers holding the Digital PO have the option to liquidate/collateralize it to platform investors for an advance payment, solving the delay in government check disbursement.

## 3. Platform Monetization (Fees) & Fiat On-Ramp

### Fee Collection (Revenue Model)
*   **Bidding Deposit:** Sellers must maintain a balance in their BlockBid wallet (e.g., 1% to 2% of their bid amount) to participate.
*   **Smart Contract Execution:**
    *   If a seller loses the bid, the deposit remains available in their wallet.
    *   If a seller wins and the delivery is confirmed, the smart contract automatically deducts the percentage fee and transfers it to the platform's revenue wallet.

### Non-Crypto User Top-up (Fiat-to-Token Automation)
*   **Account Abstraction:** Users receive an "invisible wallet" created automatically upon email/Google login. No seed phrases are exposed.
*   **Web2 Payment Gateway:** Users top-up their bidding deposit using GCash, Maya, or Credit Card via a payment processor (e.g., PayMongo).
*   **Webhook & Minting:** A successful fiat payment triggers a webhook to the BlockBid backend, which instructs the smart contract to mint 1:1 stable tokens (e.g., BlockBid PHP Tokens) to the user's invisible wallet.
*   **UI Representation:** Users see a regular fiat balance in the dashboard (e.g., "Balance: ₱5,000.00").

## 4. Identity Verification & Reputation (KYC/KYB)

### Verification Requirements
*   **Companies (KYB):** DTI/SEC Registration, BIR Form 2303, Mayor's Permit, and PhilGEPS Number (if applicable).
*   **Individuals (KYC):** Primary Government ID, Selfie liveness verification, and TIN/Proof of Billing.

### Implementation: Manual Admin Dashboard (MVP Phase)
*   **Zero-Cost Upload:** Users upload required documents directly to the platform's secure off-chain storage.
*   **Admin Review:** Platform administrators manually verify the uploaded documents to avoid expensive API costs during the startup phase.
*   **On-Chain Reputation:** Upon admin approval, the smart contract mints a **"Verified Badge" (Soulbound Token)** to the user's wallet.
*   **Badge Mechanics:** This badge is an un-transferable NFT. It serves as public proof of legitimacy on their profile and can be revoked (burned) by the admin in case of fraud or platform violations.
