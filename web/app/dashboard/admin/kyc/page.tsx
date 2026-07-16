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

  if (loading) return <div className="p-8 text-slate-400">Loading KYC requests...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">KYC/KYB Verification Dashboard</h1>
      
      {requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          No pending verification requests at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
              
              {/* User Info */}
              <div className="flex-1 space-y-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{req.nickname || "Unknown"}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium uppercase">
                      {req.entity_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 font-mono truncate">{req.wallet_address}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Uploaded Documents:</h3>
                  <ul className="space-y-2">
                    {req.documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                        <button 
                          onClick={async () => {
                            const url = await getDocUrl(doc.file_path);
                            window.open(url, "_blank");
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {doc.document_type}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex flex-col gap-3 justify-center min-w-[200px]">
                <button
                  onClick={() => handleApprove(req)}
                  disabled={processingId !== null}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Approve & Mint SBT
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={processingId !== null}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-slate-700 hover:border-red-500/50"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
