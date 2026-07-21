"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { XMarkIcon, CurrencyDollarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function TopUpModal() {
  const { user } = usePrivy();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-topup-modal', handleOpen);
    return () => window.removeEventListener('open-topup-modal', handleOpen);
  }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      alert("Minimum top-up amount is ₱100");
      return;
    }
    
    setIsLoading(true);
    try {
      // Get the user's embedded wallet address if available, otherwise use their user ID
      const userAddress = user?.wallet?.address || user?.id;

      // We call the API route to generate the Xendit Invoice
      const response = await fetch('/api/checkout/xendit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(amount),
          userAddress: userAddress
        })
      });
      
      const data = await response.json();
      if (data.url) {
        // Redirect to Xendit payment link
        window.location.href = data.url;
      } else {
        alert("Failed to create payment link: " + (data.error || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-md shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        

        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-text-main uppercase flex items-center gap-2 tracking-tight">
            <CurrencyDollarIcon className="w-6 h-6 text-primary" />
            [ Escrow_Top_Up ]
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-red-500 transition-colors p-1"
          >
            <XMarkIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>

        <form onSubmit={handleTopUp} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase block">
              Amount (PHP)
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
                className="w-full bg-background border border-border text-text-main text-lg font-bold font-mono pl-10 pr-4 py-3 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
              * Funds will be converted 1:1 to BlockBidTokens in your embedded wallet.
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest text-text-main">
              <span>Subtotal:</span>
              <span>₱ {amount ? Number(amount).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest text-text-muted">
              <span>Platform Fee (0%):</span>
              <span>₱ 0.00</span>
            </div>
            <div className="w-full h-px bg-primary/20 my-1" />
            <div className="flex items-center justify-between text-sm font-mono font-bold uppercase tracking-widest text-primary">
              <span>Total to Pay:</span>
              <span>₱ {amount ? Number(amount).toFixed(2) : "0.00"}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full flex items-center justify-center gap-2 bg-primary text-background hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-md"
          >
            {isLoading ? "PROCESSING_LINK..." : "PROCEED_TO_XENDIT_CHECKOUT"} 
            {!isLoading && <ArrowRightIcon className="w-4 h-4 stroke-2" />}
          </button>
        </form>

      </div>
    </div>
  );
}
