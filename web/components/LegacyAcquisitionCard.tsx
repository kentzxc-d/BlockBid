import Link from "next/link";
import { DocumentTextIcon, AcademicCapIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface LegacyAcquisitionCardProps {
  solicitation: any;
  user?: { id: string };
  allMyBidProjectIds?: string[];
}

export default function LegacyAcquisitionCard({ 
  solicitation, 
  user, 
  allMyBidProjectIds = [] 
}: LegacyAcquisitionCardProps) {
  const isRequestor = user && solicitation.requestor_id === user.id;
  const hasBid = allMyBidProjectIds.includes(solicitation.id);
  const daysLeft = Math.max(0, Math.ceil((new Date(solicitation.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

  return (
    <div className="bg-surface rounded-md p-6 border border-border hover:border-text-main transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="flex items-start gap-5">
        <div className="p-3 border border-border bg-gray-50 rounded-md group-hover:bg-primary/10 transition-colors">
          <DocumentTextIcon className="w-6 h-6 text-text-main group-hover:text-primary transition-colors" />
        </div>
        <div>
          <h3 className="font-bold text-text-main text-lg font-heading group-hover:text-primary transition-colors tracking-tight">
            {solicitation.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <AcademicCapIcon className="w-3.5 h-3.5" />
              General
            </span>
            <span className="flex items-center gap-1.5">
              • DEADLINE: {new Date(solicitation.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-5 sm:pt-0 border-border">
        <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-widest">
          T-{daysLeft} DAYS
        </p>
        {isRequestor ? (
          <span className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-background border border-border text-text-muted font-mono text-xs font-bold tracking-widest rounded-md uppercase cursor-not-allowed w-full sm:w-auto">
            YOUR_ACQUISITION
          </span>
        ) : hasBid ? (
          <span className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-background border border-border text-text-muted font-mono text-xs font-bold tracking-widest rounded-md uppercase cursor-not-allowed w-full sm:w-auto">
            ALREADY_BID
          </span>
        ) : (
          <Link href={`/dashboard/acquisitions/${solicitation.id}/bid`} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-text-main text-white font-mono text-xs font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase w-full sm:w-auto">
            SUBMIT_BID <ArrowRightIcon className="w-4 h-4 stroke-2" />
          </Link>
        )}
      </div>
    </div>
  );
}
