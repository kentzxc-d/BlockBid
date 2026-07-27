"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckCircleIcon, CloudArrowUpIcon, DocumentTextIcon, XCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, parseEther } from "viem";
import { activeChain } from "@/utils/network";
export default function VerificationTab({ profile, refreshProfile }: { profile: any, refreshProfile: () => Promise<void> }) {
  const { wallets } = useWallets();
  const [isTransferringPol, setIsTransferringPol] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    business_registration: null,
    mayors_permit: null,
    tax_clearance: null,
    afs: null,
    sworn_declaration: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFileChange = (type: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const isFormComplete = Object.values(files).every(file => file !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || !profile?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload all 5 files
      const uploadPromises = Object.entries(files).map(async ([type, file]) => {
        if (!file) throw new Error("Missing file for " + type);

        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/${type}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kyc_documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Insert into verification_documents
        const { error: dbError } = await supabase
          .from('verification_documents')
          .insert({
            profile_id: profile.id,
            document_type: type,
            file_path: fileName,
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);

      // Update profile status to pending
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Refresh parent context
      await refreshProfile();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit verification request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRescuePol = async () => {
    setTransferError(null);
    setIsTransferringPol(true);
    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(activeChain.id);
      const provider = await wallet.getEthereumProvider();
      
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: activeChain,
        transport: custom(provider)
      });

      const tx = await walletClient.sendTransaction({
        to: "0x847635127BaC9fc044d239d00D5c89E6cce9Df3e",
        value: parseEther("0.1"), 
      });

      alert(`Successfully sent 0.1 POL! Tx Hash: ${tx}`);
    } catch (err: any) {
      console.error(err);
      setTransferError(err.message || "Failed to transfer POL");
    } finally {
      setIsTransferringPol(false);
    }
  };

  const status = profile?.verification_status || 'unverified';

  const docTypeLabel = profile?.entity_type === 'sme'
    ? 'DTI Registration Certificate'
    : 'SEC Registration Certificate';

  if (status === 'verified') {
    return (
      <div className="bg-surface rounded-md border border-primary p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-10 h-10 text-primary stroke-2" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-text-main uppercase tracking-tight mb-2">
          Platinum Member
        </h2>
        <p className="text-sm font-mono text-text-muted mb-6">
          Your account is fully verified. You have full access to bid on government projects.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-full font-mono text-xs font-bold tracking-widest uppercase">
          VERIFIED BADGE SECURED
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bg-surface rounded-md border border-warning/50 p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <DocumentTextIcon className="w-10 h-10 text-warning stroke-2" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-text-main uppercase tracking-tight mb-2">
          Application Under Review
        </h2>
        <p className="text-sm font-mono text-text-muted mb-6 max-w-md">
          Your Class A documents have been submitted and are currently being reviewed by our compliance team. This usually takes 1-2 business days.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning border border-warning/30 rounded-md font-mono text-xs font-bold tracking-widest uppercase">
          STATUS: PENDING_VERIFICATION
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-none p-6 sm:p-8 border border-border space-y-8">
      <div>
        <h3 className="font-bold text-text-main text-lg font-heading tracking-tight mb-2 uppercase">
          Submit Class A Documents
        </h3>
        <p className="text-text-muted text-xs font-mono uppercase tracking-widest leading-relaxed">
          Upload the required PhilGEPS eligibility documents to unlock bidding capabilities. All files must be in PDF or Image format.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-xs font-bold tracking-widest uppercase rounded-md flex items-center gap-3">
          <XCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* TEMPORARY POL TRANSFER BUTTON */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
        <h4 className="text-primary font-bold font-mono tracking-widest text-xs uppercase mb-2">Emergency POL Transfer</h4>
        <p className="text-[10px] font-mono text-text-muted mb-4">Click below to send 0.1 POL from this Privy wallet to the Deployment Wallet (0x8476...).</p>
        <button
          onClick={handleRescuePol}
          disabled={isTransferringPol}
          className="py-2 px-4 bg-primary text-white font-mono text-xs font-bold tracking-widest rounded hover:bg-primary-hover transition-colors uppercase flex items-center gap-2 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          {isTransferringPol ? "SENDING..." : "SEND 0.1 POL TO DEPLOYER"}
        </button>
        {transferError && <p className="text-[10px] text-danger font-mono mt-2 uppercase">{transferError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border-t border-border pt-6">

        {/* Document Upload Fields */}
        {[
          { key: 'business_registration', label: docTypeLabel, desc: 'DTI for SMEs, SEC for Corporations' },
          { key: 'mayors_permit', label: "Mayor's / Business Permit", desc: 'Valid permit from your LGU' },
          { key: 'tax_clearance', label: 'Tax Clearance Certificate', desc: 'Issued by the BIR' },
          { key: 'afs', label: 'Audited Financial Statements', desc: 'Stamped "Received" by the BIR' },
          { key: 'sworn_declaration', label: 'PhilGEPS Sworn Declaration', desc: 'Notarized statement' },
        ].map((doc) => (
          <div key={doc.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-md hover:border-text-main transition-colors bg-background">
            <div>
              <label className="block text-text-main font-mono text-xs font-bold tracking-widest uppercase mb-1">
                {doc.label}
              </label>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{doc.desc}</p>
            </div>
            <div className="shrink-0 relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className={`w-full sm:w-auto px-4 py-2 font-mono text-[10px] font-bold tracking-widest uppercase rounded flex items-center justify-center gap-2 transition-colors ${files[doc.key]
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-surface border border-border text-text-main hover:bg-border'
                  }`}
              >
                {files[doc.key] ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    {files[doc.key]?.name.substring(0, 15)}...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        <div className="pt-6">
          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
            className="w-full py-4 bg-primary text-white font-mono text-sm font-bold tracking-widest rounded-md hover:bg-primary-hover transition-colors uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "UPLOADING DOCUMENTS..."
            ) : (
              "SUBMIT FOR VERIFICATION"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
