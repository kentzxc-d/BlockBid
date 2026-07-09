"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const navItems = [
    { name: "Overview", href: "/dashboard/user", icon: HomeIcon },
    { name: "Active Solicitations", href: "/dashboard/procurements", icon: DocumentTextIcon },
    { name: "My Procurements", href: "/dashboard/my-procurements", icon: FolderOpenIcon },
    { name: "My Bids", href: "/dashboard/bids", icon: ClipboardDocumentCheckIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-[280px] bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex flex-col hidden md:flex shrink-0">
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#38BDF8" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          BlockBid
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-5 space-y-2 overflow-y-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/requestor/new"
            className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-bold transition-colors shadow-md shadow-blue-900/50"
          >
            <PlusCircleIcon className="w-6 h-6 stroke-2" />
            New Request
          </Link>
        </div>

        <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-blue-400 stroke-2" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Footer Widget */}
      <div className="p-5 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-sm font-semibold text-white">Network Status</span>
          </div>
          <p className="text-xs text-slate-400">Connected to Polygon Amoy Testnet. All systems operational.</p>
        </div>
        <div className="mt-4 text-xs text-slate-500 text-center font-medium">
          &copy; 2026 BlockBid.
        </div>
      </div>
    </div>
  );
}
