# ICT Office Acquisition System (BlockBid) - Design Spec

## 1. Overview
The system will be scaled down from a city-wide procurement system to an internal **Acquisition System** specifically for the ICT Office to ensure a controlled environment for initial rollout. The term "Procurement" will be entirely replaced with "Acquisition" throughout the platform to align with softer government terminology.

## 2. User Roles & Flow
*   **ICT Staff (Requester):** Creates Acquisition Requests.
*   **ICT Head (Approver):** Reviews and approves requests before they are published to suppliers. Also has the final authority to award the winning supplier.
*   **Supplier (Bidder):** Views approved requests and submits competitive bids on the blockchain.

## 3. Core Features

### A. Market-Driven SRP (Price Reference Catalog)
Since no real-time DTI API exists, the system will organically build its own Price Reference Catalog. 
*   **Mechanism:** When the ICT Head inputs an initial Approved Budget (ABC), and suppliers start bidding, the system records these prices. For future requests of the same item/category, the system will automatically suggest a reference price based on the historical average of previous winning bids.
*   **Benefit:** This creates a self-updating, realistic market price reference driven by local supplier data.

### B. Public Transparency Portal
A public-facing page accessible without login, serving as the system's transparency board.
*   **Displayed Data:** Item requested, current status, winning supplier, winning bid amount, and a direct link to the blockchain transaction for absolute verification.
*   **SEO Optimized:** Built with SEO best practices (meta tags, semantic HTML, clean URLs) so the public portal is easily searchable on Google.

### C. Superior UX & Premium Design
Unlike PhilGEPS which is outdated and cluttered, this system will feature a premium, highly intuitive UI.
*   Modern, clean dashboard for suppliers to easily track their bids.
*   Guided, step-by-step workflow for the ICT office.
*   Responsive design that works perfectly on desktop and mobile.

## 4. Differentiators from PhilGEPS (The "Selling Pitch")
1. **Unbeatable UX & SEO:** Clean, intuitive, and not cluttered. New users can navigate it without a manual. The public portal is searchable on Google.
2. **Immutability (Anti-Tampering):** Blockchain ensures bids cannot be altered or deleted by anyone (even admins) once submitted.
3. **Faster Payments (Supplier Buy-In):** Smart Contracts enable faster, automated escrow and payments, solving the government's notorious delayed payment issues. This is the primary incentive for suppliers to agree to public transactions.
4. **Verified Reputation:** Suppliers build a public, verifiable track record on the blockchain that they can use as marketing leverage for other projects.
