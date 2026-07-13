"use client";

import { useState, useMemo, useEffect } from "react";

import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function ActiveSolicitationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [activeSolicitations, setActiveSolicitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/procurements?filter=open')
      .then(res => res.json())
      .then(data => {
        if (data.projects) {
          setActiveSolicitations(data.projects);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredSolicitations = useMemo(() => {
    return activeSolicitations.filter(solicitation => {
      const matchesSearch = solicitation.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            solicitation.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch; // Ignoring sector filter for now since it's not in our schema
    });
  }, [searchQuery, activeSolicitations]);

  return (
    <div className="py-10 px-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
            [ ACTIVE_SOLICITATIONS ]
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Browse and bid on open item procurements across all sectors.
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted stroke-2" />
            <input 
              type="text" 
              placeholder="SEARCH_LEDGER..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-md border border-border focus:border-text-main outline-none transition-colors text-xs font-mono font-bold tracking-widest w-full md:w-64 placeholder:text-text-muted uppercase"
            />
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-md text-xs font-mono font-bold tracking-widest text-text-main hover:bg-gray-50 transition-colors uppercase">
              <FunnelIcon className="w-4 h-4 stroke-2 text-text-main" />
              {selectedSector === "All" ? "Filter" : selectedSector}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1 overflow-hidden">
              {["All", "Education", "Institution", "Individual"].map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`w-full text-left px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors ${selectedSector === sector ? 'text-primary bg-primary/5' : 'text-text-main'}`}
                >
                  {sector === "All" ? "ALL_SECTORS" : sector}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Solicitations List */}
      <div className="grid gap-4">
        {filteredSolicitations.length === 0 ? (
          <div className="bg-surface rounded-md p-10 border border-border text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-4 border border-border">
              <MagnifyingGlassIcon className="w-6 h-6 text-text-muted" />
            </div>
            <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">No records found</h3>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Query returned zero matching solicitations.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedSector("All"); }}
              className="mt-6 px-6 py-2.5 bg-text-main text-white text-xs font-mono font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase"
            >
              Clear_Filters
            </button>
          </div>
        ) : (
          filteredSolicitations.map((solicitation) => (
            <div key={solicitation.id} className="bg-surface rounded-md p-6 border border-border hover:border-text-main transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-3 border border-border bg-gray-50 rounded-md group-hover:bg-primary/10 transition-colors">
                  <DocumentTextIcon className="w-6 h-6 text-text-main group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">{solicitation.id}</span>
                  </div>
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
                <Link href={`/dashboard/procurements/${solicitation.id}/bid`} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-text-main text-white font-mono text-xs font-bold tracking-widest rounded-md hover:bg-primary transition-colors uppercase w-full sm:w-auto mt-2">
                  SUBMIT_BID <ArrowRightIcon className="w-4 h-4 stroke-2" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
