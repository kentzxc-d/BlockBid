import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";


export const metadata: Metadata = {
  title: "BlockBid | Transparent Government Acquisition",
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

