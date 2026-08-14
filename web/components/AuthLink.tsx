"use client";

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import React from "react";

export default function AuthLink({ 
  intent, 
  target, 
  children, 
  className,
  id 
}: { 
  intent: "supplier" | "officer"; 
  target: string; 
  children: React.ReactNode; 
  className?: string;
  id?: string;
}) {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      const storedTarget = sessionStorage.getItem('targetRoute') || target;
      router.push(storedTarget);
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!ready) return;
    if (authenticated) {
      router.push(target);
    } else {
      sessionStorage.setItem('targetRoute', target);
      sessionStorage.setItem('loginIntent', intent);
      login();
    }
  };

  return (
    <a href={target} id={id} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
