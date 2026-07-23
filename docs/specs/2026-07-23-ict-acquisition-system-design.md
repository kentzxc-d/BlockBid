# ICT Acquisition System - Design Specification
Date: 2026-07-23

## 1. Overview
The BlockBid system is being tailored for the City Hall's ICT Office as its primary internal acquisition platform. This controlled rollout ensures a manageable environment before a potential city-wide implementation. The system will pivot from using the term "Procurement" to "Acquisition" to align with internal government preferences.

## 2. Key Differentiators from PhilGEPS
*   **Modern UI/UX:** Unlike PhilGEPS, which is often considered cluttered and outdated, this system will feature a premium, highly intuitive, and modern interface. It is designed to be extremely user-friendly for both government staff and suppliers, lowering the barrier to entry.
*   **Blockchain Immutability:** Bids and transactions are recorded on the blockchain, eliminating tampering and ensuring absolute transparency.
*   **Speed for Small Value:** Streamlined for faster turnaround times compared to traditional government bulletin boards.

## 3. User Roles
The system simplifies user roles for the initial rollout:
*   **ICT Staff (Requester):** Creates Acquisition Requests for items needed by the office.
*   **ICT Head (Approver):** Reviews and approves requests before they are published to suppliers. They also have the final say in awarding the winning bid.
*   **Supplier (Bidder):** Views approved requests and submits their bids.

## 4. Item Catalog & Dynamic Reference Pricing (SRP)
*   Instead of relying on a static DTI API, the system will utilize a **Historical Market-Driven SRP**.
*   When the ICT Head inputs an Approved Budget for the Contract (ABC) for the first time, it acts as the baseline.
*   As suppliers bid and win over time, the system aggregates this data. Future requests for the same item category (e.g., "Desktop Computers") will automatically suggest a reference price based on past winning bids, ensuring the budget reflects real local market conditions.
*   Categories are dynamically generated based on the actual items being acquired by the ICT office.

## 5. Public Transparency Portal
*   A dedicated, login-free portal will display all completed and awarded acquisitions by the ICT office.
*   **Displayed Data:** Item requested, current status, winning supplier, winning bid amount, and a verification link to the blockchain transaction.
*   **Supplier Incentive:** Suppliers are incentivized to participate transparently because (1) it is a government requirement, (2) it builds their public "Verified Vendor" track record which can be used as a credential elsewhere, and (3) the transparent system guarantees much faster payment processing.

## 6. Terminology Changes
*   All instances of the word "Procurement" in the UI will be replaced with "Acquisition" (e.g., "Acquisition Request", "My Acquisitions").
