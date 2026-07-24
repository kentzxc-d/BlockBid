"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { activeChain } from "@/utils/network";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "dark",
          accentColor: "#C5A059",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          }
        },
        defaultChain: activeChain,
        supportedChains: [activeChain],
      }}
    >
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </PrivyProvider>
  );
}
