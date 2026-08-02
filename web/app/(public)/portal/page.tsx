import { createClient } from "@supabase/supabase-js";
import PortalClient from "./PortalClient";

export const revalidate = 60; // Revalidate every minute

async function getAwardedAcquisitions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "dummy_url";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key_for_build";
  const supabase = createClient(supabaseUrl, supabaseKey);

      
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      status,
      awarded_at,
      awarded_supplier_id,
      location,
      budget,
      bids (
        id,
        supplier_id,
        on_chain_hash
      )
    `)
    .in("status", ["awarded", "closed"])
    .order("awarded_at", { ascending: false });

  if (error) {
    console.error("Error fetching portal data:", error);
    return [];
  }

  // Map the data to find the winning bid
  return data.map((project: any) => {
    const winningBid = project.bids?.find((b: any) => b.supplier_id === project.awarded_supplier_id);
    const totalPrice = 0;
    const onChainHash = winningBid?.on_chain_hash || null;

    return {
      id: project.id,
      title: project.title,
      awarded_at: project.awarded_at,
      total_price: totalPrice,
      on_chain_hash: onChainHash,
      location: project.location,
      budget: project.budget
    };
  });
}

export default async function TransparencyPortal() {
  const acquisitions = await getAwardedAcquisitions();

  return (
    <div className="min-h-screen bg-background">
      <PortalClient acquisitions={acquisitions} />
    </div>
  );
}
