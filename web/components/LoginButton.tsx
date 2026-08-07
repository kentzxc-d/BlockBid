"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import InvalidAccessModal from "./InvalidAccessModal";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function LoginButton({ isLanding = true }: { isLanding?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated, logout, user } = usePrivy();
  
  const [invalidAccessMessage, setInvalidAccessMessage] = useState('');
  const [isInvalidModalOpen, setIsInvalidModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { login } = useLogin({
    onComplete: async ({ user }) => {
      const intent = sessionStorage.getItem('loginIntent');
      try {
        const res = await fetch(`/api/user/profile?id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const role = data.profile.role;
            if (intent === 'officer' && (role === 'supplier' || role === 'both')) {
              setInvalidAccessMessage("Your account does not have the required permissions for this area.");
              setIsInvalidModalOpen(true);
              logout();
              return;
            }
            if (intent === 'supplier' && (role === 'admin' || role === 'requestor')) {
              setInvalidAccessMessage("Your account does not have the required permissions for this area.");
              setIsInvalidModalOpen(true);
              logout();
              return;
            }
          }
        }
      } catch(err) {
        console.error("Profile check failed", err);
      }
      
      const target = sessionStorage.getItem('targetRoute') || '/dashboard';
      sessionStorage.removeItem('targetRoute');
      router.push(target);
    }
  });

  return (
    <>
      {!ready ? (
        <button className="btn btn-outline" disabled>Loading...</button>
      ) : authenticated ? (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: isLanding ? 'var(--color-text-inverse-muted)' : 'var(--color-text-muted)' }}>
            {user?.email?.address || user?.wallet?.address?.slice(0, 6) + "..." + user?.wallet?.address?.slice(-4)}
          </span>
          <button 
            className="btn btn-outline transition-all hover:-translate-y-0.5 active:scale-95" 
            onClick={logout}
            style={{ 
              color: isLanding ? 'var(--color-text-inverse)' : 'var(--color-text-main)', 
              borderColor: isLanding ? 'rgba(249,249,246,0.3)' : 'var(--color-border)' 
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:flex gap-6 items-center">
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
                sessionStorage.setItem('targetRoute', '/dashboard');
                login();
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
                sessionStorage.setItem('targetRoute', '/dashboard');
                login();
              }}
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600, borderRadius: '4px' }}
            >
              Supplier Login
            </button>
          </div>

          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`p-2 rounded-md transition-colors ${isLanding ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'}`}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 stroke-2" />
              ) : (
                <Bars3Icon className="w-6 h-6 stroke-2" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className={`absolute top-[72px] left-0 w-full p-6 flex flex-col gap-6 shadow-xl border-t z-50 ${isLanding ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => { setMobileMenuOpen(false); router.push("/portal"); }}
                className={`text-left font-mono text-sm tracking-wider uppercase transition-all hover:-translate-y-0.5 hover:opacity-80 active:scale-[0.98] ${isLanding ? 'text-white' : 'text-slate-600'}`}
              >
                [ Public Portal ]
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  sessionStorage.setItem('loginIntent', 'officer');
                  sessionStorage.setItem('targetRoute', '/dashboard');
                  login();
                }}
                className={`text-left font-mono text-sm tracking-wider uppercase transition-all hover:-translate-y-0.5 hover:opacity-80 active:scale-[0.98] ${isLanding ? 'text-white' : 'text-slate-600'}`}
              >
                [ Officer Access ]
              </button>
              <button 
                className="btn btn-primary w-full py-3 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  sessionStorage.setItem('loginIntent', 'supplier');
                  sessionStorage.setItem('targetRoute', '/dashboard');
                  login();
                }}
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', fontWeight: 600 }}
              >
                Supplier Login
              </button>
            </div>
          )}
        </>
      )}

      <InvalidAccessModal 
        isOpen={isInvalidModalOpen} 
        onClose={() => setIsInvalidModalOpen(false)} 
        message={invalidAccessMessage} 
      />
    </>
  );
}
