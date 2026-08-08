"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function GetStartedButton({ variant = "gold" }: { variant?: "gold" | "navy" }) {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

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
      className={`${buttonClass} px-6 py-2 rounded-md text-sm font-bold uppercase transition-all transform hover:scale-105`}
    >
      GET STARTED
    </button>
  );
}
