"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon,
  SparklesIcon,
  CheckBadgeIcon,
  EyeIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  NoSymbolIcon,
  DocumentTextIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// Mock Data representing the original Request & Criteria
const MOCK_PROCUREMENT = {
  id: "REQ-2026-081",
  title: "100 Laptops for New Department",
  description: "Require 100 high-performance laptops. Minimum specs: 16GB RAM, 512GB SSD, Intel i7 or equivalent. Must include 3-year warranty.",
  budget: "₱ 8,000,000",
  criteria: [
    { name: "Price", weight: 40 },
    { name: "Technical Specs", weight: 30 },
    { name: "Warranty & Support", weight: 20 },
    { name: "Delivery Time", weight: 10 }
  ]
};

// Mock Data representing the anonymous incoming Bids
const MOCK_BIDS = [
  {
    bidId: "Bidder Alpha",
    proposalText: `FORMAL PROPOSAL SUBMISSION
==========================
Date: October 12, 2026
Subject: Proposal for 100 High-Performance Laptops (REQ-2026-081)

To the Procurement Committee,

We are pleased to submit our formal bid for the supply of 100 high-performance laptops for your new department. Our proposed equipment exceeds the minimum technical specifications while offering exceptional long-term value.

1. TECHNICAL SPECIFICATIONS
---------------------------
• Model: Dell Latitude 7440 (Latest Gen)
• Processor: Intel Core i7-1355U (10 Cores)
• Memory: 32GB LPDDR5 RAM (Exceeds 16GB req)
• Storage: 1TB PCIe NVMe SSD (Exceeds 512GB req)
• OS: Windows 11 Pro

2. PRICING & FINANCIALS
-----------------------
• Unit Price: ₱ 75,000.00
• Total Quantity: 100 units
• GRAND TOTAL: ₱ 7,500,000.00 (VAT Inclusive)

3. WARRANTY & SUPPORT
---------------------
• 5-Year Premium ProSupport Plus (Next Business Day Onsite Service)
• Accidental Damage Protection included.

4. DELIVERY TIMELINE
--------------------
• We commit to delivering all 100 units within 14 calendar days upon Notice to Proceed.`,
  },
  {
    bidId: "Bidder Beta",
    proposalText: `PROPOSAL SUBMISSION
Ref: REQ-2026-081

Dear Sir/Madam,

Here is our bid for the 100 laptops requested.

Specifications:
- Lenovo ThinkPad E14 Gen 5
- Intel Core i7-1355U
- 16GB RAM DDR4
- 512GB SSD Storage

Financial Proposal:
- Total Bid Price: ₱ 6,000,000.00

Warranty:
- Standard 1-Year Depot Warranty (Carry-in service only).

Delivery:
- 3 days (Ready stock available locally).`,
  },
  {
    bidId: "Bidder Gamma",
    proposalText: `PROPOSAL FOR LAPTOP PROCUREMENT
REQ-2026-081

EXECUTIVE SUMMARY
We propose to supply 100 units of enterprise-grade HP laptops tailored for heavy departmental workloads.

HARDWARE SPECS
- Brand/Model: HP EliteBook 840 G10
- CPU: Intel Core i7-1360P
- RAM: 16GB DDR5
- Storage: 512GB NVMe SSD

FINANCIAL SUMMARY
- Total Cost: ₱ 7,900,000.00

TERMS & CONDITIONS
- Warranty: 3-Year Standard Manufacturer Warranty.
- Delivery Time: 30 days indent order from the manufacturer.`,
  }
];

// Types for the AI response
type ScoreDetail = {
  criterionName: string;
  scoreAchieved: number;
  maxWeight: number;
  reasoning: string;
};

type BidEvaluation = {
  bidId: string;
  scores: ScoreDetail[];
  totalScore: number;
  aiSummary: string;
};

export default function EvaluateBidsPage() {
  const [evaluations, setEvaluations] = useState<BidEvaluation[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedBidder, setRevealedBidder] = useState<string | null>(null);
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  // Modal States
  const [viewingProposalFor, setViewingProposalFor] = useState<string | null>(null);
  const [rejectingBidFor, setRejectingBidFor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [awardingBidFor, setAwardingBidFor] = useState<string | null>(null);
  
  // Real identities (mock)
  const realIdentities: Record<string, string> = {
    "Bidder Alpha": "TechSource Solutions Inc.",
    "Bidder Beta": "Global IT Supplies Corp.",
    "Bidder Gamma": "Elite Systems Manila"
  };

  useEffect(() => {
    // Call our AI API when the page loads
    const fetchEvaluations = async () => {
      try {
        const response = await fetch('/api/evaluate-bids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criteria: MOCK_PROCUREMENT.criteria,
            bids: MOCK_BIDS,
            procurementDetails: {
              title: MOCK_PROCUREMENT.title,
              description: MOCK_PROCUREMENT.description,
              budget: MOCK_PROCUREMENT.budget
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Sort by highest score first
          const sorted = data.evaluations.sort((a: BidEvaluation, b: BidEvaluation) => b.totalScore - a.totalScore);
          setEvaluations(sorted);
          if (sorted.length > 0) {
            setExpandedBidId(sorted[0].bidId);
          }
        } else {
          const status = response.status;
          const rawText = await response.text();
          try {
            const errData = JSON.parse(rawText);
            setError(`API Error (${status}): ${errData.error}`);
          } catch(e) {
            console.error("Raw response:", rawText);
            setError(`Vercel Error (${status}): The server returned a non-JSON response. This is usually a 504 Timeout or configuration issue.`);
          }
        }
      } catch (error: any) {
        setError(`Network error occurred: ${error.message || 'Unknown error'}`);
      } finally {
        setIsEvaluating(false);
      }
    };

    fetchEvaluations();
  }, []);

  const confirmAward = (bidId: string) => {
    setRevealedBidder(bidId);
    setAwardingBidFor(null);
  };

  const confirmReject = (bidId: string) => {
    setEvaluations(prev => prev.filter(b => b.bidId !== bidId));
    setRejectingBidFor(null);
    setRejectReason("");
  };

  return (
    <div className="py-10 px-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/my-procurements" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to My Procurements
        </Link>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight mb-2">
          Evaluate Bids: <span className="text-primary">{MOCK_PROCUREMENT.id}</span>
        </h1>
        <p className="text-text-muted text-sm md:text-base">
          Our AI has automatically ranked incoming bids anonymously based on your dynamic criteria.
        </p>
      </div>

      {isEvaluating ? (
        // Loading State
        <div className="bg-surface rounded-2xl p-12 border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            <SparklesIcon className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">AI is evaluating proposals...</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Reading attachments, analyzing pricing, and scoring against your custom criteria to prevent bias.
          </p>
        </div>
      ) : error ? (
        // Error State
        <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Evaluation Failed</h2>
          <p className="text-red-600 font-medium">
            {error}
          </p>
        </div>
      ) : (
        // Results State
        <div className="space-y-4">
          {evaluations.map((evalData, index) => {
            const isWinner = index === 0;
            const isExpanded = expandedBidId === evalData.bidId;

            return (
              <div key={evalData.bidId} className={`relative bg-surface rounded-2xl border shadow-sm transition-all overflow-hidden ${isWinner ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
                
                {/* Minimized Header (Always Visible) */}
                <div 
                  onClick={() => setExpandedBidId(isExpanded ? null : evalData.bidId)}
                  className={`p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'border-b border-border bg-slate-50/50' : ''}`}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-3 w-32">
                      {isWinner ? <TrophyIcon className="w-6 h-6 text-amber-500" /> : <div className="w-6" />}
                      <h2 className="text-xl font-bold text-text-main font-heading">Rank #{index + 1}</h2>
                    </div>
                    
                    <div className="hidden sm:block">
                      <p className="text-base font-bold text-slate-700">{evalData.bidId}</p>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                          <SparklesIcon className="w-3 h-3" /> Top Choice
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">AI Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${isWinner ? 'text-primary' : 'text-slate-700'}`}>
                          {evalData.totalScore}
                        </span>
                        <span className="text-sm font-bold text-slate-400">/100</span>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                      <ChevronDownIcon className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Expanded Body */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Action Buttons */}
                    <div className="lg:w-1/3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-8">
                      <div>
                        <div className="sm:hidden mb-6">
                          <p className="text-lg font-bold text-slate-700">{evalData.bidId}</p>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                              <SparklesIcon className="w-3 h-3" /> Top Choice
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-4">
                          This proposal was evaluated automatically against your predefined criteria to prevent bias.
                        </p>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingProposalFor(evalData.bidId); }}
                          className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-5 h-5 stroke-2" /> Read Full Proposal
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAwardingBidFor(evalData.bidId); }}
                          className={`w-full py-2.5 rounded-xl text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isWinner ? 'bg-primary hover:bg-primary-hover shadow-blue-500/25' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                          <CheckBadgeIcon className="w-5 h-5 stroke-2" /> Award Contract
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRejectingBidFor(evalData.bidId); }}
                          className="w-full py-2.5 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <NoSymbolIcon className="w-5 h-5 stroke-2" /> Reject Bid
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Breakdown & Summary */}
                    <div className="lg:w-2/3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Criteria Breakdown</h3>
                      
                      <div className="space-y-4 mb-6">
                        {evalData.scores.map((score, i) => {
                          const percent = (score.scoreAchieved / score.maxWeight) * 100;
                          let barColor = "bg-primary";
                          if (percent < 50) barColor = "bg-red-500";
                          else if (percent < 80) barColor = "bg-amber-500";
                          else if (percent >= 90) barColor = "bg-emerald-500";

                          return (
                            <div key={i}>
                              <div className="flex justify-between items-end mb-1.5">
                                <span className="text-sm font-bold text-text-main">{score.criterionName}</span>
                                <span className="text-sm font-bold text-slate-600">{score.scoreAchieved} <span className="text-slate-400 font-medium">/ {score.maxWeight} pts</span></span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-1.5">
                                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percent}%` }} />
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {score.reasoning}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4 text-primary" /> AI Summary
                        </h3>
                        <p className="text-sm text-blue-800/80 font-medium leading-relaxed">
                          {evalData.aiSummary}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* 1. Read Proposal Modal */}
      {viewingProposalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                Original Proposal: <span className="text-primary">{viewingProposalFor}</span>
              </h3>
              <button onClick={() => setViewingProposalFor(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto text-slate-600 leading-relaxed whitespace-pre-wrap">
              {MOCK_BIDS.find(b => b.bidId === viewingProposalFor)?.proposalText}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end">
              <button onClick={() => setViewingProposalFor(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reject Bid Modal */}
      {rejectingBidFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-red-50">
              <h3 className="font-bold text-lg text-red-700 flex items-center gap-2">
                <NoSymbolIcon className="w-5 h-5" /> Reject {rejectingBidFor}
              </h3>
              <button onClick={() => setRejectingBidFor(null)} className="p-2 hover:bg-red-200 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Rejection</label>
              <textarea 
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/20 transition-all resize-none h-32"
                placeholder="E.g., Did not meet minimum technical specifications..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">This reason will be recorded and sent to the supplier as feedback.</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-3">
              <button onClick={() => setRejectingBidFor(null)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => confirmReject(rejectingBidFor)} className="px-5 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Award Contract Modal */}
      {awardingBidFor && !revealedBidder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckBadgeIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-2xl text-text-main mb-2">Confirm Award</h3>
              <p className="text-slate-500 mb-6">
                You are about to award the contract to <span className="font-bold text-slate-700">{awardingBidFor}</span>. 
                Proceeding will reveal the supplier's true identity and transition this procurement to the smart contract escrow phase.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setAwardingBidFor(null)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 border-2 border-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={() => confirmAward(awardingBidFor)} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-blue-500/20">
                  Reveal & Award
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Revealed Success Modal */}
      {revealedBidder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b-4 border-emerald-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <TrophyIcon className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="font-black text-2xl text-text-main mb-1">Contract Awarded!</h3>
              <p className="text-slate-500 mb-6 font-medium">The true identity of {revealedBidder} is:</p>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
                <p className="text-2xl font-black text-emerald-800">{realIdentities[revealedBidder]}</p>
              </div>

              <button onClick={() => window.location.href = '/dashboard/my-procurements'} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
                Proceed to Escrow
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
