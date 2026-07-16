"use client";

import Link from "next/link";
import { 
  PlusCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  FolderOpenIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function MyProcurementsPage() {
  const { user } = usePrivy();
  const [procurements, setProcurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/procurements?requestor_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          const mappedProjects = data.projects.map((p: any) => ({
            id: p.id,
            title: p.title,
            createdAt: new Date(p.created_at).toLocaleDateString(),
            status: p.status.toUpperCase(),
            bidsCount: p.bids?.[0]?.count || 0,
            statusColor: p.status === 'open' ? "text-primary bg-primary/10 border-primary/20" : 
                         (p.status === 'awarded' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"),
            icon: p.status === 'open' ? ClockIcon : (p.status === 'awarded' ? CheckBadgeIcon : FolderOpenIcon)
          }));
          setProcurements(mappedProjects);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);
  return (
    <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
            [ MY_PROCUREMENTS ]
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Track solicitation status and review incoming bids.
          </p>
        </div>
        
        {/* Create New CTA */}
        <Link 
          href="/dashboard/requestor/new"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-text-main text-white hover:bg-primary rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          <PlusCircleIcon className="w-4 h-4 stroke-2" />
          CREATE_REQUEST
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-md p-6 border border-border flex flex-col hover:border-text-main transition-colors">
          <span className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-2">TOTAL_REQUESTS</span>
          <span className="text-3xl font-mono font-bold text-text-main">{procurements.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex flex-col hover:border-text-main transition-colors">
          <span className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-2">BIDS_RECEIVED</span>
          <span className="text-3xl font-mono font-bold text-primary">
            {procurements.reduce((acc, p) => acc + p.bidsCount, 0).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex flex-col hover:border-text-main transition-colors">
          <span className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-2">SUCCESSFULLY_AWARDED</span>
          <span className="text-3xl font-mono font-bold text-emerald-500">
            {procurements.filter(p => p.status === 'AWARDED').length.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* List of Procurements */}
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center">
          <h3 className="text-xs font-mono font-bold tracking-widest text-text-main uppercase">[ RECENT_SOLICITATIONS ]</h3>
        </div>
        
        <div className="divide-y divide-border">
          {procurements.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpenIcon className="w-10 h-10 text-text-muted mx-auto mb-3 stroke-1" />
              <p className="text-text-muted font-mono text-xs tracking-widest uppercase">Zero records found.</p>
            </div>
          ) : (
            procurements.map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">{req.id}</span>
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">| INIT: {req.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-text-main text-lg font-heading tracking-tight mb-3 group-hover:text-primary transition-colors">
                    {req.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono font-bold tracking-widest uppercase ${req.statusColor}`}>
                      <req.icon className="w-3 h-3 stroke-2" />
                      {req.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-text-main uppercase bg-gray-100 border border-border px-2 py-1 rounded-md">
                      BIDS: {req.bidsCount.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-3">
                  {req.status === 'AWARDED' ? (
                    <Link 
                      href={`/dashboard/procurements/${req.id}/workspace`} 
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md hover:bg-emerald-600 transition-colors whitespace-nowrap shadow-sm"
                    >
                      WORKSPACE <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                    </Link>
                  ) : (
                    <Link 
                      href={`/dashboard/procurements/${req.id}/evaluate`} 
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border text-text-main font-mono text-xs font-bold tracking-widest uppercase rounded-md hover:border-text-main hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      VIEW_BIDS <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
