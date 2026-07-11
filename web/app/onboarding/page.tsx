"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserCircleIcon, BuildingOfficeIcon, UserIcon, BuildingLibraryIcon, GlobeAltIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function OnboardingPage() {
  const { user, ready } = usePrivy();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If not ready or no user, just wait
  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [user, ready, router]);

  const getPrivyId = () => {
    if (!user) return "";
    return user.id; // did:privy:...
  };

  const getWalletOrEmail = () => {
    if (!user) return "";
    return user.wallet?.address || user.email?.address || "";
  };

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
        // Redirect to dashboard overview
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

  if (!ready || !user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary px-8 py-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
          <h1 className="text-3xl font-bold font-heading relative z-10">Welcome to BlockBid</h1>
          <p className="mt-2 text-white/80 font-medium relative z-10">Let's set up your profile before we begin.</p>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3 mt-8 relative z-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full transition-all ${s === step ? 'bg-white scale-125' : s < step ? 'bg-green-400' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10">
          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">What brings you here?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <button 
                  onClick={() => setRole("supplier")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'supplier' ? 'border-primary bg-blue-50/50 ring-4 ring-primary/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <BuildingOfficeIcon className={`w-8 h-8 mb-4 ${role === 'supplier' ? 'text-primary' : 'text-slate-400'}`} />
                  <h3 className="font-bold text-lg text-slate-800 mb-1">I want to Bid</h3>
                  <p className="text-sm text-slate-500 font-medium">I am a supplier looking to win government contracts.</p>
                </button>

                <button 
                  onClick={() => setRole("requestor")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'requestor' ? 'border-primary bg-blue-50/50 ring-4 ring-primary/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <BuildingLibraryIcon className={`w-8 h-8 mb-4 ${role === 'requestor' ? 'text-primary' : 'text-slate-400'}`} />
                  <h3 className="font-bold text-lg text-slate-800 mb-1">I want to Procure</h3>
                  <p className="text-sm text-slate-500 font-medium">I am an agency looking to post solicitations.</p>
                </button>

                <button 
                  onClick={() => setRole("both")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all md:col-span-2 ${role === 'both' ? 'border-primary bg-blue-50/50 ring-4 ring-primary/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <GlobeAltIcon className={`w-8 h-8 mb-4 ${role === 'both' ? 'text-primary' : 'text-slate-400'}`} />
                  <h3 className="font-bold text-lg text-slate-800 mb-1">Both / Not Sure Yet</h3>
                  <p className="text-sm text-slate-500 font-medium">I want to explore both bidding and procurement features.</p>
                </button>

              </div>
              <div className="mt-10 flex justify-end">
                <button 
                  disabled={!role}
                  onClick={() => setStep(2)}
                  className="btn btn-primary px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue <CheckCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTITY TYPE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">What type of entity are you?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
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
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${entityType === type.id ? 'border-primary bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <type.icon className={`w-6 h-6 ${entityType === type.id ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-700">{type.label}</span>
                  </button>
                ))}

              </div>
              <div className="mt-10 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button 
                  disabled={!entityType}
                  onClick={() => setStep(3)}
                  className="btn btn-primary px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue <CheckCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NICKNAME */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCircleIcon className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What should we call you?</h2>
              <p className="text-slate-500 mb-8 text-sm">This will be your display name across the dashboard.</p>
              
              <div className="max-w-sm mx-auto text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Display Name / Nickname</label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Acme Corp or John Doe"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-800"
                  autoFocus
                />
              </div>

              <div className="mt-10 flex justify-between max-w-sm mx-auto">
                <button onClick={() => setStep(2)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button 
                  disabled={!nickname || isSubmitting}
                  onClick={handleSubmit}
                  className="btn btn-primary px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
