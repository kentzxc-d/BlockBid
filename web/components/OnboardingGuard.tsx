"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useProfile } from "@/contexts/ProfileContext";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { profile, loadingProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated && !loadingProfile && !profile) {
      // Authenticated but no profile found, redirect to onboarding
      router.replace("/onboarding");
    }
  }, [ready, authenticated, loadingProfile, profile, router]);

  if (!ready || (authenticated && loadingProfile)) {
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

  // If authenticated but no profile, we are redirecting to onboarding
  if (authenticated && !profile) {
    return null; 
  }

  return <>{children}</>;
}
