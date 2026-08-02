"use client";

import React, { useState, useMemo } from 'react';
import AcquisitionCard from "@/components/AcquisitionCard";
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function PortalClient({ acquisitions }: { acquisitions: any[] }) {
  const [activeTab, setActiveTab] = useState<"awarded" | "closed">("awarded");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAcquisitions = useMemo(() => {
    return acquisitions.filter((item) => {
      // Tab filter
      if (activeTab === "awarded" && item.status !== "awarded") return false;
      if (activeTab === "closed" && item.status !== "closed") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesHash = item.on_chain_hash?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesHash) return false;
      }

      return true;
    });
  }, [acquisitions, activeTab, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black tracking-tighter uppercase mb-2 text-text-main">
          Public Transparency Portal
        </h1>
        <p className="text-sm font-mono font-bold tracking-widest uppercase text-text-muted">
          Blockchain-verified government acquisitions
        </p>
      </div>

      {/* Tabs and Search Bar */}
      <div className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex border-b border-border w-full md:w-auto">
          <button
            onClick={() => setActiveTab("awarded")}
            className={`pb-3 px-4 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "awarded"
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Awarded
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`pb-3 px-4 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "closed"
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted stroke-2" />
          <input
            type="text"
            placeholder="Search title or contract hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border focus:outline-none focus:border-primary font-mono text-xs text-text-main placeholder-text-muted transition-colors rounded-none"
          />
        </div>
      </div>

      {filteredAcquisitions.length === 0 ? (
        <div className="p-12 border border-dashed border-border flex flex-col items-center justify-center text-center">
          <p className="text-sm font-mono font-bold tracking-widest text-text-muted uppercase">
            No {activeTab} acquisitions found.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAcquisitions.map((item) => {
            const actionButton = item.on_chain_hash ? (
              <div className="flex w-full justify-between items-center text-xs font-mono font-bold uppercase tracking-widest">
                <span className="text-text-muted">Verification</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${item.on_chain_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline bg-primary/10 px-4 py-2"
                >
                  <span>View on Polygon</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="flex w-full justify-between items-center text-xs font-mono font-bold uppercase tracking-widest">
                <span className="text-text-muted">Verification</span>
                <span className="text-text-muted px-4 py-2 border border-dashed border-border">Syncing to Blockchain...</span>
              </div>
            );

            return (
              <AcquisitionCard
                key={item.id}
                title={item.title}
                description={`Public record of ${item.status} contract.`}
                status={item.status.toUpperCase()}
                location={item.location || "Various"}
                estBudget={item.budget || item.total_price}
                closingDate={`${item.status === 'awarded' ? 'Awarded' : 'Completed'}: ${item.awarded_at ? new Date(item.awarded_at).toLocaleDateString() : 'N/A'}`}
                contractHash={item.on_chain_hash || "Pending..."}
                actionButton={actionButton}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
