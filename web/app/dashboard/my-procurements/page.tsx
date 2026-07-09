"use client";

import Link from "next/link";
import { 
  PlusCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";

// Mock Data for "My Procurements" (Requests the user has created)
const MY_PROCUREMENTS = [
  {
    id: "REQ-2026-081",
    title: "100 Laptops for New Department",
    createdAt: "Oct 24, 2026",
    status: "Open for Bids",
    bidsCount: 4,
    statusColor: "text-blue-600 bg-blue-50 border-blue-200",
    icon: ClockIcon
  },
  {
    id: "REQ-2026-055",
    title: "Office Furniture (Ergonomic Chairs)",
    createdAt: "Sep 15, 2026",
    status: "Evaluating",
    bidsCount: 12,
    statusColor: "text-amber-600 bg-amber-50 border-amber-200",
    icon: FolderOpenIcon
  },
  {
    id: "REQ-2026-012",
    title: "Marketing Campaign Video Production",
    createdAt: "Aug 02, 2026",
    status: "Awarded",
    bidsCount: 7,
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckBadgeIcon
  }
];

export default function MyProcurementsPage() {
  return (
    <div className="py-10 px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2 font-heading tracking-tight">
            My Procurements
          </h1>
          <p className="text-text-muted text-sm md:text-base">
            Track the status of the solicitations you have posted and review incoming bids.
          </p>
        </div>
        
        {/* Create New CTA */}
        <Link 
          href="/dashboard/requestor/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary-hover rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <PlusCircleIcon className="w-5 h-5 stroke-2" />
          Create Request
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 mb-1">Total Requests</span>
          <span className="text-3xl font-black text-text-main">3</span>
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 mb-1">Total Bids Received</span>
          <span className="text-3xl font-black text-primary">23</span>
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col">
          <span className="text-sm font-semibold text-slate-500 mb-1">Successfully Awarded</span>
          <span className="text-3xl font-black text-secondary">1</span>
        </div>
      </div>

      {/* List of Procurements */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Recent Solicitations</h3>
        </div>
        
        <div className="divide-y divide-border">
          {MY_PROCUREMENTS.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">You haven't created any procurement requests yet.</p>
            </div>
          ) : (
            MY_PROCUREMENTS.map((req) => (
              <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{req.id}</span>
                    <span className="text-xs font-medium text-slate-400">Created {req.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-text-main text-lg mb-2">
                    {req.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${req.statusColor}`}>
                      <req.icon className="w-3.5 h-3.5 stroke-2" />
                      {req.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {req.bidsCount} Bids Received
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-3">
                  <Link 
                    href={`/dashboard/procurements/${req.id}/evaluate`} // Example future route
                    className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors text-center shadow-sm whitespace-nowrap"
                  >
                    View Bids
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
