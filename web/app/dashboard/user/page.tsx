"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
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

// Mock Data for Active Solicitations (Item Procurements)
const ACTIVE_SOLICITATIONS = [
  {
    id: "SOL-2026-001",
    title: "Supply of 500 Desktop Computers",
    sector: "Education",
    budget: "₱ 15,000,000",
    deadline: "3 Days",
    icon: AcademicCapIcon,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "SOL-2026-002",
    title: "Medical Grade Face Masks (100k pcs)",
    sector: "Institution",
    budget: "₱ 2,500,000",
    deadline: "12 Days",
    icon: BuildingOfficeIcon,
    bgColor: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    id: "SOL-2026-003",
    title: "Freelance Software Development Services",
    sector: "Individual",
    budget: "₱ 500,000",
    deadline: "5 Days",
    icon: UserGroupIcon,
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-500",
  }
];

// Mock Data for User's Bids
const MY_BIDS = [
  {
    id: "BID-0092",
    solicitationTitle: "Supply of 500 Desktop Computers",
    submittedAt: "2 Days Ago",
    status: "Under Evaluation",
    statusIcon: ClockIcon,
    statusColor: "text-warning",
    statusBg: "bg-amber-50",
    borderColor: "border-l-warning"
  },
  {
    id: "BID-0041",
    solicitationTitle: "Office Chairs (Ergonomic)",
    submittedAt: "1 Month Ago",
    status: "Won",
    statusIcon: CheckCircleIcon,
    statusColor: "text-secondary",
    statusBg: "bg-emerald-50",
    borderColor: "border-l-secondary"
  }
];

export default function UserDashboard() {
  const { user, ready } = usePrivy();

  // Extract a readable name or fallback to wallet address / 'User'
  const displayName = 
    user?.email?.address?.split('@')[0] || 
    (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "User");

  return (
    <div className="py-10 px-8 max-w-[1400px] mx-auto w-full">
      
      {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-main mb-2 font-heading tracking-tight">
            Welcome back, <span className="text-primary">{ready ? displayName : '...'}</span>
          </h1>
          <p className="text-text-muted text-sm md:text-base">
            Manage your bids, discover new opportunities, and track your success.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-50 rounded-xl">
              <DocumentChartBarIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-text-muted text-sm font-medium mb-1">Total Bids Submitted</h3>
              <p className="text-3xl font-bold text-text-main">12</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <TrophyIcon className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h3 className="text-text-muted text-sm font-medium mb-1">Bids Won</h3>
              <p className="text-3xl font-bold text-secondary">3</p>
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-50 rounded-xl">
              <ClockIcon className="w-8 h-8 text-warning" />
            </div>
            <div>
              <h3 className="text-text-muted text-sm font-medium mb-1">Pending Evaluation</h3>
              <p className="text-3xl font-bold text-warning">4</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Active Solicitations) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-main font-heading">Active Solicitations</h2>
              <Link href="/procurements" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4 stroke-2" />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {ACTIVE_SOLICITATIONS.map((solicitation) => (
                <div key={solicitation.id} className="bg-surface rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className={`p-3.5 rounded-xl ${solicitation.bgColor}`}>
                      <solicitation.icon className={`w-7 h-7 ${solicitation.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-lg group-hover:text-primary transition-colors">
                        {solicitation.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-muted font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {solicitation.sector}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          Est: {solicitation.budget}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-5 sm:pt-0 border-border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary">
                      Closes in {solicitation.deadline}
                    </span>
                    <Link 
                      href={`/procurements/${solicitation.id}`} 
                      className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      Submit Bid
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar (My Bids) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-main font-heading">My Recent Bids</h2>
            
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col">
              <div className="divide-y divide-border flex-1">
                {MY_BIDS.map((bid) => (
                  <div key={bid.id} className={`p-6 hover:bg-slate-50 transition-colors border-l-4 ${bid.borderColor}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-base font-bold text-text-main tracking-tight">{bid.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${bid.statusBg} ${bid.statusColor}`}>
                        <bid.statusIcon className="w-3.5 h-3.5 stroke-2" />
                        {bid.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-text-muted text-sm mb-1.5 leading-snug">
                      {bid.solicitationTitle}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Submitted {bid.submittedAt}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border bg-slate-50 text-center mt-auto">
                <Link href="/dashboard/bids" className="text-sm font-bold text-primary hover:text-primary-hover">
                  View all bid history
                </Link>
              </div>
            </div>
          </div>

      </div>
    </div>
  );
}
