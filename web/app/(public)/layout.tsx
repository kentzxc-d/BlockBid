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
            <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={32} height={32} className="object-contain" />
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
