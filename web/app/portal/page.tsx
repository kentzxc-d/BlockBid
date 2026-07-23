import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const revalidate = 60; // Revalidate every minute

async function getAwardedAcquisitions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      status,
      awarded_at,
      awarded_supplier_id,
      bids (
        id,
        supplier_id,
        on_chain_hash,
        bid_values (
          total_price
        )
      )
    `)
    .eq("status", "awarded")
    .order("awarded_at", { ascending: false });

  if (error) {
    console.error("Error fetching portal data:", error);
    return [];
  }

  // Map the data to find the winning bid
  return data.map((project: any) => {
    const winningBid = project.bids?.find((b: any) => b.supplier_id === project.awarded_supplier_id);
    const totalPrice = winningBid?.bid_values?.total_price || 0;
    const onChainHash = winningBid?.on_chain_hash || null;

    return {
      id: project.id,
      title: project.title,
      awarded_at: project.awarded_at,
      total_price: totalPrice,
      on_chain_hash: onChainHash
    };
  });
}

export default async function TransparencyPortal() {
  const acquisitions = await getAwardedAcquisitions();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="mb-12 border-b border-border pb-6">
          <h1 className="text-4xl font-heading font-black tracking-tighter uppercase mb-4 text-text-main">
            Public Transparency Portal
          </h1>
          <p className="text-sm font-mono font-bold tracking-widest uppercase text-text-muted">
            Blockchain-verified government acquisitions
          </p>
        </div>

        {acquisitions.length === 0 ? (
          <div className="p-12 border border-dashed border-border flex flex-col items-center justify-center text-center">
            <p className="text-sm font-mono font-bold tracking-widest text-text-muted uppercase">
              No awarded acquisitions found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {acquisitions.map((item) => (
              <div key={item.id} className="bg-surface border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary transition-colors group">
                <div>
                  <h2 className="text-xl font-bold font-heading text-text-main uppercase tracking-tight mb-2">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-widest text-text-muted uppercase">
                    <span>Awarded: {new Date(item.awarded_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-primary">₱{item.total_price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {item.on_chain_hash ? (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${item.on_chain_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-border bg-background hover:bg-primary/5 hover:text-primary transition-colors text-xs font-mono font-bold tracking-widest uppercase"
                    >
                      <span>Verify on Blockchain</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="px-4 py-2 border border-dashed border-border text-text-muted text-xs font-mono font-bold tracking-widest uppercase">
                      Syncing to Blockchain...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
