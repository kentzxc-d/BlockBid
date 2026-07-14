"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const { user, ready } = usePrivy();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      if (!user) {
        router.replace("/");
        return;
      }

      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            const userRole = data.profile.role;
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
        })
        .catch(err => {
          console.error("RoleGuard error:", err);
          router.replace("/dashboard");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [ready, user, router, allowedRoles]);

  if (!ready || loading) {
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
