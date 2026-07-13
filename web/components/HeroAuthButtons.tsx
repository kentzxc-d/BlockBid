"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroAuthButtons() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const [targetRoute, setTargetRoute] = useState<string>("/dashboard");

  const { login } = useLogin({
    onComplete: () => {
      router.push(targetRoute);
    }
  });

  const handleBrowse = () => {
    if (!ready) return;
    if (authenticated) {
      router.push("/dashboard/procurements");
    } else {
      setTargetRoute("/dashboard/procurements");
      login();
    }
  };

  const handleSupplier = () => {
    if (!ready) return;
    if (authenticated) {
      router.push("/dashboard");
    } else {
      setTargetRoute("/dashboard");
      login();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
      <button 
        onClick={handleBrowse} 
        className="btn btn-primary" 
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '16px' }}
      >
        Browse Solicitations
      </button>
      <button 
        onClick={handleSupplier} 
        className="btn btn-outline" 
        style={{ borderColor: 'rgba(249,249,246,0.3)', color: 'var(--color-text-inverse)', fontSize: '16px' }}
      >
        Enter Supplier Portal
      </button>
    </div>
  );
}
