"use client";

import { useState, useMemo } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Bids");
  const [viewingBid, setViewingBid] = useState<typeof SUBMITTED_BIDS[0] | null>(null);

  const filteredBids = useMemo(() => {
    return SUBMITTED_BIDS.filter(bid => {
      const matchesSearch = bid.procurementTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            bid.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "Pending") matchesTab = bid.status === "Pending";
      if (activeTab === "Awarded") matchesTab = bid.status === "Awarded";
      if (activeTab === "Rejected") matchesTab = bid.status === "Rejected";

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const counts = {
    all: SUBMITTED_BIDS.length,
    pending: SUBMITTED_BIDS.filter(b => b.status === "Pending").length,
    awarded: SUBMITTED_BIDS.filter(b => b.status === "Awarded").length,
    rejected: SUBMITTED_BIDS.filter(b => b.status === "Rejected").length,
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        <button 
          onClick={() => setActiveTab("All Bids")}
          className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === "All Bids" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 transition-colors"}`}
        >
          All Bids ({counts.all})
        </button>
        <button 
          onClick={() => setActiveTab("Pending")}
          className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === "Pending" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 transition-colors"}`}
        >
          Pending ({counts.pending})
        </button>
        <button 
          onClick={() => setActiveTab("Awarded")}
          className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === "Awarded" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 transition-colors"}`}
        >
          Awarded ({counts.awarded})
        </button>
        <button 
          onClick={() => setActiveTab("Rejected")}
          className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === "Rejected" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 transition-colors"}`}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Bids List */}
      <div className="grid gap-5">
        {filteredBids.length === 0 ? (
          <div className="bg-surface rounded-2xl p-10 border border-border text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">No bids found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or tab filter.</p>
          </div>
        ) : (
          filteredBids.map((bid) => (
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
              <button 
                onClick={() => setViewingBid(bid)}
                className="px-5 py-2.5 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100 hover:text-primary border border-slate-200 transition-colors shadow-sm flex items-center gap-2"
              >
                <EyeIcon className="w-4 h-4 stroke-2" /> View Details
              </button>
            </div>

          </div>
        )))}
      </div>

      {/* View Details Modal */}
      {viewingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold font-heading">Bid Details</h2>
                <p className="text-sm font-medium text-slate-500">{viewingBid.id}</p>
              </div>
              <button 
                onClick={() => setViewingBid(null)} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Procurement</p>
                <p className="font-bold text-slate-700">{viewingBid.procurementTitle}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{viewingBid.procurementId}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Submitted On</span>
                  <span className="font-bold text-slate-700">{viewingBid.submittedAt}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Bid Amount</span>
                  <span className="font-bold text-primary text-lg">{viewingBid.amount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-500 font-medium">Current Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border ${viewingBid.statusBg} ${viewingBid.statusColor} ${viewingBid.statusBorder}`}>
                    <viewingBid.statusIcon className="w-4 h-4 stroke-2" />
                    {viewingBid.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-slate-50 text-center">
              <button 
                onClick={() => setViewingBid(null)}
                className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
