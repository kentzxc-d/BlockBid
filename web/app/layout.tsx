import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BlockBid | Transparent Government Procurement",
  description: "Secure, bias-free, and transparent government bidding platform powered by Base Sepolia and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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
              <Link href="/projects" className="nav-item">Projects</Link>
              <Link href="/bids" className="nav-item">My Bids</Link>
              <button className="btn btn-primary">Connect Wallet</button>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
