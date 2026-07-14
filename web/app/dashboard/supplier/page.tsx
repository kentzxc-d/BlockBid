"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentChartBarIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import TopBidsCarousel from "@/components/TopBidsCarousel";
import LocationModal from "@/components/LocationModal";
import RoleGuard from "@/components/RoleGuard";

export default function UserDashboard() {
  const { user, ready } = usePrivy();
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeSolicitations, setActiveSolicitations] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [allMyBidProjectIds, setAllMyBidProjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (ready && user) {
      // Fetch user profile
      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile?.location) {
            setLocation(data.profile.location);
          }
        })
        .catch(err => console.error("Failed to fetch location", err));

      // Fetch open solicitations
      fetch('/api/procurements?filter=open')
        .then(res => res.json())
        .then(data => {
          if (data.projects) setActiveSolicitations(data.projects.slice(0, 3));
        });

      // Fetch user's bids
      fetch(`/api/bids?supplier_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.bids) {
            setMyBids(data.bids.slice(0, 3));
            setAllMyBidProjectIds(data.bids.map((b: any) => b.project_id));
          }
        });
    }
  }, [user, ready]);

  const handleSaveLocation = async (newLocation: string) => {
    setLocation(newLocation);
    if (user) {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, location: newLocation })
      });
    }
  };

  return (
    <RoleGuard allowedRoles={["supplier"]}>
      <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
      
      {/* Top Bids Carousel */}
      <TopBidsCarousel 
        location={location} 
        onOpenLocationModal={() => setIsLocationModalOpen(true)} 
      />

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        onSave={handleSaveLocation} 
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
          <div className="p-3 border border-border bg-gray-50 rounded-md">
            <DocumentChartBarIcon className="w-8 h-8 text-text-main" />
          </div>
          <div>
            <h3 className="text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-1">Total Bids</h3>
            <p className="text-3xl font-heading font-bold text-text-main">{myBids.length > 0 ? myBids.length : '0'}</p>
          </div>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
          <div className="p-3 border border-border bg-gray-50 rounded-md">
            <TrophyIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-1">Won Contracts</h3>
            <p className="text-3xl font-heading font-bold text-text-main">{myBids.filter(b => b.status === 'won').length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
          <div className="p-3 border border-border bg-gray-50 rounded-md">
            <ClockIcon className="w-8 h-8 text-text-main" />
          </div>
          <div>
            <h3 className="text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-1">Pending Eval</h3>
            <p className="text-3xl font-heading font-bold text-text-main">{myBids.filter(b => b.status === 'submitted').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Active Solicitations) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">[ ACTIVE_SOLICITATIONS ]</h2>
            <Link href="/dashboard/procurements" className="text-xs font-mono font-bold tracking-widest text-text-muted hover:text-text-main flex items-center gap-2 transition-colors uppercase">
              View All <ArrowRightIcon className="w-4 h-4 stroke-2" />
            </Link>
          </div>
          
          <div className="grid gap-4">
            {activeSolicitations.map((solicitation) => (
              <div key={solicitation.id} className="bg-surface rounded-md p-5 border border-border flex items-center justify-between group hover:border-text-main transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-border bg-gray-50 rounded-md group-hover:bg-primary/10 transition-colors">
                    <DocumentChartBarIcon className="w-5 h-5 text-text-main group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main font-heading group-hover:text-primary transition-colors tracking-tight text-sm">
                      {solicitation.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <AcademicCapIcon className="w-3 h-3" />
                        General
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-text-main mb-1 uppercase tracking-widest">
                    Due: {new Date(solicitation.deadline).toLocaleDateString()}
                  </p>
                  {solicitation.requestor_id === user?.id ? (
                    <span className="inline-flex items-center justify-center gap-1 px-4 py-1.5 bg-background border border-border text-text-muted font-mono text-[10px] font-bold tracking-widest rounded-md uppercase cursor-not-allowed">
                      YOUR_PROCUREMENT
                    </span>
                  ) : allMyBidProjectIds.includes(solicitation.id) ? (
                    <span className="inline-flex items-center justify-center gap-1 px-4 py-1.5 bg-background border border-border text-text-muted font-mono text-[10px] font-bold tracking-widest rounded-md uppercase cursor-not-allowed">
                      ALREADY_BID
                    </span>
                  ) : (
                    <Link 
                      href={`/dashboard/procurements/${solicitation.id}/bid`}
                      className="inline-flex items-center justify-center gap-1 px-4 py-1.5 bg-text-main text-white font-mono text-[10px] font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase"
                    >
                      SUBMIT_BID <ArrowRightIcon className="w-3 h-3 stroke-2" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (My Bids) */}
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold text-text-main font-heading tracking-tight uppercase">[ RECENT_BIDS ]</h2>
          </div>
          
          <div className="bg-surface rounded-md border border-border flex flex-col overflow-hidden">
            <div className="space-y-4">
            {myBids.map((bid) => (
              <div key={bid.id} className="bg-surface rounded-md p-5 border border-border">
                <div className="flex items-start justify-between mb-3 border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase block mb-1">
                      {bid.id.substring(0, 8)}
                    </span>
                    <h3 className="font-bold text-text-main text-sm font-heading tracking-tight leading-tight">
                      {bid.projects?.title || "Unknown Project"}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase border ${
                    bid.status === "submitted" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                    (bid.status === "won" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")
                  }`}>
                    {bid.status === "submitted" && <ClockIcon className="w-3 h-3 stroke-2" />}
                    {bid.status === "won" && <CheckCircleIcon className="w-3 h-3 stroke-2" />}
                    {bid.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <ClockIcon className="w-3 h-3" />
                    {new Date(bid.created_at).toLocaleDateString()}
                  </p>
                  <Link 
                    href="/dashboard/my-bids"
                    className="text-[10px] font-mono font-bold text-primary hover:text-text-main tracking-widest uppercase transition-colors"
                  >
                    VIEW_LEDGER →
                  </Link>
                </div>
              </div>
            ))}
            </div>
            <div className="p-4 border-t border-border bg-gray-50 text-center mt-auto">
              <Link href="/dashboard/my-bids" className="text-xs font-mono font-bold tracking-widest text-text-main hover:text-primary transition-colors flex items-center justify-center gap-2 uppercase">
                View_Ledger <ArrowRightIcon className="w-4 h-4 stroke-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </RoleGuard>
  );
}
