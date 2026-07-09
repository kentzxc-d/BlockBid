"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { DocumentDuplicateIcon, ArrowRightOnRectangleIcon, CheckIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function DashboardTopbar() {
  const { user, ready, logout } = usePrivy();
  const [copied, setCopied] = useState(false);

  const walletAddress = user?.wallet?.address;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Network Indicator (Left Side of Topbar) */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
        </span>
        <span className="text-xs font-bold text-text-muted tracking-widest uppercase">
          Base Sepolia Testnet
        </span>
      </div>

      {/* User Actions (Right Side) */}
      <div className="flex items-center gap-4">
        
        {/* Wallet Address Display */}
        {ready && walletAddress ? (
          <div 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-50 border border-border px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            title="Click to copy full address"
          >
            <span className="text-sm font-medium text-text-main font-mono">
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
            {copied ? (
              <CheckIcon className="w-4 h-4 text-secondary" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4 text-text-muted" />
            )}
          </div>
        ) : (
          <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse border border-border"></div>
        )}

        <div className="h-6 w-px bg-border"></div>

        {/* Profile Picture */}
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-8 h-8 text-gray-300" />
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={logout}
          className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors ml-2"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Disconnect
        </button>

      </div>
    </div>
  );
}
