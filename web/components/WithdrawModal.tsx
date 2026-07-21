"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BanknotesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function WithdrawModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [channelCode, setChannelCode] = useState("PH_GCASH");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-withdraw-modal', handleOpen);
    return () => window.removeEventListener('open-withdraw-modal', handleOpen);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      alert("Minimum withdrawal amount is ₱100");
      return;
    }
    if (!accountNumber) {
      alert("Please enter your account number");
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, this would trigger the viem token burn and then call Xendit Payout
      // For now, we simulate the off-ramp request.
      const response = await fetch('/api/payouts/xendit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(amount),
          channelCode,
          accountNumber 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert("Withdrawal requested successfully! The funds will arrive shortly.");
        setIsOpen(false);
        setAmount("");
        setAccountNumber("");
      } else {
        alert("Withdrawal failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-md shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        

        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-text-main uppercase flex items-center gap-2 tracking-tight">
            <BanknotesIcon className="w-6 h-6 text-text-main" />
            [ Withdraw_Funds ]
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-red-500 transition-colors p-1"
          >
            <XMarkIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase block">
              Withdrawal Amount (PHP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold font-heading text-lg">₱</span>
              <input
                type="number"
                min="100"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full bg-background border border-border text-text-main text-lg font-bold font-mono pl-10 pr-4 py-3 rounded focus:outline-none focus:border-text-main focus:ring-1 focus:ring-text-main transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase block">
              Off-Ramp Channel
            </label>
            <select
              value={channelCode}
              onChange={(e) => setChannelCode(e.target.value)}
              className="w-full bg-background border border-border text-text-main text-sm font-bold font-mono px-4 py-3 rounded focus:outline-none focus:border-text-main transition-all appearance-none uppercase"
            >
              <option value="PH_GCASH">GCash</option>
              <option value="PH_MAYA">Maya</option>
              <option value="PH_BDO">BDO Unibank</option>
              <option value="PH_BPI">BPI</option>
              <option value="PH_UNIONBANK">UnionBank</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase block">
              Account Number / Mobile Number
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="09123456789"
              className="w-full bg-background border border-border text-text-main text-sm font-bold font-mono px-4 py-3 rounded focus:outline-none focus:border-text-main focus:ring-1 focus:ring-text-main transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount || !accountNumber}
            className="w-full flex items-center justify-center gap-2 bg-text-main text-surface hover:bg-text-main/90 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-md mt-2"
          >
            {isLoading ? "PROCESSING_PAYOUT..." : "CONFIRM_WITHDRAWAL"} 
            {!isLoading && <ArrowRightIcon className="w-4 h-4 stroke-2" />}
          </button>
        </form>

      </div>
    </div>
  );
}
