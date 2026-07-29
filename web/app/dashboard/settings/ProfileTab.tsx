"use client";

import { useRef, useState, useEffect } from "react";
import Avatar from "boring-avatars";
import { CheckCircleIcon, PencilIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/utils/supabase/client";

export default function ProfileTab({ user, profile, loadingProfile, refreshProfile }: any) {
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [entityType, setEntityType] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile && !loadingProfile) {
      setNickname(profile.nickname || "");
      setRole(profile.role || "");
      setEntityType(profile.entity_type || "");
      setAvatarUrl(profile.avatar_url || null);
      setContactName(profile.contact_name || "");
      setContactNumber(profile.contact_number || "");
    }
  }, [profile, loadingProfile]);

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
          contact_name: contactName,
          contact_number: contactNumber,
        }),
      });

      if (response.ok) {
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        const error = await response.json();
        console.log(`Failed to save profile: ${error.error}`);
      }
    } catch (error) {
      console.error(error);
      console.log("Network error occurred.");
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          avatar_url: publicUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to update database with new avatar");

      await refreshProfile();
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      console.log(error.message || "Failed to upload avatar. Ensure the bucket exists and RLS allows inserts.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const walletAddress = user.wallet?.address || "No wallet connected";

  return (
    <div className="bg-surface rounded-none p-6 sm:p-8 border border-border space-y-8 hover:border-text-main transition-colors">
      
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
          <div className="p-1 border border-border bg-gray-50 rounded-none transition-colors group-hover:border-primary w-[82px] h-[82px] overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-none" />
            ) : (
              <Avatar
                size={72}
                name={walletAddress}
                variant="beam"
                colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']}
              />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-text-main border-2 border-surface text-white p-1.5 rounded-none shadow-lg group-hover:bg-primary transition-colors">
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
            className="w-full bg-background border border-border rounded-none px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Network Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-border rounded-none px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
              required
              disabled
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
              className="w-full bg-background border border-border rounded-none px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors appearance-none"
              required
            >
              <option value="" disabled>Select_Entity</option>
              <option value="individual">Individual / Freelancer</option>
              <option value="company">Private Company</option>
              <option value="sme">SME (Small/Medium Enterprise)</option>
              <option value="institution">Academic / Institution</option>
              <option value="government">Government Agency</option>
              <option value="ngo">NGO / Non-Profit</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Contact Person (Optional)</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Juan Dela Cruz"
              className="w-full bg-background border border-border rounded-none px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors"
            />
          </div>

          <div>
            <label className="block text-text-muted font-mono text-xs font-bold tracking-widest uppercase mb-2">Contact Number (Optional)</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="0917-123-4567"
              className="w-full bg-background border border-border rounded-none px-4 py-3 text-text-main text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-text-main hover:border-text-main transition-colors"
            />
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
            className="px-6 py-2.5 bg-secondary text-white text-xs font-mono font-bold tracking-widest rounded-md transition-all shadow-sm hover:bg-secondary-hover hover:text-primary hover:shadow-md hover:-translate-y-0.5 uppercase flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Sealing..." : "Save_Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
