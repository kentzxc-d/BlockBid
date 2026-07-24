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
      <header className="app-header">
        <div className="container header-container">
          <Link href="/" className="logo flex items-center gap-2">
            <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={40} height={40} className="object-contain" />
            <div>
              <span style={{ color: 'var(--color-primary)' }}>BLOCK</span>
              <span style={{ color: 'var(--color-secondary)' }}>BID</span>
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
