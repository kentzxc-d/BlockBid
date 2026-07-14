"use client";

import RoleGuard from "@/components/RoleGuard";

export default function AdminUsersManagement() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="py-6 px-4 md:py-10 md:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-10 border-b border-border pb-6">
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
            [ USER_MANAGEMENT ]
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Manage platform entities and roles. (Coming Soon)
          </p>
        </div>
        
        <div className="bg-surface rounded-md p-10 border border-border text-center">
          <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">Under Construction</h3>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">This module is currently being built.</p>
        </div>
      </div>
    </RoleGuard>
  );
}
