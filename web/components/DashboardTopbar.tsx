"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef } from "react";
import { DocumentDuplicateIcon, ArrowRightOnRectangleIcon, CheckIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, CameraIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function DashboardTopbar() {
  const { user, ready, logout } = usePrivy();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safely extract an identifier for the user
  useEffect(() => {
    async function fetchProfile() {
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

        // Fallback to Google Avatar if available
        const googleAcct = user.linkedAccounts?.find(a => a.type === 'google_oauth') as any;
        if (googleAcct?.pictureUrl) {
          setAvatarUrl(googleAcct.pictureUrl);
        }

        try {
          const res = await fetch(`/api/user/profile?id=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile?.nickname) {
              setNickname(data.profile.nickname);
            }
            if (data.profile?.avatar_url) {
              setAvatarUrl(data.profile.avatar_url);
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      }
    }
    fetchProfile();
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
    
    // MOCK: We would normally upload to Supabase Storage and get a public URL here.
    const fakeUrl = URL.createObjectURL(file);
    setAvatarUrl(fakeUrl);
    
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, avatar_url: fakeUrl }) // Usually the public URL
      });
    } catch (error) {
      console.error("Failed to save avatar", error);
    }
  };

  // Helper for initial
  const initial = nickname ? nickname.charAt(0).toUpperCase() : (identifier ? identifier.charAt(0).toUpperCase() : 'U');

  return (
    <div className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">
      
      {/* User Actions */}
      <div className="flex items-center gap-6">
        
        {/* Wallet / ID Display */}
        {ready ? (
          <div 
            onClick={identifier ? handleCopy : undefined}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-200 border ${
              identifier 
                ? "bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer" 
                : "bg-red-50 hover:bg-red-100 border-red-200 cursor-help group relative"
            }`}
            title={identifier ? "Click to copy" : "Wallet not connected. Your session is active, but a blockchain wallet is missing."}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${identifier ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`}></div>
            <span className={`text-sm font-semibold tracking-tight ${identifier ? "text-gray-700" : "text-red-700"} ${!nickname ? "font-mono" : ""}`}>
              {nickname 
                ? `Welcome back, ${nickname}` 
                : (identifier 
                  ? (identifier.length > 15 ? `${identifier.slice(0, 6)}...${identifier.slice(-4)}` : identifier) 
                  : "Not Connected")}
            </span>
            {identifier && (
              copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
              )
            )}
          </div>
        ) : (
          <div className="h-10 w-40 bg-gray-100 rounded-full animate-pulse border border-gray-200"></div>
        )}

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Profile and Disconnect */}
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarUpload}
          />
          <div 
            className="relative p-0.5 rounded-full bg-blue-50 border-2 border-blue-100 cursor-pointer group w-10 h-10 flex items-center justify-center overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-blue-500 font-bold text-lg">{initial}</span>
            )}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-full transition-all">
              <CameraIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 stroke-2" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
