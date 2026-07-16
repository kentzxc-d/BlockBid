"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef } from "react";
import { DocumentDuplicateIcon, ArrowRightOnRectangleIcon, CheckIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import NotificationBell from "@/components/NotificationBell";

export default function DashboardTopbar() {
  const { user, ready, logout } = usePrivy();
  const { profile, refreshProfile } = useProfile();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed alternating timer

  // Safely extract an identifier for the user
  useEffect(() => {
    if (ready && user) {
      let defaultId = "";
      if (user.wallet?.address) {
        defaultId = user.wallet.address;
      } else if (user.email?.address) {
        defaultId = user.email.address;
      } else if (user.id) {
        defaultId = user.id.replace('did:privy:', '');
      }
      setIdentifier(defaultId);
    }
  }, [user, ready]);

  const handleCopy = () => {
    if (identifier) {
      navigator.clipboard.writeText(identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
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

      // 4. Update UI state globally in this component
      await refreshProfile();
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      alert(error.message || "Failed to upload avatar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-[72px] bg-surface border-b border-border flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-10 shadow-sm">
      
      {/* Mobile Hamburger Menu */}
      <button 
        onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))}
        className="md:hidden p-2 -ml-2 text-text-main hover:bg-gray-50 rounded-md transition-colors"
      >
        <Bars3Icon className="w-6 h-6 stroke-2" />
      </button>

      {/* User Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {ready ? (
          <div 
            onClick={identifier ? handleCopy : undefined}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-300 border ${
              identifier 
                ? "bg-secondary text-white hover:bg-slate-800 border-transparent cursor-pointer group shadow-sm" 
                : "bg-red-50 hover:bg-red-100 border-red-200 cursor-help shadow-sm text-red-700"
            }`}
            title={identifier ? "Click to copy identifier" : "Wallet not connected"}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${identifier ? "bg-green-600" : "bg-red-500"}`}></div>
              <span className={`text-xs font-mono font-bold truncate w-full max-w-[100px]`}>
                {identifier ? (identifier.length > 15 ? `${identifier.slice(0, 6)}...${identifier.slice(-4)}` : identifier) : "Not Connected"}
              </span>
            </div>
            <div className="shrink-0 hidden md:block">
              {identifier && (
                copied ? (
                  <CheckIcon className="w-4 h-4 text-green-700" />
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="h-10 w-40 bg-gray-100 rounded-md animate-pulse border border-gray-200"></div>
        )}

        <div className="h-8 w-px bg-border"></div>

        {/* Notifications, Profile and Disconnect */}
        <div className="flex items-center gap-4">
          <NotificationBell />
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
            <div className="p-0.5 rounded-md bg-surface border border-border w-10 h-10 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-sm" />
              ) : identifier ? (
                <Avatar
                  size={34}
                  name={identifier}
                  variant="beam"
                  colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm"></div>
              )}
            </div>
            
            {/* Pencil Overlay */}
            <div className="absolute -bottom-1 -right-1 bg-text-main border border-surface text-white p-0.5 rounded-full shadow-lg group-hover:bg-primary transition-colors">
              <PencilIcon className="w-2.5 h-2.5" />
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-text-muted hover:text-text-main hover:bg-gray-50 border border-transparent hover:border-border px-2 md:px-3 py-2 rounded-md transition-all uppercase"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 stroke-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
