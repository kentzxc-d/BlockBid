"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard/user", icon: HomeIcon },
    { name: "Active Solicitations", href: "/procurements", icon: DocumentTextIcon },
    { name: "My Bids", href: "/dashboard/bids", icon: ClipboardDocumentCheckIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-[280px] bg-surface border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex shrink-0">
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          BlockBid
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-5 space-y-2 overflow-y-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/requestor/new"
            className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl font-bold transition-colors border border-blue-200 shadow-sm"
          >
            <PlusCircleIcon className="w-6 h-6 stroke-2" />
            New Request
          </Link>
        </div>

        <p className="px-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Main Menu</p>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-50 text-primary shadow-sm border border-blue-100" 
                    : "text-text-muted hover:text-text-main hover:bg-gray-50 border border-transparent"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-primary stroke-2" : "text-text-muted"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Footer Area */}
      <div className="p-4 border-t border-border text-xs text-text-muted text-center">
        &copy; 2026 BlockBid.
      </div>
    </div>
  );
}
