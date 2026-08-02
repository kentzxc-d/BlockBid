"use client";

import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  UsersIcon,
  CheckIcon,
  ComputerDesktopIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  TruckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useProfile } from "@/contexts/ProfileContext";

export default function OnboardingPage() {
  const { user, ready } = usePrivy();
  const { refreshProfile } = useProfile();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [supplyCategory, setSupplyCategory] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTerms(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [user, ready, router]);

  const getPrivyId = () => user?.id || "";
  const getWalletOrEmail = () => user?.wallet?.address || user?.email?.address || "";

  const handleSubmit = async () => {
    if (!supplyCategory || !entityType || !nickname || !user || !acceptedTerms) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: getPrivyId(),
          role: "supplier",
          entity_type: entityType,
          nickname,
          wallet_address: getWalletOrEmail(),
        }),
      });

      if (response.ok) {
        await refreshProfile();
        router.push("/dashboard");
      } else {
        const error = await response.json();
        console.log(`Failed to save profile: ${error.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      console.log("Network error occurred.");
      setIsSubmitting(false);
    }
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-white font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING_SECURE_SESSION...
        </div>
      </div>
    );
  }

  const STEPS = [
    { id: 1, label: "SUPPLY_CATEGORY" },
    { id: 2, label: "CLASSIFY_ENTITY" },
    { id: 3, label: "REGISTER_NAME" }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">

      {/* Left Panel: The Ledger (Signature Element) */}
      <div className="md:w-1/3 bg-secondary text-white p-10 flex flex-col justify-between border-r border-border-inverse relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="flex items-center gap-3 text-3xl font-heading font-bold text-primary mb-2 uppercase tracking-wide">
            <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={56} height={56} className="object-contain" />
            BLOCKBID
          </h1>
          <p className="text-text-inverse-muted font-medium text-sm max-w-xs">
            Acquisition, cryptographically sealed. Authenticate your identity to proceed.
          </p>
        </div>

        <div className="space-y-8 relative z-10 my-16 md:my-0">
          {STEPS.map((s) => (
            <div key={s.id} className={`flex flex-col transition-all duration-300 ${step === s.id ? "opacity-100" : "opacity-30"}`}>
              <span className="font-mono text-xs tracking-widest mb-1 text-primary">
                [ 0x0{s.id} ]
              </span>
              <span className={`font-heading text-2xl font-semibold tracking-tight ${step === s.id ? "text-white" : "text-text-inverse-muted"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="font-mono text-xs text-text-inverse-muted tracking-wider break-all">
            CONNECTION_ESTABLISHED<br />
            DID: {getPrivyId()}
          </div>
        </div>
      </div>

      {/* Right Panel: The Form */}
      <div className="md:w-2/3 p-10 md:p-20 flex flex-col justify-center max-w-4xl mx-auto w-full relative">
        
        {/* STEP 1: SUPPLY CATEGORY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-heading font-bold text-text-main mb-3 tracking-tight">Declare Supply Category</h2>
            <p className="text-text-muted mb-10 font-medium max-w-lg">Identify the primary category of goods or services your entity supplies to the network.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'it_equipment', label: 'IT Equipment', icon: ComputerDesktopIcon },
                { id: 'medical', label: 'Medical Supplies', icon: HeartIcon },
                { id: 'construction', label: 'Construction', icon: WrenchScrewdriverIcon },
                { id: 'office', label: 'Office Supplies', icon: PaperClipIcon },
                { id: 'machinery', label: 'Heavy Machinery', icon: TruckIcon },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSupplyCategory(type.id)}
                  className={`p-5 border flex items-center gap-4 transition-all group rounded-none ${supplyCategory === type.id ? "border-primary bg-primary/5" : "border-border hover:border-text-main bg-surface"
                    }`}
                >
                  <type.icon className={`w-5 h-5 ${supplyCategory === type.id ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`} />
                  <span className="font-heading font-bold text-text-main">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-12 flex justify-end border-t border-border pt-8">
              <button
                disabled={!supplyCategory}
                onClick={() => setStep(2)}
                className="btn btn-primary rounded-none px-8 py-4 disabled:opacity-40 font-heading font-bold tracking-wide uppercase shadow-none border border-primary hover:-translate-y-0.5"
              >
                Acknowledge & Proceed
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ENTITY TYPE */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-heading font-bold text-text-main mb-3 tracking-tight">Specify Entity Classification</h2>
            <p className="text-text-muted mb-10 font-medium max-w-lg">Identify your legal structure for compliance and auditing purposes.</p>

            <div className="grid grid-cols-1 gap-4 max-w-lg">
              {[
                { id: 'company', label: 'Private Company / Corporation', icon: BuildingOfficeIcon },
                { id: 'individual', label: 'Individual / Freelancer', icon: UserIcon },
                { id: 'ngo', label: 'NGO / Cooperative', icon: UsersIcon },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEntityType(type.id)}
                  className={`p-5 border flex items-center gap-4 transition-all group rounded-none ${entityType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-text-main bg-surface"
                    }`}
                >
                  <type.icon className={`w-5 h-5 ${entityType === type.id ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`} />
                  <span className="font-heading font-bold text-text-main">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-border pt-8">
              <button
                onClick={() => setStep(1)}
                className="font-mono text-sm tracking-wider text-text-muted hover:text-text-main transition-colors uppercase border-b border-transparent hover:border-text-main pb-0.5"
              >
                ← Return to Previous
              </button>
              <button
                disabled={!entityType}
                onClick={() => setStep(3)}
                className="btn btn-primary rounded-none px-8 py-4 disabled:opacity-40 font-heading font-bold tracking-wide uppercase shadow-none border border-primary hover:-translate-y-0.5"
              >
                Acknowledge & Proceed
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NICKNAME & TERMS */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-heading font-bold text-text-main mb-3 tracking-tight">Register Display Name</h2>
            <p className="text-text-muted mb-10 font-medium max-w-lg">This identifier will be visible on the public registry alongside your cryptographic signature.</p>

            <div className="max-w-md">
              <label className="block font-mono text-xs text-text-muted mb-2 tracking-widest uppercase">
                [ Public Identifier ]
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Acme Corp or Juan Dela Cruz"
                className="w-full px-5 py-4 bg-surface border border-border focus:outline-none focus:border-primary transition-colors font-heading text-lg font-medium text-text-main rounded-none mb-8"
                autoFocus
              />

              {/* TERMS CHECKBOX */}
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border-2 border-border group-hover:border-primary checked:bg-primary checked:border-primary transition-all cursor-pointer rounded-none"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  {acceptedTerms && <CheckIcon className="absolute w-3.5 h-3.5 text-white pointer-events-none stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest leading-relaxed">
                    I HAVE READ AND ACCEPT THE{" "}
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                      className="text-primary hover:text-primary-light underline underline-offset-4 decoration-primary/50"
                    >
                      CRYPTOGRAPHIC TERMS OF AGREEMENT
                    </button>
                    .
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-border pt-8">
              <button
                onClick={() => setStep(2)}
                className="font-mono text-sm tracking-wider text-text-muted hover:text-text-main transition-colors uppercase border-b border-transparent hover:border-text-main pb-0.5"
              >
                ← Return to Previous
              </button>
              <button
                disabled={!nickname || !acceptedTerms || isSubmitting}
                onClick={handleSubmit}
                className="btn btn-primary rounded-none px-8 py-4 disabled:opacity-40 font-heading font-bold tracking-wide uppercase shadow-none border border-primary hover:-translate-y-0.5 flex items-center gap-3"
              >
                {isSubmitting ? "Committing..." : "Finalize Registration"}
                {!isSubmitting && <CheckIcon className="w-5 h-5 stroke-2" />}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-secondary rounded-none w-full max-w-xl border border-primary/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-primary/20 bg-secondary flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg text-primary uppercase tracking-tight">BLOCKBID TERMS OF PARTICIPATION</h3>
              <button 
                onClick={() => setShowTerms(false)} 
                className="text-text-inverse-muted hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 bg-secondary space-y-6 max-h-[60vh] overflow-y-auto font-mono text-xs text-white leading-relaxed [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <p className="text-text-inverse-muted italic">By interacting with this cryptographic ledger, you agree to the following conditions:</p>
              
              <div>
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest">1. ON-CHAIN LIABILITY</h4>
                <p>All submitted bids are immutable and cryptographically bound to your wallet address. Falsification of documents or market prices will result in permanent blacklisting from the network.</p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest">2. BID BOND FORFEITURE</h4>
                <p>Submitting a formal proposal requires a 1% Bid Bond locked in escrow via smart contract. If you are awarded the contract but fail to deliver or withdraw your bid, this bond is <span className="text-red-400 font-bold">permanently forfeited</span> as a penalty.</p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-2 uppercase tracking-widest">3. DISPUTE RESOLUTION</h4>
                <p>The Procuring Agency retains the final authority to evaluate and award contracts based on the AI-assisted Evaluation Matrix. BlockBid is not liable for awarding outcomes.</p>
              </div>
              
              <p className="text-text-inverse-muted italic pt-4 border-t border-primary/20">I acknowledge that blockchain transactions are final and cannot be reversed.</p>
            </div>

            <div className="p-4 bg-secondary border-t border-primary/20 flex justify-end">
              <button 
                onClick={() => setShowTerms(false)} 
                className="px-6 py-2.5 bg-primary text-secondary rounded-none font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary-light transition-all hover:-translate-y-0.5 shadow-[4px_4px_0_0_rgba(234,179,8,0.2)]"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

