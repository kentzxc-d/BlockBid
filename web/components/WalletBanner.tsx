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
    <div className="mb-8 mt-2">
      {/* GREETING (ABOVE CARD) */}
      <div className="mb-4">
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight flex flex-wrap items-center gap-2 mb-1.5">
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
      </div>

      {/* WALLET CARD */}
      <div className="bg-surface relative overflow-hidden border border-border rounded-md p-6 shadow-sm">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-primary/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
          
          {/* LEFT: WALLET BALANCE & BUTTONS */}
          <div>
            <div className="text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-2">
              Wallet Balance
            </div>
            <div className="text-5xl font-heading font-black text-text-main mb-5 tracking-tighter">
              <span className="text-primary/70 mr-2 text-4xl font-bold">₱</span>{balance}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.dispatchEvent(new Event('open-topup-modal'))}
                className="flex items-center gap-1.5 px-6 py-2 bg-primary text-background hover:bg-primary-hover transition-colors rounded-sm font-mono text-xs font-bold tracking-widest uppercase shadow-sm"
              >
                <ArrowDownIcon className="w-3.5 h-3.5" /> Top-Up
              </button>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-withdraw-modal'))}
                className="flex items-center gap-1.5 px-6 py-2 bg-transparent border border-border text-text-main hover:bg-surface transition-colors rounded-sm font-mono text-xs font-bold tracking-widest uppercase shadow-sm"
              >
                <ArrowUpIcon className="w-3.5 h-3.5" /> Withdraw
              </button>
            </div>
          </div>

          {/* RIGHT: NETWORK STATUS */}
          <div className="flex flex-col items-end space-y-2 relative">
            <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-1 flex items-center gap-1.5 w-[200px] px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Network Status
            </div>
            <div className="flex items-center justify-between w-[200px] bg-background/50 border border-border px-3 py-1.5 rounded-sm">
              <span className="text-[10px] font-mono font-bold text-primary/70">BLOCK_HEIGHT</span>
              <span className="text-xs font-mono text-text-main font-bold">#{blockHeight.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between w-[200px] bg-background/50 border border-border px-3 py-1.5 rounded-sm">
              <span className="text-[10px] font-mono font-bold text-primary/70">LOCAL_TIME</span>
              <span className="text-xs font-mono text-text-main font-bold">{currentTime || "--:--:--"}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
