"use client";

import Link from "next/link";
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const SUBMITTED_BIDS = [
  {
    id: "BID-2026-0092",
    procurementTitle: "Supply of 500 Desktop Computers",
    procurementId: "SOL-2026-001",
    submittedAt: "Oct 10, 2026",
    amount: "₱ 14,850,000",
    status: "Pending",
    statusIcon: ClockIcon,
    statusColor: "text-amber-600",
    statusBg: "bg-amber-50",
    statusBorder: "border-amber-200"
  },
  {
    id: "BID-2026-0041",
    procurementTitle: "Medical Grade Face Masks (100k pcs)",
    procurementId: "SOL-2026-002",
    submittedAt: "Oct 05, 2026",
    amount: "₱ 2,400,000",
    status: "Awarded",
    statusIcon: CheckCircleIcon,
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    statusBorder: "border-emerald-200"
  },
  {
    id: "BID-2026-0018",
    procurementTitle: "Campus Wi-Fi Infrastructure Upgrade",
    procurementId: "SOL-2026-004",
    submittedAt: "Sep 28, 2026",
    amount: "₱ 8,150,000",
    status: "Rejected",
    statusIcon: XCircleIcon,
    statusColor: "text-red-600",
    statusBg: "bg-red-50",
    statusBorder: "border-red-200"
  },
  {
    id: "BID-2026-0005",
    procurementTitle: "Freelance Software Development Services",
    procurementId: "SOL-2026-003",
    submittedAt: "Sep 15, 2026",
    amount: "₱ 480,000",
    status: "Awarded",
    statusIcon: CheckCircleIcon,
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    statusBorder: "border-emerald-200"
  }
];

export default function MyBidsPage() {
  return (
    <div className="py-10 px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2 font-heading tracking-tight">
            My Bids
          </h1>
          <p className="text-text-muted text-sm md:text-base">
            Track the status of all your submitted proposals.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Title..." 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text-main hover:bg-slate-50 transition-colors shadow-sm">
            <FunnelIcon className="w-5 h-5 stroke-2 text-slate-500" />
            Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-border overflow-x-auto">
        <button className="pb-3 text-sm font-bold text-primary border-b-2 border-primary whitespace-nowrap">
          All Bids (4)
        </button>
        <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
          Pending (1)
        </button>
        <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
          Awarded (2)
        </button>
        <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
          Rejected (1)
        </button>
      </div>

      {/* Bids List */}
      <div className="grid gap-5">
        {SUBMITTED_BIDS.map((bid) => (
          <div key={bid.id} className="bg-surface rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-5 flex-1">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <DocumentTextIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-slate-400 tracking-wider">{bid.id}</span>
                  <span className="text-xs font-bold text-slate-300">•</span>
                  <span className="text-xs font-bold text-primary tracking-wider">{bid.procurementId}</span>
                </div>
                <h3 className="font-bold text-text-main text-xl group-hover:text-primary transition-colors">
                  {bid.procurementTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-sm font-medium">
                  <span className="text-slate-500">
                    Submitted: {bid.submittedAt}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="font-bold text-text-main">
                    Bid Amount: {bid.amount}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-5 md:pt-0 border-border">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${bid.statusBg} ${bid.statusColor} ${bid.statusBorder}`}>
                <bid.statusIcon className="w-4 h-4 stroke-2" />
                {bid.status}
              </div>
              <button className="px-5 py-2.5 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100 hover:text-primary border border-slate-200 transition-colors shadow-sm flex items-center gap-2">
                <EyeIcon className="w-4 h-4 stroke-2" /> View Details
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
