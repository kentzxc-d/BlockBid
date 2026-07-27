"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CheckCircleIcon, CloudArrowUpIcon, DocumentTextIcon, XCircleIcon, PaperAirplaneIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, parseEther } from "viem";
import { activeChain } from "@/utils/network";
export default function VerificationTab({ profile, refreshProfile }: { profile: any, refreshProfile: () => Promise<void> }) {
  const { wallets } = useWallets();
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    business_registration: null,
    mayors_permit: null,
    tax_clearance: null,
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



  if (status === 'verified') {
    return (
      <>
        <div className="mb-6">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-default">
              <div className="w-20 h-20 bg-surface border-2 border-border group-hover:border-text-main transition-colors flex items-center justify-center overflow-hidden">
                <img src="/verified-badge.png" alt="Verified Badge" className="w-14 h-14 object-contain drop-shadow-md" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-text-main border-2 border-surface text-white p-1.5 rounded-none shadow-lg group-hover:bg-primary transition-colors">
                <CheckIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-text-main text-lg font-heading tracking-tight mb-1 uppercase">
                Verified Member
              </h3>
              <p className="text-text-muted text-[11px] font-mono font-bold tracking-wider uppercase max-w-md leading-relaxed">
                Your account is fully verified. You have full access to bid on government projects.
              </p>
            </div>
          </div>
          <div className="w-full h-px bg-border my-6" />
        </div>
      </>
    );
  }

  if (status === 'pending') {
    return (
      <>
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
      </>
    );
  }

  return (
    <div className="bg-surface rounded-none p-6 sm:p-8 border border-border space-y-8">
      <div>
        <h3 className="font-bold text-text-main text-lg font-heading tracking-tight mb-2 uppercase">
          Submit Class A Documents
        </h3>
        <p className="text-text-muted text-xs font-mono uppercase tracking-widest leading-relaxed">
          Upload the required eligibility documents to unlock bidding capabilities. All files must be in PDF or Image format.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-xs font-bold tracking-widest uppercase rounded-md flex items-center gap-3">
          <XCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 border-t border-border pt-6">

        {/* Document Upload Fields */}
        {[
          { key: 'business_registration', label: docTypeLabel, desc: 'DTI for SMEs, SEC for Corporations' },
          { key: 'mayors_permit', label: "Mayor's / Business Permit", desc: 'Valid permit from your LGU' },
          { key: 'tax_clearance', label: 'Tax Clearance Certificate', desc: 'Issued by the BIR' },
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
            className="w-full py-4 bg-secondary text-white font-mono text-sm font-bold tracking-widest rounded-md transition-all shadow-sm hover:bg-secondary-hover hover:text-primary hover:shadow-md hover:-translate-y-0.5 uppercase disabled:opacity-50 flex items-center justify-center gap-2"
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
