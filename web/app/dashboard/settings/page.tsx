"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useRef } from "react";
import Avatar from "boring-avatars";
import { CheckCircleIcon, PencilIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const { user, ready, exportWallet } = usePrivy();
  const [profile, setProfile] = useState<any>(null);
  
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setAvatarUrl(data.profile.avatar_url || null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const supabase = createClient();
    
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // 3. Save to Profile API
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          avatar_url: publicUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update database with new avatar");

      // 4. Update UI state
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      alert(error.message || "Failed to upload avatar. Ensure the bucket exists and RLS allows inserts.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!ready || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-10 px-8">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">[ INITIALIZING_SETTINGS ]</div>
      </div>
    );
  }

  const walletAddress = user.wallet?.address || "No wallet connected";

  return (
    <div className="py-10 px-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">Account Settings</h1>
        <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase">Manage_Identity_&_Keys</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">[ PROFILE_IDENTITY ]</h2>
          </div>
          
          <div className="bg-surface rounded-md p-6 sm:p-8 border border-border space-y-8 hover:border-text-main transition-colors">
            
            {/* Avatar Section */}
            <div className="flex items-start sm:items-center gap-6 flex-col sm:flex-row">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <div 
                className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} 
                onClick={() => fileInputRef.current?.click()}
                title="Upload custom avatar"
              >
                <div className="p-1 border border-border bg-gray-50 rounded-md transition-colors group-hover:border-primary w-[82px] h-[82px] overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-sm" />
                  ) : (
                    <Avatar
                      size={72}
                      name={walletAddress}
                      variant="beam"
                      colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']}
                    />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-text-main border-2 border-surface text-white p-1.5 rounded-full shadow-lg group-hover:bg-primary transition-colors">
                  <PencilIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-text-main text-lg font-heading tracking-tight mb-1">
                  {isUploading ? "UPLOADING..." : "WEB3_AVATAR"}
                </h3>
                <p className="text-text-muted text-[11px] font-mono font-bold tracking-wider uppercase max-w-md leading-relaxed">
                  Cryptographically seeded by wallet, or click to upload a custom identity file.
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
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Network Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select_Role</option>
                    <option value="requestor">Procuring Agency</option>
                    <option value="supplier">Supplier / Bidder</option>
                    <option value="both">Dual / Undefined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Entity Type</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select_Entity</option>
                    <option value="individual">Individual / Freelancer</option>
                    <option value="company">Private Company</option>
                    <option value="institution">Academic / Institution</option>
                    <option value="government">Government Agency</option>
                    <option value="ngo">NGO / Non-Profit</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="flex items-center text-green-600 font-mono text-xs font-bold tracking-widest uppercase">
                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                    Identity_Sealed
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-mono font-bold tracking-widest rounded-md hover:bg-primary-hover transition-colors uppercase flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? "Sealing..." : "Save_Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Wallet Section (Right 1 col) */}
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">[ SECURITY_KEYS ]</h2>
          </div>

          <div className="bg-surface rounded-md border border-border flex flex-col overflow-hidden hover:border-text-main transition-colors">
            <div className="p-5 border-l-4 border-l-primary">
              <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Connected_Wallet</label>
              <div className="bg-background border border-border rounded-md p-3 font-mono text-xs font-bold text-text-main tracking-widest break-all">
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
                className="w-full px-4 py-2.5 bg-text-main text-white text-[10px] font-mono font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase"
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
