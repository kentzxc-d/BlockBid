"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import CustomLoginModal from "./CustomLoginModal";

export default function LoginButton({ isLanding = true }: { isLanding?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated, logout, user } = usePrivy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginIntent, setLoginIntent] = useState<'officer' | 'supplier' | null>(null);

  return (
    <>
      {!ready ? (
        <button className="btn btn-outline" disabled>Loading...</button>
      ) : (authenticated && !isModalOpen) ? (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {user?.email?.address || user?.wallet?.address?.slice(0, 6) + "..." + user?.wallet?.address?.slice(-4)}
          </span>
          <button className="btn btn-outline" onClick={logout}>
            Sign Out
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button 
            onClick={() => router.push("/portal")}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: isLanding ? 'var(--color-text-inverse)' : 'var(--color-text-muted)', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            [ Public Portal ]
          </button>
          <button 
            onClick={() => {
              sessionStorage.setItem('loginIntent', 'officer');
              setLoginIntent('officer');
              setIsModalOpen(true);
            }}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: isLanding ? 'var(--color-text-inverse)' : 'var(--color-text-muted)', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            [ Officer Access ]
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              sessionStorage.setItem('loginIntent', 'supplier');
              setLoginIntent('supplier');
              setIsModalOpen(true);
            }}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600, borderRadius: '4px' }}
          >
            Supplier Login
          </button>
        </div>
      )}

      <CustomLoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        intent={loginIntent} 
      />
    </>
  );
}
