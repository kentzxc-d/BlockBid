"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon 
} from "@heroicons/react/24/outline";

export default function AdminOverview() {
  const { user, ready } = usePrivy();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      setLoading(true);
      fetch(`/api/admin/stats?admin_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats);
          } else {
            setError(data.error || "Failed to load stats");
          }
        })
        .catch(err => {
          console.error("Error fetching stats:", err);
          setError("Network error");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, ready]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="py-10 px-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
              [ PLATFORM_OVERVIEW ]
            </h1>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
              Global system statistics and health metrics.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Total Users */}
          <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
            <div className="p-3 border border-border bg-gray-50 rounded-md">
              <UsersIcon className="w-8 h-8 text-text-main" />
            </div>
            <div>
              <h3 className="text-text-muted font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Total Entities</h3>
              <p className="text-3xl font-heading font-bold text-text-main">
                {loading ? "..." : stats?.totalUsers || 0}
              </p>
            </div>
          </div>

          {/* Total Procurements */}
          <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
            <div className="p-3 border border-border bg-gray-50 rounded-md">
              <DocumentTextIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-text-muted font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Open RFPs</h3>
              <p className="text-3xl font-heading font-bold text-text-main">
                {loading ? "..." : stats?.totalProcurements || 0}
              </p>
            </div>
          </div>

          {/* Total Bids */}
          <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
            <div className="p-3 border border-border bg-gray-50 rounded-md">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-text-main" />
            </div>
            <div>
              <h3 className="text-text-muted font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Total Bids</h3>
              <p className="text-3xl font-heading font-bold text-text-main">
                {loading ? "..." : stats?.totalBids || 0}
              </p>
            </div>
          </div>

          {/* Awarded Contracts */}
          <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
            <div className="p-3 border border-border bg-gray-50 rounded-md">
              <TrophyIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-text-muted font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Awarded</h3>
              <p className="text-3xl font-heading font-bold text-text-main">
                {loading ? "..." : stats?.totalWonContracts || 0}
              </p>
            </div>
          </div>

        </div>
        
        {/* Error Handling */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md font-mono text-xs uppercase tracking-widest">
            ERROR: {error}
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
