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
          <Link href="/" className="flex items-center gap-2.5 group">
            <div 
              className="w-8 h-8 md:w-9 md:h-9 bg-[#FBBF24] transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
              style={{
                maskImage: 'url(/logo-gold-transparent.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/logo-gold-transparent.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center'
              }}
              aria-label="BlockBid Logo"
              role="img"
            ></div>
            <span className="text-[1.5rem] md:text-[1.75rem] font-black text-[#0B132B] tracking-tight font-outfit leading-none mt-1">BLOCK<span className="text-[#FBBF24]">BID</span></span>
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
