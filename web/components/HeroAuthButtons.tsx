"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroAuthButtons() {
  const router = useRouter();
  const { authenticated, ready, login } = usePrivy();
  const [targetRoute, setTargetRoute] = useState<string>("/dashboard");

  const handleBrowse = () => {
    if (!ready) return;
    if (authenticated) {
      router.push("/dashboard/acquisitions");
    } else {
      setTargetRoute("/dashboard/acquisitions");
      sessionStorage.setItem('targetRoute', '/dashboard/acquisitions');
      sessionStorage.setItem('loginIntent', 'supplier');
      login();
    }
  };

  const handleSupplier = () => {
    if (!ready) return;
    if (authenticated) {
      router.push("/dashboard");
    } else {
      setTargetRoute("/dashboard");
      sessionStorage.setItem('targetRoute', '/dashboard');
      sessionStorage.setItem('loginIntent', 'supplier');
      login();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-start">
      <button 
        onClick={handleBrowse} 
        className="btn btn-primary w-full md:w-auto" 
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '16px' }}
      >
        Browse Solicitations
      </button>
      <button 
        onClick={handleSupplier} 
        className="btn btn-outline w-full md:w-auto" 
        style={{ borderColor: 'rgba(249,249,246,0.3)', color: 'var(--color-text-inverse)', fontSize: '16px' }}
      >
        Enter Supplier Portal
      </button>
    </div>
  );
}

