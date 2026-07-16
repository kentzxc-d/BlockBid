"use client";

import { useState, useRef } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { createClient } from "@/utils/supabase/client";
import { usePrivy } from "@privy-io/react-auth";
import {
  CheckBadgeIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const { profile } = useProfile();
  const { user } = usePrivy();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Document states
  const [primaryId, setPrimaryId] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [dtiSec, setDtiSec] = useState<File | null>(null);
  const [bir2303, setBir2303] = useState<File | null>(null);
  const [mayorsPermit, setMayorsPermit] = useState<File | null>(null);

  const isCompany = profile?.entity_type === "company" || profile?.entity_type === "institution";

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user?.id) return;
    
    setUploading(true);
    setMessage(null);

    try {
      const uploadDoc = async (file: File | null, docType: string) => {
        if (!file) return;
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${docType}-${Date.now()}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("kyc_documents")
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;

        // Save reference to DB
        const { error: dbError } = await supabase
          .from("verification_documents")
          .insert({
            profile_id: user.id,
            document_type: docType,
            file_path: filePath
          });
          
        if (dbError) throw dbError;
      };

      if (isCompany) {
        if (!dtiSec || !bir2303 || !mayorsPermit) throw new Error("Please upload all company documents");
        await uploadDoc(dtiSec, "dti_sec");
        await uploadDoc(bir2303, "bir_2303");
        await uploadDoc(mayorsPermit, "mayors_permit");
      } else {
        if (!primaryId || !selfie) throw new Error("Please upload all required individual documents");
        await uploadDoc(primaryId, "primary_id");
        await uploadDoc(selfie, "selfie");
      }

      // Update profile status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setMessage({ text: "Documents submitted successfully! Pending admin approval.", type: "success" });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "Failed to submit documents", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const status = profile?.verification_status || "unverified";

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <CheckBadgeIcon className="w-8 h-8 text-blue-500" />
          Identity Verification
        </h1>
        <p className="text-slate-400">
          Upload your documents to get the Verified Badge and build reputation on BlockBid.
        </p>
      </div>

      {status === "verified" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckBadgeIcon className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-400 mb-1">You are Verified</h2>
            <p className="text-emerald-400/80">Your Identity Soulbound Token (SBT) is active.</p>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-400 mb-1">Verification Pending</h2>
            <p className="text-amber-400/80">Our admins are reviewing your documents. Please check back later.</p>
          </div>
        </div>
      )}

      {(status === "unverified" || status === "rejected") && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {status === "rejected" && (
            <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-400">Previous Request Rejected</h3>
                <p className="text-sm text-red-400/80 mt-1">Please ensure your documents are clear and valid, then try again.</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpload} className="p-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
                {isCompany ? "Company Verification (KYB)" : "Individual Verification (KYC)"}
              </h3>
              
              {isCompany ? (
                <>
                  <FileUpload label="DTI / SEC Registration" onChange={setDtiSec} file={dtiSec} />
                  <FileUpload label="BIR Form 2303" onChange={setBir2303} file={bir2303} />
                  <FileUpload label="Mayor's Permit" onChange={setMayorsPermit} file={mayorsPermit} />
                </>
              ) : (
                <>
                  <FileUpload label="Primary Government ID (Philsys / Passport)" onChange={setPrimaryId} file={primaryId} />
                  <FileUpload label="Selfie with ID (Liveness Verification)" onChange={setSelfie} file={selfie} />
                </>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Submit Documents
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function FileUpload({ label, file, onChange }: { label: string, file: File | null, onChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
          file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-800'
        }`}
      >
        {file ? (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-blue-400 truncate max-w-xs">{file.name}</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <CloudArrowUpIcon className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  );
}
