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

// Mock Data for Active Solicitations (Item Procurements)
const ACTIVE_SOLICITATIONS = [
  {
    id: "SOL-2026-001",
    title: "Supply of 500 Desktop Computers",
    sector: "Education",
    budget: "₱ 15,000,000",
    deadline: "3 Days",
    icon: AcademicCapIcon,
  },
  {
    id: "SOL-2026-002",
    title: "Medical Grade Face Masks (100k pcs)",
    sector: "Institution",
    budget: "₱ 2,500,000",
    deadline: "12 Days",
    icon: BuildingOfficeIcon,
  },
  {
    id: "SOL-2026-003",
    title: "Freelance Software Development Services",
    sector: "Individual",
    budget: "₱ 500,000",
    deadline: "5 Days",
    icon: UserGroupIcon,
  }
];

// Mock Data for User's Bids
const MY_BIDS = [
  {
    id: "BID-0092",
    solicitationTitle: "Supply of 500 Desktop Computers",
    submittedAt: "2 Days Ago",
    status: "UNDER EVALUATION",
    statusIcon: ClockIcon,
  },
  {
    id: "BID-0041",
    solicitationTitle: "Office Chairs (Ergonomic)",
    submittedAt: "1 Month Ago",
    status: "AWARDED",
    statusIcon: CheckCircleIcon,
  }
];

export default function UserDashboard() {
  const { user, ready } = usePrivy();
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    if (ready && user) {
      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile?.location) {
            setLocation(data.profile.location);
          }
        })
        .catch(err => console.error("Failed to fetch location", err));
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
      <div className="py-10 px-8 max-w-7xl mx-auto w-full">
      
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
            <p className="text-3xl font-heading font-bold text-text-main">12</p>
          </div>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
          <div className="p-3 border border-border bg-gray-50 rounded-md">
            <TrophyIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-1">Won Contracts</h3>
            <p className="text-3xl font-heading font-bold text-text-main">3</p>
          </div>
        </div>
        <div className="bg-surface rounded-md p-6 border border-border flex items-center gap-5 hover:bg-gray-50 transition-colors">
          <div className="p-3 border border-border bg-gray-50 rounded-md">
            <ClockIcon className="w-8 h-8 text-text-main" />
          </div>
          <div>
            <h3 className="text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-1">Pending Eval</h3>
            <p className="text-3xl font-heading font-bold text-text-main">4</p>
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
            {ACTIVE_SOLICITATIONS.map((solicitation) => (
              <div key={solicitation.id} className="bg-surface rounded-md p-6 border border-border hover:border-text-main transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="p-3 border border-border bg-gray-50 rounded-md group-hover:bg-primary/10 transition-colors">
                    <solicitation.icon className="w-6 h-6 text-text-main group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-lg font-heading group-hover:text-primary transition-colors tracking-tight">
                      {solicitation.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-text-muted uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-md bg-text-muted"></span>
                        {solicitation.sector}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-md bg-primary"></span>
                        EST: {solicitation.budget}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-5 sm:pt-0 border-border">
                  <span className="font-mono text-xs font-bold text-text-main">
                    T-{solicitation.deadline}
                  </span>
                  <Link 
                    href={`/dashboard/procurements/${solicitation.id}/bid`} 
                    className="px-6 py-2 bg-text-main text-white text-xs font-mono font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase flex items-center gap-2"
                  >
                    Submit_Bid <ArrowRightIcon className="w-4 h-4 stroke-2" />
                  </Link>
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
            <div className="divide-y divide-border flex-1">
              {MY_BIDS.map((bid) => (
                <div key={bid.id} className="p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-primary group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-mono font-bold text-text-main tracking-widest uppercase">{bid.id}</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-border bg-white rounded-md text-[10px] font-mono font-bold tracking-widest text-text-main uppercase group-hover:border-text-main transition-colors">
                      <bid.statusIcon className="w-3 h-3 stroke-2" />
                      {bid.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-text-main text-sm mb-2 leading-snug font-heading">
                    {bid.solicitationTitle}
                  </h4>
                  <p className="text-[10px] font-mono text-text-muted font-bold tracking-widest uppercase flex items-center gap-1.5">
                    <ClockIcon className="w-3 h-3" /> T-minus {bid.submittedAt}
                  </p>
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
