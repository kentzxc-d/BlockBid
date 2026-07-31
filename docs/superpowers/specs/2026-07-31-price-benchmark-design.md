# Price Benchmark System Design

## Overview
The Price Benchmark System provides government agencies and suppliers with a reliable reference for market prices, combining official baseline data with dynamic platform averages and crowdsourced supplier intelligence. This ensures competitive and fair bidding without relying on unstable third-party web scrapers.

## Components

### 1. Database Schema Additions
To support this feature, we need to track benchmark items and supplier proposals.

**Table: `benchmark_items`**
- `id` (uuid, primary key)
- `name` (string) - e.g., "Laptop", "A4 Bond Paper"
- `category` (string) - e.g., "IT Equipment", "Office Supplies"
- `base_srp` (numeric, nullable) - Official government SRP or base reference.
- `platform_average` (numeric, nullable) - The BlockBid average or approved market price.
- `created_at`, `updated_at` (timestamps)

**Table: `price_proposals`**
- `id` (uuid, primary key)
- `supplier_id` (uuid) - Reference to the supplier profile.
- `item_name` (string)
- `category` (string)
- `proposed_price` (numeric)
- `proof_link` (string, optional) - Link to a retailer or documentation.
- `status` (string) - 'pending', 'approved', 'rejected'
- `created_at` (timestamp)

### 2. User Interfaces

#### Price Benchmark Dashboard (`/dashboard/price-benchmark`)
- **Access:** Available to Admins, Requestors, and Suppliers.
- **Theme:** Standard clean dashboard UI (no brutalist elements, consistent with main dashboard pages).
- **Features:**
  - **Data Table:** Lists items searchable by category or name.
  - **Columns:** Item Name, Base SRP (DTI), BlockBid Average.
  - **No Trend Lines:** Keeping the interface simple and focused on current benchmark prices.
  - **Supplier Action:** If a supplier is logged in, a "Propose Market Price" button is visible, opening a standard modal form.

#### Admin Approval Portal
- **Access:** Admin only. Added as a new tab or section in the Admin Dashboard.
- **Features:**
  - A table of `pending` proposals from suppliers.
  - Actions: "Approve" (creates or updates a record in `benchmark_items`) and "Reject" (dismisses the proposal).

### 3. Data Flow & Logic
1. **Supplier Flow:** Supplier fills out the "Propose Market Price" form -> Creates a `pending` record in `price_proposals`.
2. **Admin Flow:** Admin reviews the `price_proposals` table. If approved, the system updates or creates an entry in `benchmark_items`, and sets the proposal status to `approved`.
3. **Display Flow:** The Price Benchmark page fetches data directly from the `benchmark_items` table. For the MVP, the `platform_average` will primarily be populated by these Admin approvals and seeded data to ensure quality control over the benchmarks.

## Scope & Next Steps
This design provides a robust, crowdsourced market intelligence feature without the legal and technical risks of automated web scraping. The next step is to create the implementation plan and execute the database updates and UI creation.
