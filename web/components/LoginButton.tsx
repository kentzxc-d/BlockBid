"use client";

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function LoginButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated, logout, user } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      // If logging in from the landing page, go to dashboard
      if (ready && authenticated) {
        router.push("/dashboard");
      }
    }
  });

  if (!ready) {
    return <button className="btn btn-outline" disabled>Loading...</button>;
  }

  if (authenticated) {
    return (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          {user?.email?.address || user?.wallet?.address?.slice(0, 6) + "..." + user?.wallet?.address?.slice(-4)}
        </span>
        <button className="btn btn-outline" onClick={logout}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <button 
        onClick={login}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--color-text-muted)', 
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
        onClick={login}
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600, borderRadius: '4px' }}
      >
        Supplier Portal
      </button>
    </div>
  );
}
