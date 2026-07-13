"use client";

import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  UsersIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export default function OnboardingPage() {
  const { user, ready } = usePrivy();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [user, ready, router]);

  const getPrivyId = () => user?.id || "";
  const getWalletOrEmail = () => user?.wallet?.address || user?.email?.address || "";

  const handleSubmit = async () => {
    if (!role || !entityType || !nickname || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: getPrivyId(),
          role,
          entity_type: entityType,
          nickname,
          wallet_address: getWalletOrEmail(),
        }),
      });

      if (response.ok) {
        router.push("/dashboard/user");
      } else {
        const error = await response.json();
        alert(`Failed to save profile: ${error.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Network error occurred.");
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
    { id: 1, label: "DECLARE_ROLE" },
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
            Procurement, cryptographically sealed. Authenticate your identity to proceed.
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
        <div className="absolute top-0 right-0 p-8 hidden md:block">
          <span className="badge font-mono text-xs border border-primary/30 rounded-none bg-primary/10 text-primary uppercase tracking-widest px-3 py-1.5">
            Secure Setup
          </span>
        </div>

        {/* STEP 1: ROLE */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-heading font-bold text-text-main mb-3 tracking-tight">Declare Intended Role</h2>
            <p className="text-text-muted mb-10 font-medium max-w-lg">Select your primary operational function within the network. This dictates your interface configuration.</p>

            <div className="grid gap-4">
              <button
                onClick={() => setRole("supplier")}
                className={`p-6 border flex items-start gap-5 text-left transition-all group rounded-none ${role === "supplier" ? "border-primary bg-primary/5" : "border-border hover:border-text-main bg-surface"
                  }`}
              >
                <div className={`p-3 border rounded-none ${role === "supplier" ? "border-primary text-primary bg-white" : "border-border text-text-muted group-hover:text-text-main"}`}>
                  <BuildingOfficeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-main mb-1">Supplier / Bidder</h3>
                  <p className="text-sm text-text-muted font-medium">I am seeking to fulfill government contracts.</p>
                </div>
              </button>

              <button
                onClick={() => setRole("requestor")}
                className={`p-6 border flex items-start gap-5 text-left transition-all group rounded-none ${role === "requestor" ? "border-primary bg-primary/5" : "border-border hover:border-text-main bg-surface"
                  }`}
              >
                <div className={`p-3 border rounded-none ${role === "requestor" ? "border-primary text-primary bg-white" : "border-border text-text-muted group-hover:text-text-main"}`}>
                  <BuildingLibraryIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-main mb-1">Procuring Agency</h3>
                  <p className="text-sm text-text-muted font-medium">I am an agency looking to post solicitations.</p>
                </div>
              </button>

              <button
                onClick={() => setRole("both")}
                className={`p-6 border flex items-start gap-5 text-left transition-all group rounded-none ${role === "both" ? "border-primary bg-primary/5" : "border-border hover:border-text-main bg-surface"
                  }`}
              >
                <div className={`p-3 border rounded-none ${role === "both" ? "border-primary text-primary bg-white" : "border-border text-text-muted group-hover:text-text-main"}`}>
                  <GlobeAltIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-main mb-1">Dual / Undefined</h3>
                  <p className="text-sm text-text-muted font-medium">I require access to both bidding and procurement capabilities.</p>
                </div>
              </button>
            </div>

            <div className="mt-12 flex justify-end">
              <button
                disabled={!role}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'individual', label: 'Individual / Freelancer', icon: UserIcon },
                { id: 'company', label: 'Private Company', icon: BuildingOfficeIcon },
                { id: 'institution', label: 'Academic / Institution', icon: BuildingLibraryIcon },
                { id: 'government', label: 'Government Agency', icon: GlobeAltIcon },
                { id: 'ngo', label: 'NGO / Non-Profit', icon: UsersIcon },
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

        {/* STEP 3: NICKNAME */}
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
                placeholder="e.g. Acme Corp or DOH Region 7"
                className="w-full px-5 py-4 bg-surface border border-border focus:outline-none focus:border-primary transition-colors font-heading text-lg font-medium text-text-main rounded-none"
                autoFocus
              />
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-border pt-8">
              <button
                onClick={() => setStep(2)}
                className="font-mono text-sm tracking-wider text-text-muted hover:text-text-main transition-colors uppercase border-b border-transparent hover:border-text-main pb-0.5"
              >
                ← Return to Previous
              </button>
              <button
                disabled={!nickname || isSubmitting}
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
    </div>
  );
}
