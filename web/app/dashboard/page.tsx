"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function DashboardRedirector() {
  const { user, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (!user) {
        router.replace("/");
        return;
      }

      // Fetch user profile to determine their role
      fetch(`/api/user/profile?id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            const role = data.profile.role;
            if (role === "admin") {
              router.replace("/dashboard/admin");
            } else if (role === "requestor") {
              router.replace("/dashboard/agency");
            } else if (role === "supplier" || role === "both") {
              router.replace("/dashboard/supplier");
            } else {
              // Invalid, missing, or legacy role. Force them to settings to update it.
              router.replace("/dashboard/settings");
            }
          } else {
            // No profile found
            router.replace("/onboarding");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch profile for redirection", err);
          router.replace("/dashboard/supplier");
        });
    }
  }, [ready, user, router]);

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4 md:py-10 md:px-8 h-screen w-full bg-background">
      <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
        [ AUTHORIZING_WORKSPACE_ACCESS ]
      </div>
    </div>
  );
}
