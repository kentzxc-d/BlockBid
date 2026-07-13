"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  FolderOpenIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

export default function DashboardSidebar() {
  const [role, setRole] = useState("both"); // default to handle legacy safely
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = usePrivy();
  
  const [nickname, setNickname] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  // For hybrid users, this toggle lets them flip their sidebar between agency/supplier mode.
  // Defaults to whatever role they have, or 'supplier' if they are 'both'.
  const [activeMode, setActiveMode] = useState<"supplier" | "agency">("supplier");

  useEffect(() => {
    if (ready && user) {
      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setNickname(data.profile.nickname);
            setRole(data.profile.role);
            if (data.profile.role === "requestor") {
              setActiveMode("agency");
            } else {
              setActiveMode("supplier");
            }
          }
        })
        .catch(console.error);
    }
  }, [user, ready]);

  const handlePostProcurementClick = (e: React.MouseEvent) => {
    if (role === "supplier") {
      e.preventDefault();
      setUpgradeMessage("Want to post procurement projects? Upgrade your network role to Dual/Hybrid in Settings.");
      setUpgradeModalOpen(true);
    }
  };

  const handleSubmitBidsClick = (e: React.MouseEvent) => {
    if (role === "requestor") {
      e.preventDefault();
      setUpgradeMessage("Want to submit bids? Upgrade your network role to Dual/Hybrid in Settings.");
      setUpgradeModalOpen(true);
    }
  };

  // Base items everyone sees
  const navItems: { name: string; href: string; icon: React.ElementType; onClick?: React.MouseEventHandler<HTMLAnchorElement> }[] = [
    { name: "Active Solicitations", href: "/dashboard/procurements", icon: DocumentTextIcon },
  ];

  // If in supplier mode
  if (activeMode === "supplier") {
    navItems.unshift({ name: "Overview", href: "/dashboard/supplier", icon: HomeIcon, onClick: undefined });
    navItems.push({ name: "My Bids", href: "/dashboard/my-bids", icon: ClipboardDocumentCheckIcon, onClick: undefined });
    
    // Add the upsell for pure suppliers
    if (role === "supplier") {
      navItems.push({ name: "My Procurements", href: "#", icon: FolderOpenIcon, onClick: handlePostProcurementClick });
    }
  }

  // If in agency mode
  if (activeMode === "agency") {
    navItems.unshift({ name: "Overview", href: "/dashboard/agency", icon: HomeIcon, onClick: undefined });
    navItems.push({ name: "My Procurements", href: "/dashboard/my-procurements", icon: FolderOpenIcon, onClick: undefined });
    
    // Add the upsell for pure requestors
    if (role === "requestor") {
      navItems.push({ name: "My Bids", href: "#", icon: ClipboardDocumentCheckIcon, onClick: handleSubmitBidsClick });
    }
  }

  // Always at bottom
  navItems.push({ name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon, onClick: undefined });

  const displayName = nickname || (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "Unknown Entity");

  return (
    <div className="w-[280px] bg-secondary border-r border-border-inverse h-screen sticky top-0 flex flex-col hidden md:flex shrink-0">
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-border-inverse">
        <Link href="/" className="flex items-center gap-3 font-heading font-bold text-2xl text-primary tracking-wide uppercase">
          <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={40} height={40} className="object-contain" />
          BLOCKBID
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-5 space-y-2 overflow-y-auto">
        
        {/* Mode Switcher for Hybrid Users */}
        {role === "both" && (
          <div className="mb-6 bg-surface-inverse border border-border-inverse p-3 rounded-md">
            <p className="text-[10px] font-mono text-text-inverse-muted uppercase tracking-widest mb-2 text-center">[ NETWORK_MODE ]</p>
            <button
              onClick={() => {
                const newMode = activeMode === "supplier" ? "agency" : "supplier";
                setActiveMode(newMode);
                router.push(newMode === "supplier" ? "/dashboard/supplier" : "/dashboard/agency");
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary text-white font-mono text-xs font-bold tracking-widest uppercase rounded border border-border-inverse hover:border-primary transition-colors"
            >
              <span>{activeMode}</span>
              <ArrowsRightLeftIcon className="w-4 h-4 text-primary" />
            </button>
          </div>
        )}

        <div className="mb-8">
          <Link
            href={activeMode === "agency" ? "/dashboard/agency/new" : "#"}
            onClick={activeMode === "supplier" ? handlePostProcurementClick : undefined}
            className={`flex items-center justify-center gap-3 w-full px-4 py-4 font-heading font-bold uppercase tracking-widest transition-colors rounded-md shadow-md ${
              activeMode === "agency" 
                ? "bg-primary text-white hover:bg-primary-hover shadow-primary/20" 
                : "bg-surface-inverse text-text-inverse-muted border border-border-inverse hover:border-primary hover:text-primary"
            }`}
          >
            <PlusCircleIcon className="w-5 h-5 stroke-2" />
            New Request
          </Link>
        </div>

        <p className="px-2 text-xs font-mono font-bold text-text-inverse-muted uppercase tracking-widest mb-4">
          [ NAVIGATION ]
        </p>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                className={`flex items-center gap-4 px-4 py-3 rounded-md font-heading font-semibold transition-all duration-200 border-l-4 ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-text-inverse-muted border-transparent hover:text-white hover:bg-surface-inverse hover:border-text-inverse-muted"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary stroke-2" : "text-text-inverse-muted"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Widget */}
      <div className="p-5 border-t border-border-inverse">
        <div className="mb-4">
          <p className="text-xs font-mono text-text-inverse-muted tracking-wider mb-1">[ ACTIVE_ENTITY ]</p>
          <p className="text-sm font-heading font-bold text-white truncate">{ready ? displayName : "Authenticating..."}</p>
        </div>

        <div className="bg-surface-inverse p-4 border border-border-inverse rounded-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-none bg-green-500"></div>
            <span className="text-sm font-heading font-semibold text-white tracking-wide uppercase">Network</span>
          </div>
          <p className="text-xs font-mono text-text-inverse-muted leading-relaxed">
            Polygon Amoy<br />Systems Operational
          </p>
        </div>
      </div>

      {/* Brutalist Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-secondary border-2 border-primary p-8 max-w-md w-full shadow-[8px_8px_0_0_theme(colors.primary)] animate-in fade-in zoom-in duration-200">
            <h3 className="font-heading text-xl font-black text-primary uppercase tracking-widest mb-4">
              [ ROLE_UPGRADE_REQUIRED ]
            </h3>
            <div className="w-full h-px bg-border-inverse/30 mb-6"></div>
            <p className="font-mono text-sm text-text-inverse-muted mb-8 leading-relaxed">
              {upgradeMessage}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="flex-1 py-3 px-4 font-mono text-xs font-bold text-text-inverse-muted bg-surface-inverse hover:text-white transition-colors uppercase tracking-widest text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="flex-1 py-3 px-4 font-mono text-xs font-bold text-background bg-primary hover:bg-primary-light transition-colors uppercase tracking-widest text-center"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
