"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import Avatar from "boring-avatars";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { KeyIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { user, ready, exportWallet } = usePrivy();
  const [profile, setProfile] = useState<any>(null);
  
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [entityType, setEntityType] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (ready && user) {
      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfile(data.profile);
            setNickname(data.profile.nickname || "");
            setRole(data.profile.role || "");
            setEntityType(data.profile.entity_type || "");
          }
        })
        .catch(console.error);
    }
  }, [ready, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          nickname,
          role,
          entity_type: entityType,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Failed to save profile: ${error.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!ready || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-pulse font-mono text-sm tracking-widest text-primary">LOADING_SETTINGS...</div>
      </div>
    );
  }

  const walletAddress = user.wallet?.address || "No wallet connected";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">Account Settings</h1>
        <p className="text-text-muted">Manage your profile identity, role, and security keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <UserCircleIcon className="w-6 h-6 text-text-main" />
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">Profile Identity</h2>
          </div>
          
          <div className="bg-surface rounded-md p-8 border border-border space-y-8">
            
            {/* Avatar Section */}
            <div className="flex items-start sm:items-center gap-6 flex-col sm:flex-row">
              <div className="p-1 border border-border bg-gray-50 rounded-md">
                <Avatar
                  size={72}
                  name={walletAddress}
                  variant="beam"
                  colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']}
                />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-lg font-heading tracking-tight mb-1">Web3 Avatar</h3>
                <p className="text-text-muted text-sm max-w-md">
                  Your avatar is cryptographically seeded by your wallet address. It is unique to your identity on the network.
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6 pt-6 border-t border-border">
              <div>
                <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Network Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select Role...</option>
                    <option value="requestor">Requestor</option>
                    <option value="supplier">Supplier</option>
                    <option value="both">Both (Hybrid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Entity Type</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select Entity...</option>
                    <option value="individual">Individual / Freelancer</option>
                    <option value="company">Registered Company</option>
                    <option value="institution">Academic Institution</option>
                    <option value="government">Government Body</option>
                    <option value="ngo">NGO / Non-Profit</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="flex items-center text-green-600 font-mono text-xs font-bold tracking-widest uppercase">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Identity Updated
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-hover text-white font-heading font-bold tracking-wide uppercase py-3 px-8 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Sealing..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Wallet Section (Right 1 col) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <KeyIcon className="w-6 h-6 text-text-main" />
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">Security</h2>
          </div>

          <div className="bg-surface rounded-md p-6 border border-border space-y-6">
            <div>
              <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Connected Wallet</label>
              <div className="bg-background border border-border rounded-md p-4 font-mono text-xs text-text-muted break-all">
                {walletAddress}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Recovery Phrase</label>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                Your wallet is non-custodial. We cannot access your funds or secret phrase. Export it to a secure, offline location.
              </p>
              <button
                onClick={() => exportWallet()}
                className="w-full bg-background hover:bg-gray-50 border border-primary text-primary font-heading font-bold tracking-wide uppercase py-3 px-4 rounded-md transition-colors"
              >
                Export Secret Phrase
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
