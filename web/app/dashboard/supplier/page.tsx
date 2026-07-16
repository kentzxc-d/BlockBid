"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentChartBarIcon,
  TrophyIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import TopBidsCarousel from "@/components/TopBidsCarousel";
import LocationModal from "@/components/LocationModal";
import RoleGuard from "@/components/RoleGuard";
import { useProfile } from "@/contexts/ProfileContext";

export default function UserDashboard() {
  const { user, ready } = usePrivy();
  const { profile, loadingProfile, refreshProfile } = useProfile();
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeSolicitations, setActiveSolicitations] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [allMyBidProjectIds, setAllMyBidProjectIds] = useState<string[]>([]);
  const [wonBidsCount, setWonBidsCount] = useState(0);
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
    if (ready && user && !loadingProfile && profile) {
      if (profile.location) {
        setLocation(profile.location);
      }

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
            const wonBids = data.bids.filter((b: any) => b.status === 'won').length;
            setWonBidsCount(wonBids);
          }
        });
    }
  }, [user, ready, loadingProfile, profile]);

  const handleSaveLocation = async (newLocation: string) => {
    setLocation(newLocation);
    if (user) {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, location: newLocation })
      });
      await refreshProfile();
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

      {/* Greeting Card */}
      <div className="mb-8 mt-4 bg-surface relative overflow-hidden border border-border rounded-md p-6 shadow-sm">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold uppercase tracking-tight flex items-center gap-2 mb-1.5">
              <span className="text-primary/70">[</span> 
              <span className="text-text-main">{greeting},</span>
              <span className="text-primary">{profile?.nickname || 'SUPPLIER'}</span> 
              <span className="text-primary/70">]</span>
              {profile?.verification_status === 'verified' && (
                <Link href="/dashboard/verify" className="relative group ml-2 flex items-center justify-center cursor-pointer flex-shrink-0">
                  <Image src="/verified-badge.png" alt="Verified User" width={28} height={28} className="drop-shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-green-500/10 border border-green-500 text-green-600 font-mono text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                    [ Verified ]
                  </div>
                </Link>
              )}
              {wonBidsCount >= 10 && (
                <Link href="/dashboard/my-bids" className="relative group ml-1 flex items-center justify-center cursor-pointer flex-shrink-0">
                  <Image src="/veteran-badge.png" alt="Top Supplier" width={28} height={28} className="drop-shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500 text-blue-600 font-mono text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                    [ 10+ Wins ]
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

      {profile?.verification_status !== 'verified' && profile?.verification_status !== 'pending' && (
        <div className="bg-surface relative overflow-hidden border border-primary/30 rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-primary/10 text-primary rounded-full shrink-0 border border-primary/20">
              <CheckBadgeIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-main text-lg mb-0.5">Identity Verification Required</h3>
              <p className="text-text-muted font-body text-sm">Get verified to build reputation and increase your chances of winning bids.</p>
            </div>
          </div>
          <Link href="/dashboard/verify" className="relative z-10 shrink-0 px-6 py-3 bg-secondary hover:bg-secondary-hover text-white font-heading text-sm font-semibold rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Verify Identity
          </Link>
        </div>
      )}

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
