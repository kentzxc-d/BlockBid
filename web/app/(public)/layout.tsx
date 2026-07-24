import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginButton";

import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      <main>
        {children}
      </main>
    </>
  );
}
