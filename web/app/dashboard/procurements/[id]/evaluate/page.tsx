"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon,
  SparklesIcon,
  CheckBadgeIcon,
  EyeIcon,
  TrophyIcon
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
    proposalText: "We offer 100 Dell Latitude laptops with 32GB RAM and 1TB SSD. Total price is ₱ 7,500,000. Includes 5-year premium support. Can deliver in 14 days.",
  },
  {
    bidId: "Bidder Beta",
    proposalText: "We offer 100 Lenovo ThinkPads, 16GB RAM, 512GB SSD. Total price is ₱ 6,000,000. Includes standard 1-year warranty. Can deliver in 3 days.",
  },
  {
    bidId: "Bidder Gamma",
    proposalText: "We offer 100 HP EliteBooks, 16GB RAM, 512GB SSD. Total price is ₱ 7,900,000. Includes 3-year warranty. Can deliver in 30 days.",
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
  const [revealedBidder, setRevealedBidder] = useState<string | null>(null);

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
        } else {
          console.error("Evaluation failed");
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setIsEvaluating(false);
      }
    };

    fetchEvaluations();
  }, []);

  const handleAward = (bidId: string) => {
    // In a real app, this would trigger a blockchain transaction and smart contract escrow.
    // For now, we simulate "Revealing" the identity.
    const realIdentities: Record<string, string> = {
      "Bidder Alpha": "TechSource Solutions Inc.",
      "Bidder Beta": "Global IT Supplies Corp.",
      "Bidder Gamma": "Elite Systems Manila"
    };
    alert(`Identity Revealed! You are about to award the contract to: ${realIdentities[bidId]}\n\nProceeding to Smart Contract Escrow...`);
    setRevealedBidder(bidId);
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
      ) : (
        // Results State
        <div className="space-y-6">
          {evaluations.map((evalData, index) => {
            const isWinner = index === 0;
            return (
              <div key={evalData.bidId} className={`relative bg-surface rounded-2xl p-6 md:p-8 border shadow-sm transition-all ${isWinner ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
                
                {/* AI Recommendation Badge */}
                {isWinner && (
                  <div className="absolute -top-4 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4" /> AI Top Recommendation
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Left Column: Bidder & Score */}
                  <div className="lg:w-1/3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isWinner ? <TrophyIcon className="w-7 h-7 text-amber-500" /> : null}
                        <h2 className="text-2xl font-bold text-text-main font-heading">Rank #{index + 1}</h2>
                      </div>
                      <p className="text-lg font-bold text-slate-500 mb-6">{evalData.bidId}</p>
                      
                      <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                        <span className="block text-sm font-bold text-slate-500 mb-1">Total AI Score</span>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-5xl font-black tracking-tighter ${isWinner ? 'text-primary' : 'text-slate-700'}`}>
                            {evalData.totalScore}
                          </span>
                          <span className="text-xl font-bold text-slate-400">/ 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      <button className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <EyeIcon className="w-5 h-5 stroke-2" /> Read Full Proposal
                      </button>
                      <button 
                        onClick={() => handleAward(evalData.bidId)}
                        className={`w-full py-2.5 rounded-xl text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isWinner ? 'bg-primary hover:bg-primary-hover shadow-blue-500/25' : 'bg-slate-800 hover:bg-slate-700'}`}
                      >
                        <CheckBadgeIcon className="w-5 h-5 stroke-2" /> Award Contract
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
            );
          })}
        </div>
      )}

    </div>
  );
}
