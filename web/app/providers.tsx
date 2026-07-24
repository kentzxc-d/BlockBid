"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { polygonAmoy } from "viem/chains";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#C5A059",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          }
        },
        defaultChain: polygonAmoy,
        supportedChains: [polygonAmoy],
      }}
    >
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </PrivyProvider>
  );
}
