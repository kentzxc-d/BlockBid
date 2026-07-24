"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useProfile } from "@/contexts/ProfileContext";
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import AcquisitionCard from "@/components/AcquisitionCard";

export default function MyBidsPage() {
  const { user } = usePrivy();
  const { supplierData } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL_BIDS");
  const [viewingBid, setViewingBid] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supplierData?.bids) {
      const mappedBids = supplierData.bids.map((b: any) => ({
        id: b.id,
        acquisitionTitle: b.projects?.title || "Unknown Project",
        acquisitionId: b.project_id,
        submittedAt: new Date(b.created_at).toLocaleDateString(),
        amount: b.bid_values && b.bid_values.length > 0 ? b.bid_values.map((v:any) => v.value).join(" | ").substring(0, 120) + (b.bid_values.map((v:any) => v.value).join(" | ").length > 120 ? "..." : "") : "N/A",
        status: b.status.toUpperCase(),
        statusIcon: b.status === "submitted" ? ClockIcon : (b.status === "won" ? CheckCircleIcon : XCircleIcon),
        statusColor: b.status === "submitted" ? "text-amber-500" : (b.status === "won" ? "text-emerald-500" : "text-red-500"),
        statusBg: b.status === "submitted" ? "bg-amber-500/10" : (b.status === "won" ? "bg-emerald-500/10" : "bg-red-500/10"),
        statusBorder: b.status === "submitted" ? "border-amber-500/20" : (b.status === "won" ? "border-emerald-500/20" : "border-red-500/20"),
        on_chain_hash: b.on_chain_hash
      }));
      setBids(mappedBids);
      setIsLoading(false);
    } else if (supplierData) {
      setBids([]);
      setIsLoading(false);
    }
  }, [supplierData]);


  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      const matchesSearch = bid.acquisitionTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            bid.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "PENDING") matchesTab = bid.status === "SUBMITTED" || bid.status === "EVALUATED";
      if (activeTab === "AWARDED") matchesTab = bid.status === "WON";
      if (activeTab === "REJECTED") matchesTab = bid.status === "LOST";

      return matchesSearch && matchesTab;
    });
  }, [bids, searchQuery, activeTab]);

  const counts = {
    all: bids.length,
    pending: bids.filter(b => b.status === "SUBMITTED" || b.status === "EVALUATED").length,
    awarded: bids.filter(b => b.status === "WON").length,
    rejected: bids.filter(b => b.status === "LOST").length,
  };

  return (
    <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
            [ MY_BIDS ]
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Track execution status of all submitted proposals.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted stroke-2" />
            <input 
              type="text" 
              placeholder="SEARCH_BIDS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-md border border-border focus:border-text-main outline-none transition-colors text-xs font-mono font-bold tracking-widest w-full md:w-64 placeholder:text-text-muted uppercase"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-md text-xs font-mono font-bold tracking-widest text-text-main hover:bg-gray-50 transition-colors uppercase">
            <FunnelIcon className="w-4 h-4 stroke-2 text-text-main" />
            FILTER
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-border overflow-x-auto">
        <button 
          onClick={() => setActiveTab("ALL_BIDS")}
          className={`pb-3 text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === "ALL_BIDS" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main border-b-2 border-transparent"}`}
        >
          ALL_BIDS [{counts.all.toString().padStart(2, '0')}]
        </button>
        <button 
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === "PENDING" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main border-b-2 border-transparent"}`}
        >
          PENDING [{counts.pending.toString().padStart(2, '0')}]
        </button>
        <button 
          onClick={() => setActiveTab("AWARDED")}
          className={`pb-3 text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === "AWARDED" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main border-b-2 border-transparent"}`}
        >
          AWARDED [{counts.awarded.toString().padStart(2, '0')}]
        </button>
        <button 
          onClick={() => setActiveTab("REJECTED")}
          className={`pb-3 text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === "REJECTED" ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main border-b-2 border-transparent"}`}
        >
          REJECTED [{counts.rejected.toString().padStart(2, '0')}]
        </button>
      </div>

      {/* Bids List */}
      <div className="grid gap-4">
        {filteredBids.length === 0 ? (
          <div className="bg-surface rounded-none p-10 border border-border text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-none flex items-center justify-center mx-auto mb-4 border border-border">
              <MagnifyingGlassIcon className="w-6 h-6 text-text-muted stroke-1" />
            </div>
            <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">No records found</h3>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Query returned zero matching bids.</p>
          </div>
        ) : (
          filteredBids.map((bid) => {
            const actionButton = (
              <div className="flex flex-row items-center justify-end gap-3 w-full">
                {bid.status === "WON" && (
                  <Link 
                    href={`/dashboard/acquisitions/${bid.acquisitionId}/workspace`}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border-2 border-primary text-primary font-mono text-xs font-bold tracking-widest uppercase rounded-none hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                  >
                    WORKSPACE
                  </Link>
                )}
                <button 
                  onClick={() => setViewingBid(bid)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border text-text-main font-mono text-xs font-bold tracking-widest uppercase rounded-none hover:border-text-main hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <EyeIcon className="w-4 h-4 stroke-2" /> VIEW_DETAILS
                </button>
              </div>
            );

            return (
              <AcquisitionCard
                key={bid.id}
                title={bid.acquisitionTitle}
                description="This project requires qualified suppliers to submit their best proposals for the specified items. Ensure all compliance requirements are met." // Placeholder since actual description isn't mapped
                status={bid.status}
                location={bid.project?.location || "Various"}
                estBudget={bid.project?.budget || (bid.amount === "N/A" ? "TBD" : bid.amount)}
                closingDate={`Submitted: ${bid.submittedAt}`}
                contractHash={bid.on_chain_hash || "b53d0128-37d5-457b-9c4a-08b7c093fb7d"} // mock hash if undefined
                actionButton={actionButton}
              />
            );
          })
        )}
      </div>

      {/* View Details Modal */}
      {viewingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface rounded-md w-full max-w-lg shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-gray-50">
              <div>
                <h2 className="text-lg font-bold font-heading uppercase text-text-main tracking-tight">[ BID_DETAILS ]</h2>
                <p className="text-[10px] font-mono font-bold text-text-muted tracking-widest mt-1 uppercase">{viewingBid.id}</p>
              </div>
              <button 
                onClick={() => setViewingBid(null)} 
                className="p-2 text-text-muted hover:text-text-main border border-transparent hover:border-border rounded-md transition-colors"
              >
                <XMarkIcon className="w-5 h-5 stroke-2" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-surface p-4 rounded-md border border-border mb-6 hover:border-text-main transition-colors">
                <p className="text-[10px] font-mono font-bold text-text-muted mb-2 uppercase tracking-widest">TARGET_ACQUISITION</p>
                <p className="font-heading font-bold text-text-main text-lg leading-tight uppercase">{viewingBid.acquisitionTitle}</p>
                <p className="text-[10px] font-mono font-bold text-primary mt-2 tracking-widest uppercase">{viewingBid.acquisitionId}</p>
              </div>

              <div className="space-y-4 font-mono text-xs tracking-widest uppercase">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-text-muted font-bold">SUBMITTED_ON</span>
                  <span className="font-bold text-text-main">{viewingBid.submittedAt}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-text-muted font-bold">PROPOSAL_SUMMARY</span>
                  <span className="font-bold text-primary bg-primary/10 px-3 py-1.5 border border-primary/20 rounded-md max-w-[60%] text-right">{viewingBid.amount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-text-muted font-bold">CURRENT_STATUS</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[10px] font-bold ${viewingBid.statusBg} ${viewingBid.statusColor} ${viewingBid.statusBorder}`}>
                    <viewingBid.statusIcon className="w-3.5 h-3.5 stroke-2" />
                    {viewingBid.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-end bg-gray-50">
              <button 
                onClick={() => setViewingBid(null)}
                className="px-8 py-2.5 bg-text-main text-white border border-transparent rounded-md font-mono text-xs font-bold tracking-widest hover:bg-primary transition-colors uppercase"
              >
                CLOSE_MODAL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

