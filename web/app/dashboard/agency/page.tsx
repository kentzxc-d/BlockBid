"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { ClockIcon, CheckBadgeIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import { useProfile } from "@/contexts/ProfileContext";

export default function AgencyDashboard() {
  const { ready, user } = usePrivy();
  const { profile } = useProfile();
  const [procurements, setProcurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("WELCOME BACK");
  const [currentTime, setCurrentTime] = useState("");
  const [blockHeight, setBlockHeight] = useState(18239012);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING");
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const blockInterval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 12000);
    
    return () => {
      clearInterval(interval);
      clearInterval(blockInterval);
    };
  }, []);

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
          setProcurements(mappedProjects.slice(0, 3)); // Show top 3 recent
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-6 px-4 md:py-10 md:px-8">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">[ INITIALIZING_AGENCY_WORKSPACE ]</div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["requestor"]}>
      <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          {/* Greeting Card */}
          <div className="mb-8 mt-2 bg-surface relative overflow-hidden border border-border rounded-md p-6 shadow-sm">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-primary/30 to-transparent" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-heading font-bold uppercase tracking-tight flex items-center gap-2 mb-1.5">
                  <span className="text-primary/70">[</span> 
                  <span className="text-text-main">{greeting},</span>
                  <span className="text-primary">{profile?.nickname || 'AGENCY'}</span> 
                  <span className="text-primary/70">]</span>
                  {profile?.verification_status === 'verified' && (
                    <Link href="/dashboard/verify" className="relative group ml-2 flex items-center justify-center cursor-pointer flex-shrink-0">
                      <Image src="/verified-badge.png" alt="Verified User" width={28} height={28} className="drop-shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-green-500/10 border border-green-500 text-green-600 font-mono text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                        [ Verified ]
                      </div>
                    </Link>
                  )}
                  {/* FOR TESTING ONLY: Force show badge */}
                  {true && (
                    <Link href="/dashboard/agency" className="relative group ml-1 flex items-center justify-center cursor-pointer flex-shrink-0">
                      <Image src="/veteran-badge.png" alt="Top Performer" width={28} height={28} className="drop-shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500 text-blue-600 font-mono text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                        [ {profile?.role === 'requestor' ? 'Procuring Agency' : profile?.role === 'both' ? 'Dual / Undefined' : 'Supplier / Bidder'} ]
                      </div>
                    </Link>
                  )}
                </h2>
                <div className="flex items-center gap-3 text-text-muted font-mono text-xs uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    System Ready
                  </div>
                  <span className="opacity-30">|</span>
                  <span>Authentication Active</span>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end border-l border-border/50 pl-6 space-y-1.5 relative">
                <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-0.5">
                  Network Status
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-primary/70">BLOCK_HEIGHT:</span>
                  <span className="text-xs font-mono text-text-main font-bold">#{blockHeight.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-primary/70">LOCAL_TIME:</span>
                  <span className="text-xs font-mono text-text-main font-bold w-[60px] text-right">{currentTime || "--:--:--"}</span>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">[ PROCURING_AGENT_WORKSPACE ]</h1>
          <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase">Procurement_&_Evaluation_Hub</p>
        </div>

        {profile?.verification_status !== 'verified' && profile?.verification_status !== 'pending' && (
          <div className="bg-surface relative overflow-hidden border border-primary/30 rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            {/* Subtle Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-primary/10 text-primary rounded-full shrink-0 border border-primary/20">
                <CheckBadgeIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-text-main text-lg mb-0.5">Identity Verification Required</h3>
                <p className="text-text-muted font-body text-sm">Get verified to establish your agency's legitimacy and build trust with suppliers.</p>
              </div>
            </div>
            <Link href="/dashboard/verify" className="relative z-10 shrink-0 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white font-heading text-sm font-semibold rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Verify Identity
            </Link>
          </div>
        )}

        {procurements.length === 0 ? (
          <div className="bg-surface rounded-none p-8 border border-border hover:border-text-main transition-colors text-center py-20">
            <h2 className="text-xl font-bold text-text-main font-heading tracking-tight uppercase mb-4">No Active Projects</h2>
            <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase mb-8">You have not posted any procurements yet.</p>
            
            <Link 
              href="/dashboard/agency/new"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-background hover:bg-primary-hover font-mono text-sm font-bold uppercase tracking-widest transition-colors rounded-none shadow-md shadow-primary/20 border border-primary hover:-translate-y-0.5"
            >
              [ POST_NEW_PROCUREMENT ] <ArrowRightIcon className="w-5 h-5 stroke-2" />
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold tracking-widest text-text-main uppercase">[ RECENT_SOLICITATIONS ]</h3>
              <Link href="/dashboard/my-procurements" className="text-xs font-mono font-bold tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-1 uppercase">
                VIEW_ALL <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {procurements.map((req) => (
                <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">{req.id.substring(0, 8)}</span>
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
                    <Link 
                      href={`/dashboard/procurements/${req.id}/evaluate`} 
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border text-text-main font-mono text-xs font-bold tracking-widest uppercase rounded-md hover:border-text-main hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      VIEW_BIDS <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
