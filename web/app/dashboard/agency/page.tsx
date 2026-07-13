"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import RoleGuard from "@/components/RoleGuard";

export default function AgencyDashboard() {
  const { ready, user } = usePrivy();

  if (!ready || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-10 px-8">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">[ INITIALIZING_AGENCY_WORKSPACE ]</div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["requestor"]}>
      <div className="py-10 px-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">[ PROCURING_AGENT_WORKSPACE ]</h1>
          <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase">Procurement_&_Evaluation_Hub</p>
        </div>

        <div className="bg-surface rounded-none p-8 border border-border hover:border-text-main transition-colors text-center py-20">
          <h2 className="text-xl font-bold text-text-main font-heading tracking-tight uppercase mb-4">No Active Projects</h2>
          <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase mb-8">You have not posted any procurements yet.</p>
          
          <Link 
            href="/dashboard/agency/new"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-background hover:bg-primary-hover font-mono text-sm font-bold uppercase tracking-widest transition-colors rounded-none shadow-md shadow-primary/20 border border-primary hover:-translate-y-0.5"
          >
            [ POST_NEW_PROCUREMENT ] <ArrowRightIcon className="w-5 h-5 stroke-2" />
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
