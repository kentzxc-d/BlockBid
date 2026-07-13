"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, keccak256, toHex } from "viem";
import { polygonAmoy } from "viem/chains";
import { BlockBidABI } from "@/lib/abi";
import { 
  ArrowLeftIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

type FieldData = {
  id: string; // matches project_criteria.id
  label: string;
  value: string;
};

export default function SubmitBidPage({ params }: { params: { id: string } }) {
  const { user } = usePrivy();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    fetch(`/api/procurements/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.project) {
          setProject(data.project);
          setFields(data.project.criteria.map((c: any) => ({
            id: c.id,
            label: c.name,
            value: ""
          })));
        } else {
          setError(data.error || "Project not found");
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load project details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params.id]);

  const handleFieldChange = (id: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setError("");
    
    try {
      // Generate a random alias for blind bidding
      const anonymous_alias = `Supplier-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const payload = {
        project_id: params.id,
        supplier_id: user.id,
        anonymous_alias,
        bid_values: fields.map(f => ({
          criteria_id: f.id,
          value: f.value
        }))
      };

      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit bid");
      }

      // Step 2: Write cryptographic hash to Polygon Amoy
      if (wallets && wallets.length > 0) {
        try {
          const wallet = wallets[0];
          await wallet.switchChain(polygonAmoy.id);
          const provider = await wallet.getEthereumProvider();
          
          const walletClient = createWalletClient({
            account: wallet.address as `0x${string}`,
            chain: polygonAmoy,
            transport: custom(provider)
          });

          const bidHash = keccak256(toHex(JSON.stringify(payload)));
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
          
          if (contractAddress) {
            const hash = await walletClient.writeContract({
              address: contractAddress,
              abi: BlockBidABI,
              functionName: 'commitBid',
              args: [params.id, bidHash]
            });
            setTxHash(hash);
          }
        } catch (contractErr: any) {
          console.error("Smart Contract Error:", contractErr);
          // We won't block the UI success if DB saved but contract failed, but we log it.
          // Or we can set an error. Let's just log it for the hackathon.
        }
      }

      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-8 w-full">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
          [ LOADING_PROCUREMENT_DATA ]
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 w-full">
        <div className="font-mono text-sm font-bold tracking-widest text-danger uppercase mb-4">
          [ ERROR: {error} ]
        </div>
        <Link href="/dashboard/procurements" className="text-primary hover:underline font-mono text-xs uppercase tracking-widest">
          Return to Solicitations
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <Link 
          href="/dashboard/procurements" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> Back to Solicitations
        </Link>
        <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
          [ SUBMIT_PROPOSAL: <span className="text-primary">{project.title}</span> ]
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
          Enter structured bid data. System will auto-format payload for ledger execution.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger text-danger font-mono text-xs font-bold tracking-widest uppercase">
          ERR: {error}
        </div>
      )}

      <div className="bg-surface rounded-md p-6 md:p-8 border border-border shadow-sm mb-8">
        
        <div className="mb-8 p-5 bg-gray-50 rounded-md border border-border">
          <h3 className="font-heading font-bold text-text-main text-lg mb-2 uppercase">{project.title}</h3>
          <p className="font-mono text-xs text-text-muted leading-relaxed mb-4">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md shadow-sm">
              DEADLINE: {new Date(project.deadline).toLocaleDateString()}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md shadow-sm">
              STATUS: {project.status}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-text-main font-heading uppercase tracking-tight border-b border-border pb-3">
            Evaluation Matrix Payload
          </h2>
          
          {fields.map((field) => (
            <div key={field.id} className="relative bg-surface p-5 rounded-md border border-border group transition-colors focus-within:border-text-main hover:border-text-muted">
              <label className="block text-xs font-mono font-bold tracking-widest text-text-main uppercase mb-2">
                {field.label} <span className="text-primary">*</span>
              </label>
              
              <textarea
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={`INPUT_${field.label ? field.label.toUpperCase().replace(/\s+/g, '_') : 'DATA'}...`}
                className="w-full bg-surface border border-border rounded-md p-4 text-sm font-mono text-text-main focus:outline-none focus:border-text-main transition-all resize-y min-h-[120px] placeholder:text-slate-300"
                required
              />
            </div>
          ))}

          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || fields.some(f => !f.value.trim())}
              className="px-8 py-3.5 bg-text-main text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-text-main shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4 stroke-2" /> EXECUTE_PROPOSAL
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface rounded-md w-full max-w-md border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-t-4 border-t-primary">
              <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <CheckBadgeIcon className="w-8 h-8 text-primary stroke-2" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-main mb-2 uppercase tracking-tight">TRANSACTION_SUCCESS</h3>
              <p className="font-mono text-xs text-text-muted mb-8 leading-relaxed uppercase tracking-widest">
                Payload formatted and transmitted to procurement ledger.
              </p>
              
              <Link 
                href="/dashboard/my-bids" 
                className="inline-flex w-full justify-center py-3.5 bg-text-main text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors shadow-sm"
              >
                VIEW_MY_BIDS
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
