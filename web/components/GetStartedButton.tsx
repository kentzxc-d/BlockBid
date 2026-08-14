"use client";

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function GetStartedButton({ variant = "gold" }: { variant?: "gold" | "navy" }) {
  const { authenticated } = usePrivy();
  const router = useRouter();

  const { login } = useLogin({
    onComplete: () => {
      const target = sessionStorage.getItem('targetRoute') || '/dashboard';
      router.push(target);
    }
  });

  const handleAuth = () => {
    if (authenticated) {
      router.push("/dashboard");
    } else {
      sessionStorage.setItem('targetRoute', '/dashboard');
      sessionStorage.setItem('loginIntent', 'supplier');
      login();
    }
  };

  const buttonClass = variant === "gold" 
    ? "bg-[#FBBF24] text-[#0B132B] hover:text-[#0B132B] hover:bg-[#FCD34D]" 
    : "bg-[#0B132B] text-white hover:text-white hover:bg-slate-800";

  return (
    <button 
      onClick={handleAuth}
      id="nav-cta-btn" 
      className={`${buttonClass} px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold uppercase transition-all transform hover:scale-105`}
    >
      GET STARTED
    </button>
  );
}
