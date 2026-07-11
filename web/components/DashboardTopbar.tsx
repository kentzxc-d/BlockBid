"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef } from "react";
import { DocumentDuplicateIcon, ArrowRightOnRectangleIcon, CheckIcon } from "@heroicons/react/24/outline";
import { CameraIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function DashboardTopbar() {
  const { user, ready, logout } = usePrivy();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation state: 'greeting' | 'wallet'
  const [displayMode, setDisplayMode] = useState<'greeting' | 'wallet'>('greeting');

  // Alternating Header Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMode(prev => prev === 'greeting' ? 'wallet' : 'greeting');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        body: JSON.stringify({ id: user.id, avatar_url: fakeUrl }) 
      });
    } catch (error) {
      console.error("Failed to save avatar", error);
    }
  };

  const initial = nickname ? nickname.charAt(0).toUpperCase() : (identifier ? identifier.charAt(0).toUpperCase() : 'U');

  return (
    <div className="h-[72px] bg-surface border-b border-border flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">
      
      {/* User Actions */}
      <div className="flex items-center gap-6">
        
        {/* Alternating Wallet / Greeting Display */}
        {ready ? (
          <div 
            onClick={identifier ? handleCopy : undefined}
            className={`flex items-center justify-between w-48 px-4 py-2 rounded-full transition-all duration-300 border ${
              identifier 
                ? "bg-surface hover:bg-gray-50 border-border cursor-pointer group shadow-sm" 
                : "bg-red-50 hover:bg-red-100 border-red-200 cursor-help shadow-sm"
            }`}
            title={identifier ? "Click to copy identifier" : "Wallet not connected"}
          >
            <div className="flex items-center gap-3 overflow-hidden relative w-full h-5">
              <div className={`absolute inset-0 flex items-center transition-all duration-500 transform ${displayMode === 'greeting' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <span className="text-sm font-heading font-bold text-text-main truncate">
                  Welcome, {nickname || 'User'}
                </span>
              </div>
              <div className={`absolute inset-0 flex items-center gap-2 transition-all duration-500 transform ${displayMode === 'wallet' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${identifier ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={`text-xs font-mono font-medium truncate ${identifier ? "text-text-muted" : "text-red-700"}`}>
                  {identifier ? (identifier.length > 12 ? `${identifier.slice(0, 6)}...${identifier.slice(-4)}` : identifier) : "Not Connected"}
                </span>
              </div>
            </div>
            {identifier && (
              <div className="shrink-0 ml-2">
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4 text-border group-hover:text-text-muted transition-colors" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-10 w-48 bg-gray-100 rounded-full animate-pulse border border-gray-200"></div>
        )}

        <div className="h-8 w-px bg-border"></div>

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
            className="relative p-0.5 rounded-none bg-surface border border-border cursor-pointer group w-10 h-10 flex items-center justify-center overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-heading font-bold text-lg">{initial}</span>
            )}
            <div className="absolute inset-0 bg-secondary/80 hidden group-hover:flex items-center justify-center transition-all">
              <CameraIcon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-text-muted hover:text-text-main hover:bg-gray-50 border border-transparent hover:border-border px-3 py-2 rounded-none transition-all uppercase"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 stroke-2" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
