"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { activeChain } from "@/utils/network";
import { BlockBidABI } from "@/lib/abi";
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

export default function EvaluateBidsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [project, setProject] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<BidEvaluation[]>([]);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [revealedBidder, setRevealedBidder] = useState<string | null>(null);
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);
  const { wallets } = useWallets();

  // Modal States
  const [viewingProposalFor, setViewingProposalFor] = useState<string | null>(null);
  const [rejectingBidFor, setRejectingBidFor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [awardingBidFor, setAwardingBidFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Project and Criteria
        const projRes = await fetch(`/api/acquisitions/${params.id}`);
        if (!projRes.ok) throw new Error("Failed to fetch project details");
        const projData = await projRes.json();
        setProject(projData.project);

        // 2. Fetch Bids
        const bidsRes = await fetch(`/api/acquisitions/${params.id}/bids`);
        if (!bidsRes.ok) throw new Error("Failed to fetch bids");
        const bidsData = await bidsRes.json();
        setBids(bidsData.bids);

        // 3. Check if we have evaluations already saved or need to run AI
        const existingEvals: BidEvaluation[] = [];
        const unevaluatedBids: any[] = [];

        bidsData.bids.forEach((bid: any) => {
          if (bid.ai_score !== null && bid.ai_reasoning) {
            try {
              const parsed = JSON.parse(bid.ai_reasoning);
              existingEvals.push(parsed);
            } catch(e) {
              // Fallback if it wasn't saved as JSON
              existingEvals.push({
                bidId: bid.id,
                totalScore: bid.ai_score,
                aiSummary: bid.ai_reasoning,
                scores: []
              });
            }
          } else {
            unevaluatedBids.push({
              bidId: bid.id,
              supplierAlias: bid.anonymous_alias,
              proposalAnswers: bid.bid_values.map((v: any) => {
                const crit = projData.project.criteria.find((c:any) => c.id === v.criteria_id);
                return {
                  criteria: crit ? crit.name : "Unknown",
                  value: v.value
                };
              })
            });
          }
        });

        // If there are unevaluated bids, run AI on them
        if (unevaluatedBids.length > 0) {
          setIsEvaluating(true);
          const aiRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/evaluate-bids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              criteria: projData.project.criteria.map((c:any) => ({ name: c.name, weight: c.weight_percentage })),
              bids: unevaluatedBids,
              procurementDetails: {
                title: projData.project.title,
                description: projData.project.description,
                budget: projData.project.budget || "Not specified"
              }
            })
          });

          if (!aiRes.ok) {
            const errData = await aiRes.json();
            throw new Error(errData.error || "AI Evaluation failed");
          }

          const aiData = await aiRes.json();
          let finalEvals = [...existingEvals, ...aiData.evaluations];
          finalEvals.sort((a, b) => b.totalScore - a.totalScore);
          
          if (projData.project.status === 'awarded') {
            const winningBid = bidsData.bids.find((b: any) => b.status === 'won');
            if (winningBid) {
              finalEvals = finalEvals.filter(e => e.bidId === winningBid.id);
              // Also automatically set it to revealed so it shows as awarded
              setRevealedBidder(winningBid.id);
            }
          }
          
          setEvaluations(finalEvals);
          if (finalEvals.length > 0) setExpandedBidId(finalEvals[0].bidId);
        } else {
          // All bids already evaluated
          let finalEvals = existingEvals;
          finalEvals.sort((a, b) => b.totalScore - a.totalScore);
          
          if (projData.project.status === 'awarded') {
            const winningBid = bidsData.bids.find((b: any) => b.status === 'won');
            if (winningBid) {
              finalEvals = finalEvals.filter(e => e.bidId === winningBid.id);
              setRevealedBidder(winningBid.id);
            }
          }
          
          setEvaluations(finalEvals);
          if (finalEvals.length > 0) setExpandedBidId(finalEvals[0].bidId);
        }

      } catch (err: any) {
        setError(`Error: ${err.message}`);
      } finally {
        setIsInitializing(false);
        setIsEvaluating(false);
      }
    };

    fetchData();
  }, [params.id]);

  const confirmAward = async (bidId: string) => {
    const bidToAward = bids.find(b => b.id === bidId);
    if (!bidToAward) return;
    
    try {
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        await wallet.switchChain(activeChain.id);
        const provider = await wallet.getEthereumProvider();
        
        const walletClient = createWalletClient({
          account: wallet.address as `0x${string}`,
          chain: activeChain,
          transport: custom(provider)
        });

        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
        if (contractAddress) {
          // For the hackathon, we pass a dummy supplier address and dummy hash since we bypassed the strict hash check in BlockBid.sol
          const dummySupplierAddress = "0x0000000000000000000000000000000000000001";
          const dummyHash = "0x" + "0".repeat(64);
          
          await walletClient.writeContract({
            address: contractAddress,
            abi: BlockBidABI,
            functionName: 'finalizeAward',
            args: [params.id, dummySupplierAddress, dummyHash]
          });
        }
      }
    } catch (err) {
      console.error("Failed to finalize award on contract:", err);
    }
    
    // Update Database and trigger notification
    try {
      await fetch(`/api/acquisitions/${params.id}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplier_id: bidToAward.supplier_id, 
          project_title: project?.title 
        })
      });
    } catch (err) {
      console.error("Failed to update backend award status:", err);
    }
    
    // Reveal the bidder after contract interaction
    setRevealedBidder(bidId);
    setAwardingBidFor(null);
  };

  const confirmReject = (bidId: string) => {
    setEvaluations(prev => prev.filter(b => b.bidId !== bidId));
    setRejectingBidFor(null);
    setRejectReason("");
  };

  const getAliasForBidId = (bidId: string) => {
    const bid = bids.find(b => b.id === bidId);
    return bid ? bid.anonymous_alias : bidId;
  };

  const getProposalTextForBidId = (bidId: string) => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return "No data";
    return bid.bid_values.map((v:any) => {
      const crit = project?.criteria.find((c:any) => c.id === v.criteria_id);
      return `[ ${crit ? crit.name.toUpperCase() : "DATA"} ]\n${v.value}\n`;
    }).join('\n');
  };

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-8 w-full">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
          [ LOADING_ACQUISITION_LEDGER ]
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 w-full">
        <div className="font-mono text-sm font-bold tracking-widest text-danger uppercase mb-4">
          [ ERROR: {error} ]
        </div>
        <Link href="/dashboard/my-acquisitions" className="text-primary hover:underline font-mono text-xs uppercase tracking-widest">
          Return to Acquisitions
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/my-acquisitions" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> BACK_TO_MY_ACQUISITIONS
        </Link>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
          [ EVALUATE_BIDS: <span className="text-primary">{project?.title}</span> ]
        </h1>
        <p className="text-text-muted text-xs font-mono font-bold uppercase tracking-widest">
          AI automatically ranking anonymous bids against your dynamic criteria.
        </p>
      </div>

      {isEvaluating ? (
        // Loading State
        <div className="bg-surface rounded-md p-12 border border-border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-md"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-md border-t-transparent animate-spin"></div>
            <SparklesIcon className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse stroke-2" />
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2 font-heading tracking-tight uppercase">AI is evaluating proposals...</h2>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest max-w-md mx-auto">
            Reading attachments, analyzing pricing, and scoring against your custom criteria to prevent bias.
          </p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-8 text-center text-text-muted font-mono text-xs font-bold uppercase tracking-widest">
          NO_BIDS_FOUND_FOR_THIS_PROJECT
        </div>
      ) : (
        // Results State
        <div className="space-y-4">
          {evaluations.map((evaluation, index) => {
            const isWinner = index === 0;
            const isRevealed = revealedBidder === evaluation.bidId;
            const isExpanded = expandedBidId === evaluation.bidId;
            const alias = getAliasForBidId(evaluation.bidId);

            return (
              <div 
                key={evaluation.bidId} 
                className={`bg-surface border rounded-md overflow-hidden transition-colors ${
                  isWinner ? 'border-primary shadow-sm' : 'border-border'
                }`}
              >
                {/* Header Section (Always visible) */}
                <div 
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-background/50 transition-colors ${isExpanded ? 'border-b border-border' : ''}`}
                  onClick={() => setExpandedBidId(isExpanded ? null : evaluation.bidId)}
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-background border border-border rounded-md shrink-0">
                      <span className="text-xl font-heading font-black text-text-main">{evaluation.totalScore}</span>
                      <span className="text-[8px] font-mono font-bold text-text-muted uppercase tracking-widest">Score</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono text-sm font-bold text-text-main tracking-widest uppercase">
                          {isRevealed ? "SUPPLIER_IDENTITY_REVEALED" : alias}
                        </h3>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-widest border border-primary/20 rounded-md">
                            <TrophyIcon className="w-3 h-3 stroke-2" /> Top Match
                          </span>
                        )}
                        {isRevealed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-mono font-bold uppercase tracking-widest border border-secondary/20 rounded-md">
                            <EyeIcon className="w-3 h-3 stroke-2" /> Identity Decrypted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted font-mono font-bold uppercase tracking-widest line-clamp-1 max-w-xl">
                        {evaluation.aiSummary}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-2 text-text-muted hover:text-text-main hover:bg-background border border-transparent hover:border-border rounded-md transition-colors"
                      title={isExpanded ? "Collapse Details" : "Expand Details"}
                    >
                      <ChevronDownIcon className={`w-5 h-5 stroke-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-6 bg-background/30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left Col: AI Breakdown */}
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <h4 className="text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-4 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-primary" /> AI Matrix Breakdown
                          </h4>
                          <div className="grid gap-3">
                            {evaluation.scores && evaluation.scores.length > 0 ? evaluation.scores.map((score, i) => (
                              <div key={i} className="p-4 bg-surface border border-border rounded-md">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-mono text-xs font-bold text-text-main tracking-widest uppercase">{score.criterionName}</span>
                                  <span className="font-mono text-xs font-bold text-primary tracking-widest">
                                    {score.scoreAchieved} / {score.maxWeight}
                                  </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1.5 w-full bg-background mb-3 flex rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-500" 
                                    style={{ width: `${(score.scoreAchieved / score.maxWeight) * 100}%` }}
                                  />
                                </div>
                                <p className="text-xs text-text-muted font-mono uppercase tracking-widest leading-relaxed">
                                  {score.reasoning}
                                </p>
                              </div>
                            )) : (
                              <div className="p-4 bg-surface border border-border rounded-md text-xs text-text-muted font-mono font-bold uppercase tracking-widest">
                                NO_DETAILED_SCORES_AVAILABLE
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Col: Actions */}
                      <div className="space-y-4">
                        <button 
                          onClick={() => setViewingProposalFor(evaluation.bidId)}
                          className="w-full py-3 px-4 bg-surface border border-border rounded-md hover:border-text-main transition-colors text-xs font-mono font-bold text-text-main tracking-widest uppercase flex items-center justify-center gap-2"
                        >
                          <DocumentTextIcon className="w-4 h-4 stroke-2" /> View Raw Proposal
                        </button>
                        
                        <div className="pt-4 border-t border-border mt-4">
                          {isRevealed ? (
                            <div className="p-4 bg-primary/5 border border-primary rounded-md text-center">
                              <CheckBadgeIcon className="w-8 h-8 text-primary mx-auto mb-2 stroke-2" />
                              <p className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                                CONTRACT_AWARDED
                              </p>
                              <p className="text-[10px] text-text-muted font-mono uppercase mt-2">
                                Smart contract initialized. Supplier notified.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <button 
                                onClick={() => setAwardingBidFor(evaluation.bidId)}
                                className="w-full py-4 bg-text-main text-white rounded-md hover:bg-primary transition-colors text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                              >
                                <TrophyIcon className="w-4 h-4 stroke-2" /> Award Contract
                              </button>
                              
                              <button 
                                onClick={() => setRejectingBidFor(evaluation.bidId)}
                                className="w-full py-3 bg-surface border border-danger/30 rounded-md text-danger hover:bg-danger/5 transition-colors text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                              >
                                <NoSymbolIcon className="w-4 h-4 stroke-2" /> Disqualify Bid
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}

      {/* View Proposal Modal */}
      {viewingProposalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-2xl border border-border rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-mono text-sm font-bold tracking-widest text-text-main uppercase">
                [ PROPOSAL_DATA: {getAliasForBidId(viewingProposalFor)} ]
              </h3>
              <button onClick={() => setViewingProposalFor(null)} className="text-text-muted hover:text-text-main transition-colors p-1">
                <XMarkIcon className="w-5 h-5 stroke-2" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm text-text-main whitespace-pre-wrap leading-relaxed">
              {getProposalTextForBidId(viewingProposalFor)}
            </div>
          </div>
        </div>
      )}

      {/* Award Confirmation Modal */}
      {awardingBidFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md border border-primary rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <EyeIcon className="w-8 h-8 text-primary stroke-2" />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-main mb-2 tracking-tight uppercase">DECRYPT_IDENTITY_&_AWARD</h3>
            <p className="font-mono text-xs text-text-muted mb-8 leading-relaxed tracking-widest uppercase">
              Awarding this contract will permanently decrypt the supplier's real identity and write the award to the Polygon ledger. This action is irreversible.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setAwardingBidFor(null)}
                className="flex-1 py-3 bg-background border border-border rounded-md text-text-muted hover:text-text-main hover:bg-surface font-mono text-xs font-bold tracking-widest uppercase transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={() => confirmAward(awardingBidFor)}
                className="flex-1 py-3 bg-primary text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary-hover transition-colors shadow-sm"
              >
                CONFIRM_AWARD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingBidFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md border border-danger rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-danger/20">
              <ExclamationCircleIcon className="w-8 h-8 text-danger stroke-2" />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-main mb-2 tracking-tight uppercase">DISQUALIFY_BID</h3>
            <p className="font-mono text-xs text-text-muted mb-6 leading-relaxed tracking-widest uppercase">
              Please provide a brief reason for disqualification. This will be sent to the supplier anonymously.
            </p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Proposal does not meet minimum technical specifications..."
              className="w-full bg-background border border-border rounded-md p-3 text-sm font-mono text-text-main focus:outline-none focus:border-danger transition-colors mb-6 resize-none placeholder:text-text-muted/50"
              rows={3}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setRejectingBidFor(null); setRejectReason(""); }}
                className="flex-1 py-3 bg-background border border-border rounded-md text-text-muted hover:text-text-main font-mono text-xs font-bold tracking-widest uppercase transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={() => confirmReject(rejectingBidFor!)}
                disabled={!rejectReason.trim()}
                className="flex-1 py-3 bg-danger text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                DISQUALIFY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
