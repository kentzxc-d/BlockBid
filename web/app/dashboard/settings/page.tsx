"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, Suspense } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSearchParams } from "next/navigation";
import ProfileTab from "./ProfileTab";
import VerificationTab from "./VerificationTab";

function SettingsPageContent() {
  const { user, ready, exportWallet } = usePrivy();
  const { profile, loadingProfile, refreshProfile } = useProfile();
  
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as string);
    }
  }, [searchParams]);

  if (!ready || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-6 px-4 md:py-10 md:px-8">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">[ INITIALIZING_SETTINGS ]</div>
      </div>
    );
  }

  const walletAddress = user.wallet?.address || "No wallet connected";

  return (
    <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
          <span className="text-primary">[</span> ACCOUNT_SETTINGS <span className="text-primary">]</span>
        </h1>
        <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase">Manage_Identity_&_Keys</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-6 border-b border-border overflow-x-auto whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-sm font-bold font-mono tracking-widest uppercase transition-colors relative ${
                activeTab === 'profile' ? 'text-primary' : 'text-text-muted hover:text-text-main'
              }`}
            >
              [ PROFILE_IDENTITY ]
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`pb-3 text-sm font-bold font-mono tracking-widest uppercase transition-colors relative ${
                activeTab === 'verification' ? 'text-primary' : 'text-text-muted hover:text-text-main'
              }`}
            >
              [ ACCOUNT_VERIFICATION ]
              {activeTab === 'verification' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'profile' && (
            <ProfileTab 
              user={user} 
              profile={profile} 
              loadingProfile={loadingProfile} 
              refreshProfile={refreshProfile} 
            />
          )}

          {activeTab === 'verification' && (
            <VerificationTab 
              profile={profile} 
              refreshProfile={refreshProfile} 
            />
          )}

        </div>

        {/* Security & Wallet Section (Right 1 col) */}
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">[ SECURITY_KEYS ]</h2>
          </div>

          <div className="bg-surface rounded-none border border-border flex flex-col overflow-hidden hover:border-text-main transition-colors">
            <div className="p-5 border-l-4 border-l-primary">
              <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Connected_Wallet</label>
              <div className="bg-background border border-border rounded-none p-3 font-mono text-xs font-bold text-text-main tracking-widest break-all">
                {walletAddress}
              </div>
            </div>

            <div className="p-5 border-t border-border">
              <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Recovery_Phrase</label>
              <p className="text-[11px] font-mono text-text-muted font-bold tracking-widest uppercase mb-4 leading-relaxed">
                Wallet is non-custodial. Export your secret phrase to a secure offline location.
              </p>
              <button
                onClick={() => exportWallet()}
                className="w-full px-4 py-2.5 bg-secondary text-white text-[10px] font-mono font-bold tracking-widest rounded-md transition-all shadow-sm hover:bg-secondary-hover hover:text-primary hover:shadow-md hover:-translate-y-0.5 uppercase"
              >
                Export_Secret_Phrase
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-10 font-mono text-primary">[ LOADING_SETTINGS ]</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
