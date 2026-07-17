"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { polygonAmoy } from "viem/chains";
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// ABI for the VerifiedBadge contract (mint function)
const VERIFIED_BADGE_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "to", "type": "address" }],
    "name": "adminMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// We would normally load this from env or config. 
// For now, assuming a deployed address (update this after deployment)
const VERIFIED_BADGE_ADDRESS = process.env.NEXT_PUBLIC_VERIFIED_BADGE_ADDRESS || "0x0000000000000000000000000000000000000000";

interface KYCRequest {
  id: string; // profile id
  nickname: string;
  entity_type: string;
  wallet_address: string;
  documents: {
    id: string;
    document_type: string;
    file_path: string;
  }[];
}

export default function AdminKYCPage() {
  const supabase = createClient();
  const { wallets } = useWallets();
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Fetch pending profiles
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, nickname, entity_type, wallet_address")
        .eq("verification_status", "pending");

      if (profileErr) throw profileErr;

      if (!profiles || profiles.length === 0) {
        setRequests([]);
        return;
      }

      const profileIds = profiles.map(p => p.id);

      // Fetch documents for these profiles
      const { data: docs, error: docErr } = await supabase
        .from("verification_documents")
        .select("*")
        .in("profile_id", profileIds);

      if (docErr) throw docErr;

      // Group
      const grouped = profiles.map(p => ({
        ...p,
        documents: docs.filter(d => d.profile_id === p.id)
      }));

      setRequests(grouped);
    } catch (error) {
      console.error("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("kyc_documents")
      .createSignedUrl(path, 60 * 60); // 1 hour expiry
    return data?.signedUrl || "#";
  };

  const handleApprove = async (request: KYCRequest) => {
    try {
      setProcessingId(request.id);
      
      const adminWallet = wallets[0];
      if (!adminWallet) throw new Error("No wallet connected for admin");

      const provider = await adminWallet.getEthereumProvider();
      
      await adminWallet.switchChain(polygonAmoy.id);

      const walletClient = createWalletClient({
        account: adminWallet.address as `0x${string}`,
        chain: polygonAmoy,
        transport: custom(provider)
      });

      // Mint SBT transaction
      if (VERIFIED_BADGE_ADDRESS !== "0x0000000000000000000000000000000000000000") {
          const tx = await walletClient.writeContract({
            address: VERIFIED_BADGE_ADDRESS as `0x${string}`,
            abi: VERIFIED_BADGE_ABI,
            functionName: 'adminMint',
            args: [request.wallet_address],
          });
          console.log("Mint Tx:", tx);
          // Wait for tx... (In a real app, use a public client to wait for receipt)
      } else {
          console.warn("No VERIFIED_BADGE_ADDRESS set. Skipping on-chain mint for MVP test.");
      }

      // Update DB
      await supabase
        .from("profiles")
        .update({ verification_status: "verified" })
        .eq("id", request.id);

      alert("Successfully verified user!");
      setRequests(requests.filter(r => r.id !== request.id));
    } catch (error: any) {
      console.error(error);
      alert(`Error approving: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: KYCRequest) => {
    try {
      setProcessingId(request.id);
      await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", request.id);

      alert("User verification rejected.");
      setRequests(requests.filter(r => r.id !== request.id));
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-20 px-8 w-full">
      <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
        [ INITIALIZING_VERIFICATION_MODULE ]
      </div>
    </div>
  );

  return (
    <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
          [ IDENTITY_VERIFICATION_MODULE ]
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
          Review and verify identity documents to authorize users on the platform.
        </p>
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-surface border border-border rounded-md p-10 text-center flex flex-col items-center justify-center">
          <CheckCircleIcon className="w-12 h-12 text-text-muted/50 mb-4 stroke-1" />
          <p className="text-text-muted font-mono text-xs font-bold uppercase tracking-widest">
            NO_PENDING_VERIFICATION_REQUESTS
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <div key={req.id} className="bg-surface border border-border rounded-md p-6 flex flex-col md:flex-row gap-6 hover:border-text-main transition-colors group">
              
              {/* User Info */}
              <div className="flex-1 space-y-4 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-heading font-black text-text-main uppercase">{req.nickname || "Unknown"}</h2>
                    <span className="px-2 py-0.5 border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-widest rounded-md">
                      {req.entity_type}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest truncate">WALLET: {req.wallet_address}</p>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest mb-3 border-b border-border pb-2">
                    [ UPLOADED_DOCUMENTS ]
                  </h3>
                  <ul className="space-y-2">
                    {req.documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-primary" />
                        <button 
                          onClick={async () => {
                            const url = await getDocUrl(doc.file_path);
                            window.open(url, "_blank");
                          }}
                          className="text-xs font-mono font-bold text-text-main hover:text-primary transition-colors uppercase tracking-widest underline decoration-border hover:decoration-primary underline-offset-4"
                        >
                          {doc.document_type}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex flex-col gap-3 justify-center min-w-[220px]">
                <button
                  onClick={() => handleApprove(req)}
                  disabled={processingId !== null}
                  className="w-full py-3 px-4 bg-primary text-background hover:bg-primary-hover font-mono text-xs font-bold uppercase tracking-widest transition-colors rounded-md shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4 stroke-2" />
                  APPROVE_&_MINT_SBT
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={processingId !== null}
                  className="w-full py-3 px-4 bg-background border border-danger text-danger hover:bg-danger/10 font-mono text-xs font-bold uppercase tracking-widest transition-colors rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircleIcon className="w-4 h-4 stroke-2" />
                  REJECT_APPLICATION
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
