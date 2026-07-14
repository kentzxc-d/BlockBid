"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function AdminOverview() {
  const { user, ready } = usePrivy();
  const [stats, setStats] = useState<any>(null);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      setLoading(true);
      Promise.all([
        fetch(`/api/admin/stats?admin_id=${user.id}`).then(res => res.json()),
        fetch(`/api/admin/pending-projects?admin_id=${user.id}`).then(res => res.json())
      ])
        .then(([statsData, pendingData]) => {
          if (statsData.success) {
            setStats(statsData.stats);
          } else {
            setError(statsData.error || "Failed to load stats");
          }

          if (pendingData.success) {
            setPendingProjects(pendingData.projects);
          }
        })
        .catch(err => {
          console.error("Error fetching admin data:", err);
          setError("Network error fetching admin data");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, ready]);

  const handleAction = async (projectId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    setProcessingId(projectId);
    try {
      const res = await fetch("/api/admin/approve-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id, project_id: projectId, action })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list
        setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        alert(data.error || "Failed to process project");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setProcessingId(null);
    }
  };

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
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md font-mono text-xs uppercase tracking-widest mb-12">
            ERROR: {error}
          </div>
        )}

        {/* Pending Approvals Section */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-text-main font-heading tracking-tight uppercase">
            [ PENDING_APPROVALS ]
          </h2>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-mono text-xs font-bold tracking-widest">
            {pendingProjects.length} ITEMS
          </span>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="bg-surface rounded-md p-10 border border-border text-center">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">All Clear</h3>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">No pending projects require moderation.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingProjects.map((project) => (
              <div key={project.id} className="bg-surface rounded-md p-6 border border-amber-500/30 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-text-main text-lg font-heading tracking-tight">{project.title}</h3>
                  </div>
                  <p className="font-mono text-xs text-text-muted mb-4">{project.description}</p>
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                    Submitted: {new Date(project.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleAction(project.id, 'reject')}
                    disabled={processingId === project.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(project.id, 'approve')}
                    disabled={processingId === project.id}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
