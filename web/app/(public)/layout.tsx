import Link from "next/link";
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
          <Link href="/" className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            BlockBid
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
