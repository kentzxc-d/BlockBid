"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const BrutalistTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border-2 border-border p-4 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <p className="text-text-main font-bold uppercase tracking-widest text-[10px] mb-3 pb-2 border-b border-border">
          [ {label} ]
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-8 mb-1 last:mb-0 text-xs">
            <span style={{ color: entry.color }} className="uppercase font-bold tracking-wider">{entry.name}:</span>
            <span className="text-text-main font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminOverview() {
  const { user, ready } = usePrivy();
  const [stats, setStats] = useState<any>(null);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    if (ready && user) {
      setLoading(true);
      Promise.all([
        fetch(`/api/admin/stats?admin_id=${user.id}`).then(res => res.json()),
        fetch(`/api/admin/pending-projects?admin_id=${user.id}`).then(res => res.json()),
        fetch(`/api/admin/analytics?admin_id=${user.id}`).then(res => res.json())
      ])
        .then(([statsData, pendingData, analyticsData]) => {
          if (statsData.success) {
            setStats(statsData.stats);
          } else {
            setError(statsData.error || "Failed to load stats");
          }

          if (pendingData.success) {
            setPendingProjects(pendingData.projects);
          }

          if (analyticsData && analyticsData.success) {
            setAnalytics(analyticsData.data);
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
      <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
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

        {/* Analytics Section */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-text-main font-heading tracking-tight uppercase">
            [ ACTIVITY_ANALYTICS ]
          </h2>
          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md font-mono text-xs font-bold tracking-widest uppercase">
            Last 30 Days
          </span>
        </div>

        {analytics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Line Chart: Users */}
            <div className="bg-surface rounded-md p-6 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
              <h3 className="font-bold text-text-main font-heading text-lg mb-6 uppercase tracking-tight">[ Entity_Registrations ]</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }} 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#888" 
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<BrutalistTooltip />} cursor={{ stroke: '#333', strokeWidth: 2, strokeDasharray: '4 4' }} />
                    <Line 
                      type="stepAfter" 
                      dataKey="users" 
                      name="New Entities" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Procurements vs Bids */}
            <div className="bg-surface rounded-md p-6 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
              <h3 className="font-bold text-text-main font-heading text-lg mb-6 uppercase tracking-tight">[ Platform_Activity ]</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }} 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#888" 
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<BrutalistTooltip />} cursor={{ fill: '#333', opacity: 0.2 }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Bar dataKey="procurements" name="RFPs Created" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="bids" name="Bids Submitted" fill="#10b981" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 h-[300px] bg-surface rounded-md border border-border flex items-center justify-center">
            {loading ? (
              <span className="animate-pulse text-text-muted font-mono text-xs uppercase tracking-widest">Loading Analytics...</span>
            ) : (
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest">No analytics data available</span>
            )}
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
