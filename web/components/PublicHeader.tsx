"use client";

import Link from "next/link";
import Image from "next/image";
import LoginButton from "./LoginButton";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const headerStyle = isLanding 
    ? { position: 'absolute' as const, width: '100%', top: 0, zIndex: 100, backgroundColor: 'transparent', padding: '12px 0' }
    : { position: 'relative' as const, width: '100%', zIndex: 100, backgroundColor: 'var(--color-surface)', padding: '12px 0', borderBottom: '1px solid var(--color-border)' };

  const bidColor = isLanding ? '#ffffff' : 'var(--color-secondary)';

  return (
    <header style={headerStyle}>
      <div className="container header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="logo flex items-center gap-2">
          <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={40} height={40} className="object-contain" />
          <div>
            <span style={{ color: 'var(--color-primary)' }}>BLOCK</span>
            <span style={{ color: bidColor }}>BID</span>
          </div>
        </Link>

        <nav className="nav-links">
          <LoginButton isLanding={isLanding} />
        </nav>
      </div>
    </header>
  );
}
