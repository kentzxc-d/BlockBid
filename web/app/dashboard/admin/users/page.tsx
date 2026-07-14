"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useMemo } from "react";
import RoleGuard from "@/components/RoleGuard";
import { UserCircleIcon, IdentificationIcon, BuildingOfficeIcon, GlobeAltIcon, ShieldCheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function AdminUsersManagement() {
  const { user, ready } = usePrivy();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (ready && user) {
      fetchUsers();
    }
  }, [user, ready]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?admin_id=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        alert(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      alert("Network error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!user) return;
    setProcessingId(targetUserId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id, target_user_id: targetUserId, new_role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
      } else {
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating role");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      return (
        (u.nickname && u.nickname.toLowerCase().includes(q)) ||
        (u.wallet_address && u.wallet_address.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.entity_type && u.entity_type.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="py-6 px-4 md:py-10 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
              [ USER_MANAGEMENT ]
            </h1>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
              Manage platform entities and access control roles.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted stroke-2" />
              <input 
                type="text" 
                placeholder="SEARCH USERS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-surface border border-border focus:border-text-main outline-none transition-colors text-xs font-mono font-bold tracking-widest w-full placeholder:text-text-muted uppercase rounded-md"
              />
            </div>

            <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-md flex items-center justify-center shrink-0">
              <span className="text-primary font-mono text-xs font-bold uppercase tracking-widest">
                Total: {users.length}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-surface rounded-md border border-border"></div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-surface rounded-md p-10 border border-border text-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-bold text-text-main font-heading text-lg mb-1 uppercase">No users found</h3>
            <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-surface rounded-md p-6 border border-border hover:border-text-main transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* User Info */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                  {/* Avatar / Icon */}
                  <div className="shrink-0 w-12 h-12 rounded-md bg-gray-50 border border-border flex items-center justify-center overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-text-muted" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-text-main font-heading text-lg tracking-tight mb-1">{u.nickname}</h3>
                      <p className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase flex items-center gap-1.5">
                        <IdentificationIcon className="w-3.5 h-3.5" />
                        {u.wallet_address ? `${u.wallet_address.slice(0,6)}...${u.wallet_address.slice(-4)}` : 'No Wallet Connected'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase flex items-center gap-1.5">
                        <BuildingOfficeIcon className="w-3.5 h-3.5" />
                        Type: {u.entity_type}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase flex items-center gap-1.5">
                        <GlobeAltIcon className="w-3.5 h-3.5" />
                        Loc: {u.location || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Management Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className={`w-5 h-5 ${u.role === 'admin' ? 'text-danger' : 'text-primary'}`} />
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">Role:</span>
                  </div>
                  
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={processingId === u.id}
                    className={`bg-background border px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase outline-none transition-colors rounded-md cursor-pointer
                      ${u.role === 'admin' ? 'border-danger text-danger' : 
                        u.role === 'banned' ? 'border-gray-500 text-gray-500 bg-gray-100' : 'border-border text-text-main focus:border-primary'}
                    `}
                  >
                    <option value="supplier">Supplier</option>
                    <option value="requestor">Requestor</option>
                    <option value="both">Both (Hybrid)</option>
                    <option value="admin">Admin</option>
                    <option value="banned">Banned</option>
                  </select>

                  {processingId === u.id && (
                    <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase animate-pulse">Saving...</span>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
