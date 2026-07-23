import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import styles from "../page.module.css";

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
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="mb-16 border-b-2 border-border-inverse pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tighter uppercase mb-2 text-text-main">
              Public Transparency Portal
            </h1>
            <p className="text-sm font-mono font-bold tracking-widest uppercase text-text-muted">
              Blockchain-verified government acquisitions
            </p>
          </div>
          <div className="font-mono text-xs font-bold text-text-muted uppercase tracking-widest">
            {acquisitions.length} AWARDED
          </div>
        </div>

        {acquisitions.length === 0 ? (
          <div className="p-12 border border-dashed border-border flex flex-col items-center justify-center text-center">
            <p className="text-sm font-mono font-bold tracking-widest text-text-muted uppercase">
              No awarded acquisitions found.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {acquisitions.map((item) => (
              <div key={item.id} className={styles.projectCard}>
                <div className={styles.projectCardHeader}>
                  <h3 className={styles.projectCardTitle}>{item.title}</h3>
                  <span className="badge" style={{ backgroundColor: '#1E293B', color: '#F9F9F6', borderRadius: '0', fontFamily: 'var(--font-mono)' }}>STATUS: AWARDED</span>
                </div>
                
                <div className={styles.projectMeta} style={{ marginTop: 'auto' }}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date Awarded</span>
                    <span className={styles.metaValue}>{new Date(item.awarded_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Winning Bid</span>
                    <span className={styles.metaValue} style={{ color: 'var(--color-primary)' }}>₱{item.total_price.toLocaleString()}</span>
                  </div>
                  
                  {item.on_chain_hash ? (
                    <div className={styles.metaItem} style={{ marginLeft: 'auto' }}>
                      <span className={styles.metaLabel}>Verification</span>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${item.on_chain_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                        style={{ fontWeight: 600 }}
                      >
                        <span>View on Polygon</span>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className={styles.metaItem} style={{ marginLeft: 'auto' }}>
                      <span className={styles.metaLabel}>Verification</span>
                      <span className="text-text-muted">Syncing to Blockchain...</span>
                    </div>
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
