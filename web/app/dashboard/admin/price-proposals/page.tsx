"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type Proposal = {
  id: string;
  item_name: string;
  category: string;
  subcategory?: string;
  specs_description?: string;
  proposed_price: number;
  proof_link?: string;
  status: string;
  created_at: string;
  profiles: {
    nickname: string;
    entity_type: string;
  };
};

export default function PriceProposalsAdminPage() {
  const { profile, loadingProfile } = useProfile();
  const router = useRouter();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingProfile && profile?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [profile, loadingProfile, router]);

  const fetchProposals = async () => {
    try {
      const res = await fetch("/api/benchmark/proposals?status=pending");
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchProposals();
    }
  }, [profile]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;
    
    setProcessingId(id);
    try {
      const res = await fetch("/api/benchmark/proposals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list
        setProposals(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process proposal");
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  };

  if (loadingProfile || profile?.role !== "admin") return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight mb-2 flex items-center gap-3">
          Pending Price Proposals 
          <span className="bg-primary/10 text-primary text-xs font-mono px-2 py-1 rounded-md">{proposals.length}</span>
        </h1>
        <p className="text-text-muted">Review crowdsourced market prices submitted by suppliers before adding them to the public benchmark.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center font-mono text-text-muted animate-pulse">LOADING_PROPOSALS...</div>
      ) : proposals.length === 0 ? (
        <div className="bg-surface border border-border p-12 text-center rounded-none shadow-sm">
          <CheckIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
          <h3 className="font-heading font-bold text-lg mb-1">All caught up!</h3>
          <p className="text-text-muted text-sm">There are no pending price proposals to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {proposals.map(proposal => (
            <div key={proposal.id} className="bg-surface border border-border p-6 rounded-none shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-primary/50 transition-colors">
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-text-main">{proposal.item_name}</h3>
                    <div className="flex gap-2">
                      <span className="bg-secondary text-white text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider">{proposal.category}</span>
                      {proposal.subcategory && (
                        <span className="bg-gray-100 border border-border text-[10px] font-mono px-2 py-0.5 rounded-sm text-text-muted uppercase tracking-wider">{proposal.subcategory}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-muted flex items-center gap-2">
                    Proposed by <span className="font-mono text-text-main">{proposal.profiles?.nickname}</span>
                  </p>
                </div>

                {proposal.specs_description && (
                  <div className="bg-gray-50 border border-border p-3 rounded-md">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Specs Description</p>
                    <p className="text-sm font-mono text-text-main">{proposal.specs_description}</p>
                  </div>
                )}
                
                {proposal.proof_link && (
                  <a href={proposal.proof_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono">
                    <LinkIcon className="w-3.5 h-3.5" /> View Proof / Source
                  </a>
                )}
              </div>

              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Proposed Price</p>
                  <p className="text-2xl font-bold font-mono text-text-main">{formatPrice(proposal.proposed_price)}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    disabled={processingId === proposal.id}
                    onClick={() => handleAction(proposal.id, 'rejected')}
                    className="p-2 border border-border text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    <XMarkIcon className="w-5 h-5 stroke-2" />
                  </button>
                  <button 
                    disabled={processingId === proposal.id}
                    onClick={() => handleAction(proposal.id, 'approved')}
                    className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-colors disabled:opacity-50"
                    title="Approve & Add to Benchmark"
                  >
                    <CheckIcon className="w-5 h-5 stroke-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
