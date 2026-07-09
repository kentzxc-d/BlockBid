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
    <div className="w-64 bg-surface border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          BlockBid
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard/requestor/new"
            className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg font-medium transition-colors border border-blue-200"
          >
            <PlusCircleIcon className="w-5 h-5" />
            New Request
          </Link>
        </div>

        <p className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Main Menu</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-primary" 
                  : "text-text-muted hover:text-text-main hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-text-muted"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      {/* Footer Area */}
      <div className="p-4 border-t border-border text-xs text-text-muted text-center">
        &copy; 2026 BlockBid.
      </div>
    </div>
  );
}
