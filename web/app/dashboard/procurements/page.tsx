"use client";

import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

// Extended Mock Data for Active Solicitations
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
  },
  {
    id: "SOL-2026-004",
    title: "Campus Wi-Fi Infrastructure Upgrade",
    sector: "Education",
    budget: "₱ 8,200,000",
    deadline: "15 Days",
    icon: AcademicCapIcon,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "SOL-2026-005",
    title: "Heavy Machinery for Road Construction",
    sector: "Institution",
    budget: "₱ 45,000,000",
    deadline: "21 Days",
    icon: BuildingOfficeIcon,
    bgColor: "bg-teal-50",
    iconColor: "text-teal-500",
  }
];

export default function ActiveSolicitationsPage() {
  return (
    <div className="py-10 px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2 font-heading tracking-tight">
            Active Solicitations
          </h1>
          <p className="text-text-muted text-sm md:text-base">
            Browse and bid on open item procurements across all sectors.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search procurements..." 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-main hover:bg-slate-50 transition-colors shadow-sm">
            <FunnelIcon className="w-5 h-5 stroke-2 text-slate-500" />
            Filter
          </button>
        </div>
      </div>

      {/* Solicitations List */}
      <div className="grid gap-5">
        {ACTIVE_SOLICITATIONS.map((solicitation) => (
          <div key={solicitation.id} className="bg-surface rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className={`p-4 rounded-xl ${solicitation.bgColor}`}>
                <solicitation.icon className={`w-8 h-8 ${solicitation.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{solicitation.id}</span>
                </div>
                <h3 className="font-bold text-text-main text-xl group-hover:text-primary transition-colors">
                  {solicitation.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-sm text-text-muted font-medium">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                    {solicitation.sector} Sector
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-text-main">
                    Est. Budget: {solicitation.budget}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-5 sm:pt-0 border-border">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary">
                Closes in {solicitation.deadline}
              </span>
              <Link 
                href={`/dashboard/procurements/${solicitation.id}/bid`} 
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
              >
                Submit Bid
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
