"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

export interface UserProfile {
  id: string;
  privy_id: string;
  nickname: string;
  role: string;
  entity_type: string;
  wallet_address: string | null;
  avatar_url?: string | null;
  location?: string | null;
}

interface ProfileContextType {
  profile: UserProfile | null;
  adminData: any;
  loadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  adminData: null,
  loadingProfile: true,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, ready, authenticated } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [adminData, setAdminData] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!ready) return;
    
    if (ready && (!authenticated || !user)) {
      setProfile(null);
      setAdminData(null);
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await fetch(`/api/user/profile?id=${user!.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          
          // Pre-fetch admin data if user is an admin
          if (data.profile.role === 'admin') {
            try {
              const [statsRes, projectsRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/stats?admin_id=${user!.id}`),
                fetch(`/api/admin/pending-projects?admin_id=${user!.id}`),
                fetch(`/api/admin/analytics?admin_id=${user!.id}`)
              ]);
              
              const statsData = await statsRes.json();
              const pendingData = await projectsRes.json();
              const analyticsData = await analyticsRes.json();
              
              setAdminData({
                stats: statsData.success ? statsData.stats : null,
                pendingProjects: pendingData.success ? pendingData.projects : [],
                analytics: analyticsData.success ? analyticsData.data : []
              });
            } catch (adminErr) {
              console.error("Failed to pre-fetch admin data", adminErr);
              setAdminData({ stats: null, pendingProjects: [], analytics: [] });
            }
          }
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile in context", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [ready, authenticated, user]);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, adminData, loadingProfile, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
