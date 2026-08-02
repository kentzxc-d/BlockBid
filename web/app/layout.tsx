import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";


export const metadata: Metadata = {
  title: "BlockBid",
  description: "Secure, bias-free, and transparent government bidding platform powered by Base Sepolia and AI.",
  icons: {
    icon: "/logo-gold-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

