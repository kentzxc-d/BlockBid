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
  UserGroupIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useProfile } from "@/contexts/ProfileContext";

export default function DashboardSidebar() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = usePrivy();
  const { profile, loadingProfile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Sidebar mode derived directly from profile role.
  const activeMode = profile?.role === "admin" 
    ? "admin" 
    : (profile?.role === "ict_staff" || profile?.role === "ict_head" || profile?.role === "requestor") 
      ? "agency" 
      : "supplier";

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen(prev => !prev);
    window.addEventListener("toggle-mobile-menu", handleToggle);
    return () => window.removeEventListener("toggle-mobile-menu", handleToggle);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handlePostAcquisitionClick = (e: React.MouseEvent) => {
    if (activeMode === "supplier") {
      e.preventDefault();
      setUpgradeMessage("Only Procuring Entities can post acquisitions.");
      setUpgradeModalOpen(true);
    }
  };

  const handleSubmitBidsClick = (e: React.MouseEvent) => {
    if (activeMode === "agency") {
      e.preventDefault();
      setUpgradeMessage("Procuring Entities cannot submit bids.");
      setUpgradeModalOpen(true);
    }
  };

  // Base items everyone sees
  const navItems: { name: string; href: string; icon: React.ElementType; onClick?: React.MouseEventHandler<HTMLAnchorElement> }[] = [
    { name: "Active Solicitations", href: "/dashboard/acquisitions", icon: DocumentTextIcon },
  ];

  // If in supplier mode
  if (activeMode === "supplier") {
    navItems.unshift({ name: "Overview", href: "/dashboard/supplier", icon: HomeIcon, onClick: undefined });
    navItems.push({ name: "My Bids", href: "/dashboard/my-bids", icon: ClipboardDocumentCheckIcon, onClick: undefined });
  }

  // If in agency mode
  if (activeMode === "agency") {
    navItems.unshift({ name: "Overview", href: "/dashboard/agency", icon: HomeIcon, onClick: undefined });
    navItems.push({ name: "My Acquisitions", href: "/dashboard/my-acquisitions", icon: FolderOpenIcon, onClick: undefined });
  }

  // If in admin mode
  if (activeMode === "admin") {
    navItems.unshift({ name: "Platform Overview", href: "/dashboard/admin", icon: HomeIcon, onClick: undefined });
    navItems.push({ name: "User Management", href: "/dashboard/admin/users", icon: UserGroupIcon, onClick: undefined });
    navItems.push({ name: "Identity Verification", href: "/dashboard/admin/kyc", icon: CheckBadgeIcon, onClick: undefined });
  }

  // Always at bottom
  navItems.push({ name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon, onClick: undefined });

  const displayName = profile?.nickname || (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "Unknown Entity");

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div className={`w-[280px] bg-secondary border-r border-border-inverse h-screen flex flex-col shrink-0 z-50 transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${
        mobileMenuOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full'
      }`}>
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-border-inverse">
        <Link href="/" className="flex items-center gap-3 font-heading font-bold text-2xl text-primary tracking-wide uppercase">
          <Image src="/logo-gold-transparent.png" alt="BlockBid Logo" width={40} height={40} className="object-contain" />
          BLOCKBID
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-5 flex flex-col overflow-y-auto">
        {(!ready || loadingProfile) ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-70 animate-pulse">
            <Cog6ToothIcon className="w-8 h-8 text-primary animate-[spin_3s_linear_infinite] mb-4 opacity-50" />
            <p className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase text-center">
              [ VERIFYING<br/>CLEARANCE ]
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Network Mode Switcher Removed */}

            {activeMode === "agency" && (
              <div className="mb-8">
                <Link
                  href="/dashboard/agency/new"
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 font-heading font-bold uppercase tracking-widest transition-colors rounded-none shadow-md bg-primary text-secondary hover:text-secondary hover:bg-primary-hover shadow-primary/20"
                >
                  <PlusCircleIcon className="w-5 h-5 stroke-2" />
                  New Request
                </Link>
              </div>
            )}

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
        )}
      </div>

      {/* Footer Widget */}
      <div className="p-5 border-t border-border-inverse">
        <div className="mb-4">
          <p className="text-xs font-mono text-text-inverse-muted tracking-wider mb-1">[ ACTIVE_ENTITY ]</p>
          <p className="text-sm font-heading font-bold text-white truncate">{(!ready || loadingProfile) ? "Authenticating..." : displayName}</p>
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

      </div>

      {/* Brutalist Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-secondary border-2 border-primary rounded-md p-8 max-w-md w-full shadow-[8px_8px_0_0_theme(colors.primary)] animate-in fade-in zoom-in duration-200">
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
                className="flex-1 py-3 px-4 font-mono text-xs rounded-md font-bold text-text-inverse-muted bg-surface-inverse hover:text-white transition-colors uppercase tracking-widest text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="flex-1 py-3 px-4 font-mono text-xs rounded-md font-bold text-background bg-primary hover:bg-primary-light transition-colors uppercase tracking-widest text-center"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

