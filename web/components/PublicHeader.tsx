"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GetStartedButton from "./GetStartedButton";

export default function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/brand/56c94a00-09c1-4de7-9ad9-b1855552e0a9/assets/487fd5ae-53ad-44f8-9459-afa4773fbe93.png" alt="BlockBid Logo" className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-105 transition-transform" />
            <span className="text-xl md:text-2xl font-black text-[#0B132B] tracking-tight font-outfit">BLOCK<span className="text-[#FBBF24]">BID</span></span>
          </Link>
        </div>

        {/* Center: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
            <Link href="/#features" className="mono-label text-slate-500 hover:text-[#0B132B] transition-colors">[ TECH ]</Link>
            <Link href="/#workflow" className="mono-label text-slate-500 hover:text-[#0B132B] transition-colors">[ WORKFLOWS ]</Link>
            <Link href="/portal" className={`mono-label font-bold transition-colors ${pathname === '/portal' ? 'text-[#FBBF24]' : 'text-slate-500 hover:text-[#0B132B]'}`}>[ PUBLIC PORTAL ]</Link>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-6 z-10">
          <GetStartedButton variant="navy" />
        </div>
      </nav>
    </header>
  );
}
