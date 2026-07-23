"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { useProfile } from "@/contexts/ProfileContext";
import { AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import AcquisitionCard from "@/components/AcquisitionCard";

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
  const { user } = usePrivy();
  const { adminData, loadingProfile } = useProfile();
  
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (adminData?.pendingProjects) {
      setPendingProjects(adminData.pendingProjects);
    }
  }, [adminData]);

  const stats = adminData?.stats || { totalUsers: 0, totalAcquisitions: 0, totalBids: 0, totalWonContracts: 0 };
  const analytics = adminData?.analytics || [];

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

  if (loadingProfile) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <h2 className="text-xl font-bold text-text-main font-heading tracking-widest uppercase">
              [ ASSEMBLING_ADMIN_DASHBOARD ]
            </h2>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mt-4">
              Gathering global statistics and analytics...
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

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
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>

          {/* Total Acquisitions */}
          <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
            <div className="p-3 border border-border bg-gray-50 rounded-md">
              <DocumentTextIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-text-muted font-mono text-[10px] font-bold tracking-widest uppercase mb-1">Open RFPs</h3>
              <p className="text-3xl font-heading font-bold text-text-main">
                {stats?.totalAcquisitions || 0}
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
                {stats?.totalBids || 0}
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
                {stats?.totalWonContracts || 0}
              </p>
            </div>
          </div>

        </div>

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
                  <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      minTickGap={20}
                    />
                    <YAxis
                      stroke="#888"
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<BrutalistTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="New Entities"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', style: { filter: 'drop-shadow(0px 0px 4px #3b82f6)' } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart: Acquisitions vs Bids */}
            <div className="bg-surface rounded-md p-6 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
              <h3 className="font-bold text-text-main font-heading text-lg mb-6 uppercase tracking-tight">[ Platform_Activity ]</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcquisitions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      minTickGap={20}
                    />
                    <YAxis
                      stroke="#888"
                      tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<BrutalistTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Area
                      type="monotone"
                      dataKey="acquisitions"
                      name="RFPs Created"
                      fill="url(#colorAcquisitions)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6', style: { filter: 'drop-shadow(0px 0px 4px #8b5cf6)' } }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bids"
                      name="Bids Submitted"
                      fill="url(#colorBids)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0px 0px 4px #10b981)' } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 h-[300px] bg-surface rounded-md border border-border flex items-center justify-center">
            <span className="text-text-muted font-mono text-xs uppercase tracking-widest">No analytics data available</span>
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
          <div className="bg-surface rounded-none p-10 border border-border text-center">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">All Clear</h3>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">No pending projects require moderation.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingProjects.map((project) => {
              const actionButton = (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleAction(project.id, 'reject')}
                    disabled={processingId === project.id}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-none font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 w-full"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(project.id, 'approve')}
                    disabled={processingId === project.id}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-none font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 w-full"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              );

              return (
                <AcquisitionCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  status="PENDING_APPROVAL"
                  location="Various" // Placeholder
                  estBudget={project.budget || "TBD"}
                  closingDate={`Submitted: ${new Date(project.created_at).toLocaleDateString()}`}
                  actionButton={actionButton}
                />
              );
            })}
          </div>
        )}

      </div>
    </RoleGuard>
  );
}

