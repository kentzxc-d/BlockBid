"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";

export default function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const { user, ready } = usePrivy();
  const { profile, loadingProfile } = useProfile();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (ready) {
      if (!user) {
        router.replace("/");
        return;
      }

      if (!loadingProfile) {
        if (profile) {
          const userRole = profile.role;
          // 'both' is authorized if the role expects supplier or requestor, but NOT if it strictly expects 'admin'
          if (
            allowedRoles.includes(userRole) || 
            (userRole === 'both' && (allowedRoles.includes('supplier') || allowedRoles.includes('requestor')))
          ) {
            setAuthorized(true);
          } else {
            // Unauthorized! Redirect to the smart redirector to push them to their correct role page
            router.replace("/dashboard");
          }
        } else {
          router.replace("/onboarding");
        }
      }
    }
  }, [ready, user, loadingProfile, profile, router, allowedRoles]);

  if (!ready || loadingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center py-10 px-8 h-screen w-full bg-background">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
          [ VERIFYING_CLEARANCE ]
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
