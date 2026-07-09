"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon 
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
    iconColor: "text-blue-600",
  },
  {
    id: "SOL-2026-002",
    title: "Medical Grade Face Masks (100k pcs)",
    sector: "Institution",
    budget: "₱ 2,500,000",
    deadline: "12 Days",
    icon: BuildingOfficeIcon,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    id: "SOL-2026-003",
    title: "Freelance Software Development Services",
    sector: "Individual",
    budget: "₱ 500,000",
    deadline: "5 Days",
    icon: UserGroupIcon,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
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
    statusColor: "text-amber-600",
    statusBg: "bg-amber-100"
  },
  {
    id: "BID-0041",
    solicitationTitle: "Office Chairs (Ergonomic)",
    submittedAt: "1 Month Ago",
    status: "Won",
    statusIcon: CheckCircleIcon,
    statusColor: "text-green-600",
    statusBg: "bg-green-100"
  }
];

export default function UserDashboard() {
  const { user, ready } = usePrivy();

  // Extract a readable name or fallback to wallet address / 'User'
  const displayName = 
    user?.email?.address?.split('@')[0] || 
    (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "User");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl mx-auto px-4">
        
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-main mb-2 font-heading tracking-tight">
            Welcome back, <span className="text-primary">{ready ? displayName : '...'}</span>
          </h1>
          <p className="text-text-muted">
            Manage your item procurement bids, discover new opportunities across various sectors, and track your success.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-text-muted text-sm font-medium mb-1">Total Bids Submitted</h3>
            <p className="text-3xl font-bold text-text-main">12</p>
          </div>
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-text-muted text-sm font-medium mb-1">Bids Won</h3>
            <p className="text-3xl font-bold text-secondary">3</p>
          </div>
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-text-muted text-sm font-medium mb-1">Pending Evaluation</h3>
            <p className="text-3xl font-bold text-amber-500">4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Active Solicitations) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-main font-heading">Active Solicitations (Item Procurements)</h2>
              <Link href="/procurements" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {ACTIVE_SOLICITATIONS.map((solicitation) => (
                <div key={solicitation.id} className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${solicitation.bgColor}`}>
                      <solicitation.icon className={`w-6 h-6 ${solicitation.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors">
                        {solicitation.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                          {solicitation.sector} Sector
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                          Est: {solicitation.budget}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      Closes in {solicitation.deadline}
                    </span>
                    <Link href={`/procurements/${solicitation.id}`} className="text-sm font-medium text-primary hover:underline">
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
            
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {MY_BIDS.map((bid) => (
                  <div key={bid.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{bid.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bid.statusBg} ${bid.statusColor}`}>
                        <bid.statusIcon className="w-3.5 h-3.5" />
                        {bid.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-text-main text-sm mb-1 leading-snug">
                      {bid.solicitationTitle}
                    </h4>
                    <p className="text-xs text-text-muted">
                      Submitted {bid.submittedAt}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border bg-gray-50 text-center">
                <Link href="/dashboard/bids" className="text-sm font-medium text-text-muted hover:text-text-main">
                  View all bid history
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
