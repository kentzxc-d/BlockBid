"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useProfile } from "@/contexts/ProfileContext";

export default function DashboardRedirector() {
  const { user, ready, logout } = usePrivy();
  const { profile, loadingProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (!user) {
        router.replace("/");
        return;
      }

      if (!loadingProfile) {
        if (profile) {
          const role = profile.role;
          const intent = sessionStorage.getItem('loginIntent');

          // Strict separation rules (handled gracefully in login modal, but kept as a fallback here)
          if (intent === 'officer' && (role === 'supplier' || role === 'both')) {
            logout();
            return;
          }

          if (intent === 'supplier' && (role === 'admin' || role === 'requestor')) {
            logout();
            return;
          }

          if (role === "admin") {
            router.replace("/dashboard/admin");
          } else if (role === "requestor") {
            router.replace("/dashboard/agency");
          } else if (role === "supplier" || role === "both") {
            router.replace("/dashboard/supplier");
          } else {
            router.replace("/dashboard/settings");
          }
        } else {
          router.replace("/onboarding");
        }
      }
    }
  }, [ready, user, loadingProfile, profile, router]);

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4 md:py-10 md:px-8 h-screen w-full bg-background">
      <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
        [ AUTHORIZING_WORKSPACE_ACCESS ]
      </div>
    </div>
  );
}
