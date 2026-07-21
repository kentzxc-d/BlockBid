"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProfile } from "@/contexts/ProfileContext";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

export default function WalletBanner() {
  const { ready, user } = usePrivy();
  const { profile } = useProfile();
  
  const [greeting, setGreeting] = useState("WELCOME BACK");
  const [currentTime, setCurrentTime] = useState("");
  const [blockHeight, setBlockHeight] = useState(18239012);
  const [balance, setBalance] = useState("0.00"); // Mocked for now until viem reading is implemented

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING");
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const blockInterval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 12000);
    
    return () => {
      clearInterval(interval);
      clearInterval(blockInterval);
    };
  }, []);

  if (!ready) return null;

  const userTypeLabel = profile?.role === 'requestor' ? 'AGENCY' : 'SUPPLIER';
  const displayName = profile?.nickname || userTypeLabel;

  return (
    <div className="mb-8 mt-2 bg-surface relative overflow-hidden border border-border rounded-md p-6 shadow-sm">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-primary/30 to-transparent" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* LEFT: GREETING & BADGES */}
        <div className="flex-1">
          <h2 className="text-2xl font-heading font-bold uppercase tracking-tight flex items-center gap-2 mb-1.5">
            <span className="text-primary/70">[</span> 
            <span className="text-text-main">{greeting},</span>
            <span className="text-primary">{displayName}</span> 
            <span className="text-primary/70">]</span>
            {profile?.verification_status === 'verified' && (
              <Link href="/dashboard/verify" className="relative group ml-2 flex items-center justify-center cursor-pointer flex-shrink-0">
                <Image src="/verified-badge.png" alt="Verified User" width={28} height={28} className="drop-shadow-sm group-hover:scale-105 transition-transform" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-green-500/10 border border-green-500 text-green-600 font-mono text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                  [ Verified ]
                </div>
              </Link>
            )}
          </h2>
          <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase tracking-widest">
            <span>Role: {userTypeLabel}</span>
            <span className="opacity-30">|</span>
            <span className="text-emerald-500">System Ready</span>
          </div>
        </div>

        {/* MIDDLE: WALLET ESCROW BALANCE & BUTTONS */}
        <div className="flex-1 flex flex-col items-center justify-center border-y md:border-y-0 md:border-l md:border-r border-border/50 py-4 md:py-0 px-6">
          <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-1">
            Escrow Balance
          </div>
          <div className="text-3xl font-heading font-bold text-text-main mb-3">
            <span className="text-primary/70 mr-1">₱</span>{balance}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-topup-modal'))}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-background hover:bg-primary-hover transition-colors rounded font-mono text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              <ArrowDownIcon className="w-3.5 h-3.5" /> Top-Up
            </button>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-withdraw-modal'))}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-surface border border-border text-text-main hover:bg-gray-50 transition-colors rounded font-mono text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              <ArrowUpIcon className="w-3.5 h-3.5" /> Withdraw
            </button>
          </div>
        </div>

        {/* RIGHT: NETWORK STATUS */}
        <div className="flex-1 flex flex-col items-end space-y-1.5 relative">
          <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-0.5">
            Network Status
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-primary/70">BLOCK_HEIGHT:</span>
            <span className="text-xs font-mono text-text-main font-bold">#{blockHeight.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-primary/70">LOCAL_TIME:</span>
            <span className="text-xs font-mono text-text-main font-bold w-[60px] text-right">{currentTime || "--:--:--"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
