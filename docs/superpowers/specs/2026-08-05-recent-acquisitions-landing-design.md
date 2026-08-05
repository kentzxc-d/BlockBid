# Recent Acquisitions Landing Page Design

## Purpose
Replace the static hardcoded HTML mockups on the landing page (`web/app/(public)/page.tsx`) with real data from the database, rendered beautifully using the existing `AcquisitionCard` component, while ensuring the database is protected from massive traffic spikes.

## Scope
*   **Data Fetching:** Fetch the 3 most recently created projects with `status = 'open'` from Supabase.
*   **Performance:** Use Next.js Incremental Static Regeneration (ISR) to cache the page at the CDN edge level for 60 seconds.
*   **Component Rendering:** Map over the fetched projects and display them using the `AcquisitionCard` component.
*   **UI Tweaks:** 
    *   Change the section title from "Recent Solicitations" to "Recent Acquisitions".
    *   Update the "View Transparency Portal" button theme to match the `bg-secondary text-white` (navy black) styling of the Top Up button.

## Architecture & Data Flow
1.  **Component Level:** `page.tsx` (Server Component).
2.  **Database Access:** Initialize `createClient` using `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` (or anon key for public data) directly inside the server component.
3.  **Query:** `supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(3)`
4.  **Caching Strategy:** Add `export const revalidate = 60;` at the top of the file. This tells Vercel's CDN to serve a cached HTML file to all visitors and only trigger a background rebuild (touching the database) a maximum of once every 60 seconds.

## UI Implementation Details
*   The `AcquisitionCard` requires specific props (`title`, `description`, `status`, `location`, `estBudget`, `closingDate`, `contractHash`). We will map the database fields to these props.
*   For `closingDate`, we will calculate the days left based on the `deadline` field minus the current date.
*   For the fallback (if no open projects exist), we will display a sleek, minimal "No open acquisitions at this time" message.

## Security & Error Handling
*   No sensitive data is fetched (these are public acquisitions).
*   If the database fetch fails, we will catch the error and render the fallback state instead of crashing the landing page.
