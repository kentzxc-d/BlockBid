# BlockBid: Self-Sustaining Marketplace & Verified Escrow Proposal

## 1. Overview
A proposal for BlockBid to implement a self-sustaining financial model using blockchain technology, tailored for B2G (Business-to-Government) and B2B (Business-to-Business) bidding constraints. The model introduces a mechanism to secure platform fees, integrate fiat-to-crypto onboarding, and enforce trust without violating government procurement laws (e.g., RA 9184).

## 2. Core Architecture: Verified Promissory Escrow
To balance fairness between the Requestor (Government/School) and the Bidder (Seller):

- **No Upfront Fiat Lock for Requestors:** Government agencies cannot legally pay in advance. Instead, they lock a digital **"Certificate of Availability of Funds"** or **ABC (Approved Budget for the Contract)** on-chain.
- **Digital Purchase Order (PO):** Upon winning, the smart contract mints a unique "Digital PO Token" (an NFT) for the winning bidder, providing immutable cryptographic proof of the contract award.
- **Proof of Delivery (Bridging Physical & Digital):** Sellers upload signed physical Delivery Receipts (DR) and Inspection and Acceptance Reports (IAR). The platform hashes these documents on-chain, and the Requestor uses their digital signature (via an invisible wallet) to acknowledge receipt.
- **Optional Financing (DeFi Factoring):** Because government payments are historically delayed, sellers holding the Digital PO Token can opt to sell or collateralize it to platform liquidity providers for immediate cash, allowing the platform to earn an additional financing fee.

## 3. Platform Sustainability & Revenue
To ensure BlockBid can fund AI, API, and server costs:

- **Bidding Deposit Requirement:** Sellers must hold a minimum balance (e.g., 1-2% of the bid amount) in their BlockBid Wallet to participate in an auction.
- **Smart Contract Deduction:** If the seller loses the bid, the deposit is unlocked. If they win and the contract is fulfilled, the smart contract automatically deducts this deposit as the **Platform Fee** and transfers it to the platform's treasury.

## 4. Top-Up and Cash-Out (Fiat On/Off-Ramp)
Designed for non-crypto-native users to eliminate friction:

- **Invisible Wallets (Account Abstraction):** Users log in via Email/Google. The platform provisions a blockchain wallet in the background—no seed phrases required.
- **Top-Up (Fiat to Crypto):** Integrated with PayMongo or Xendit. Users pay via GCash, Maya, or Credit Card. Upon successful webhook confirmation, the smart contract mints **BlockBid Tokens** (pegged 1:1 to PHP) to their wallet.
- **Cash-Out (Crypto to Fiat):** Users request a withdrawal. The smart contract burns the requested tokens, and the backend triggers a payout API to send actual PHP to the user's GCash or Bank account.
- **Testing Methodology:** During MVP development, integration will be tested using Sandbox API keys (PayMongo) and a Blockchain Testnet (e.g., Sepolia/Amoy) with simulated webhooks.

## 5. Trust & Reputation System (KYC/KYB)
To prevent "joy bidding" and ensure legitimacy:

- **KYB (For Companies):** Requires DTI/SEC Registration, BIR Form 2303, Mayor's Permit, and PhilGEPS Registration.
- **KYC (For Individuals):** Requires Primary ID (Philsys/Passport) and Liveness (Selfie) Verification.
- **MVP Implementation:** A zero-cost "Manual Admin Dashboard" where admins review uploaded documents before manually clicking "Approve".
- **Soulbound Tokens (SBT):** Upon approval, the smart contract mints a "Verified Badge" (an SBT that cannot be transferred) to the user's wallet. Bad actors can have their badge "burned" (revoked) by the platform, permanently blocking them from bidding.

## 6. Open Questions / Next Steps
- TBD: Exact percentage for the Bidding Deposit/Platform Fee.
- TBD: Selection of the primary Payment Gateway for the MVP (PayMongo vs. Xendit).
- TBD: Selection of the L2 Blockchain Network (e.g., Polygon, Base, or Arbitrum) for low gas fees.
