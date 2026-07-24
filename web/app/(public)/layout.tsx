import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginButton";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header style={{ position: 'absolute', width: '100%', top: 0, zIndex: 100, backgroundColor: 'transparent', padding: '12px 0' }}>
        <div className="container header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo flex items-center gap-2">
            <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={40} height={40} className="object-contain" />
            <div>
              <span style={{ color: 'var(--color-primary)' }}>BLOCK</span>
              <span style={{ color: '#ffffff' }}>BID</span>
            </div>
          </Link>

          <nav className="nav-links">
            <LoginButton />
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </>
  );
}
