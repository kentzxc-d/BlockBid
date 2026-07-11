"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, ready, authenticated } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      // Don't run check if not authenticated yet
      if (ready && !authenticated) {
        setIsChecking(false);
        return;
      }

      // Wait for user object
      if (ready && authenticated && user) {
        const privyId = user.id;

        try {
          const res = await fetch(`/api/user/profile?id=${privyId}`);

          if (res.status === 404) {
            // No profile found, redirect to onboarding
            router.replace("/onboarding");
          } else {
            // Profile exists!
            setIsChecking(false);
          }
        } catch (error) {
          console.error("Failed to check profile", error);
          setIsChecking(false);
        }
      }
    }

    checkProfile();
  }, [ready, authenticated, user, router, pathname]);

  if (!ready || isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <SparklesIcon className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Setting up your workspace...</h2>
      </div>
    );
  }

  return <>{children}</>;
}
