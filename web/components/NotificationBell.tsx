"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { createClient } from "@/utils/supabase/client";
import { useProfile } from "@/contexts/ProfileContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (!error && data) {
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime changes on the notifications table
    if (!profile?.id) return;
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profile.id}`
        },
        (payload) => {
          // Instantly add the new notification to state
          setNotifications(current => [payload.new as Notification, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string, link: string) => {
    setIsOpen(false);
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    // Update in DB via API (since RLS might block direct client updates depending on setup)
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    
    if (link) {
      router.push(link);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;
    
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-main transition-colors rounded-md hover:bg-gray-50 focus:outline-none"
      >
        {/* If no notifs, whole bell. If notifs, solid bell or outline depending on preference. Let's stick to outline for consistent look */}
        <BellIcon className="w-6 h-6 stroke-[1.5]" />
        
        {/* The Badge with cutout effect */}
        {unreadCount > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-surface shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown Panel - Crypto/Web3 Theme */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border shadow-xl rounded-sm z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50/50">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-text-main">
              [ SYSTEM_NOTIFICATIONS ]
            </span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-mono tracking-wider uppercase text-primary hover:text-green-600 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted font-mono">
                [ NO_NEW_ALERTS ]
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id, notif.link)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-green-50/20' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent border border-gray-300'}`} />
                      <div>
                        <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-text-main' : 'font-medium text-text-muted'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-2 uppercase tracking-wider">
                          {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
