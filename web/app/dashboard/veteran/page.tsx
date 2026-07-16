"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { ArrowLeftIcon, TrophyIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VeteranPage() {
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> BACK_TO_OVERVIEW
        </button>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-text-main mb-2 flex items-center gap-3 uppercase">
          <TrophyIcon className="w-8 h-8 text-purple-600" />
          [ VETERAN_STATUS ]
        </h1>
        <p className="text-text-muted font-mono text-sm tracking-wide">
          Unlock this badge by completing 10 or more successful transactions on BlockBid.
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm h-[400px]">
        <div className="w-32 h-32 flex items-center justify-center relative mb-4">
          {/* Subtle glow effect behind the badge */}
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
          <Image src="/veteran-badge.png" alt="Veteran Badge" width={128} height={128} className="object-contain drop-shadow-xl relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-purple-900 mb-2 uppercase tracking-tight">Top Performer</h2>
          <p className="text-purple-700/90 font-mono text-xs tracking-widest uppercase max-w-md mx-auto leading-relaxed">
            This badge signifies a high level of trust, reliability, and successful track record within the BlockBid network.
          </p>
        </div>
      </div>
    </div>
  );
}
