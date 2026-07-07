"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

export default function LoginButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

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
    <button className="btn btn-primary" onClick={login}>
      Log In / Sign Up
    </button>
  );
}
