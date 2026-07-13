"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, ready } = usePrivy();
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      fetch(`/api/user/profile?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile?.nickname) {
            setNickname(data.profile.nickname);
          }
        })
        .catch(console.error);
    }
  }, [user, ready]);

  const navItems = [
    { name: "Overview", href: "/dashboard/user", icon: HomeIcon },
    { name: "Active Solicitations", href: "/dashboard/procurements", icon: DocumentTextIcon },
    { name: "My Procurements", href: "/dashboard/my-procurements", icon: FolderOpenIcon },
    { name: "My Bids", href: "/dashboard/my-bids", icon: ClipboardDocumentCheckIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ];

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
        <div className="mb-8">
          <Link
            href="/dashboard/requestor/new"
            className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-primary text-white hover:bg-primary-hover hover:text-white font-heading font-bold uppercase tracking-widest transition-colors rounded-md shadow-md shadow-primary/20"
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
                className={`flex items-center gap-4 px-4 py-3 rounded-md font-heading font-semibold transition-all duration-200 border-l-4 ${isActive
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
    </div>
  );
}
