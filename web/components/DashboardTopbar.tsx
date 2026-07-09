"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { DocumentDuplicateIcon, ArrowRightOnRectangleIcon, CheckIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function DashboardTopbar() {
  const { user, ready, logout } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);

  // Safely extract an identifier for the user
  useEffect(() => {
    if (ready && user) {
      if (user.wallet?.address) {
        setIdentifier(user.wallet.address);
      } else if (user.email?.address) {
        setIdentifier(user.email.address);
      } else if (user.id) {
        setIdentifier(user.id.replace('did:privy:', ''));
      }
    }
  }, [user, ready]);

  const handleCopy = () => {
    if (identifier) {
      navigator.clipboard.writeText(identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <span className={`text-sm font-semibold font-mono tracking-tight ${identifier ? "text-gray-700" : "text-red-700"}`}>
              {identifier 
                ? (identifier.length > 15 ? `${identifier.slice(0, 6)}...${identifier.slice(-4)}` : identifier) 
                : "Not Connected"}
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
          <div className="p-1 rounded-full bg-blue-50 border border-blue-100">
            <UserCircleIcon className="w-8 h-8 text-blue-500" />
          </div>
          <button 
            onClick={logout}
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
