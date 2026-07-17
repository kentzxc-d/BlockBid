"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useRef, use } from "react";
import { ArrowLeftIcon, LockClosedIcon, DocumentArrowDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useProfile } from "@/contexts/ProfileContext";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Profile = {
  id: string;
  nickname: string;
  entity_type: string;
  wallet_address: string;
  avatar_url?: string;
  location?: string;
};

export default function WorkspacePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { user } = usePrivy();
  const { profile } = useProfile();
  const [project, setProject] = useState<any>(null);
  const [requestor, setRequestor] = useState<Profile | null>(null);
  const [supplier, setSupplier] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/procurements/${params.id}/workspace`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setRequestor(data.requestorProfile);
        setSupplier(data.supplierProfile);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    const interval = setInterval(fetchWorkspace, 10000); // Poll for new messages
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile?.id) return;

    setSending(true);
    const content = input;
    setInput("");

    try {
      const res = await fetch(`/api/procurements/${params.id}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: profile.id, content })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-8 w-full">
        <div className="animate-pulse font-mono text-sm font-bold tracking-widest text-primary uppercase">
          [ INITIALIZING_SECURE_WORKSPACE ]
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-danger font-mono">[ WORKSPACE_NOT_FOUND ]</div>;
  }

  const amIRequestor = profile?.id === requestor?.id;
  const amISupplier = profile?.id === supplier?.id;
  
  if (!amIRequestor && !amISupplier) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <LockClosedIcon className="w-12 h-12 text-danger mb-4" />
        <h2 className="font-mono text-lg font-bold text-danger uppercase">[ ACCESS_DENIED ]</h2>
        <p className="text-text-muted mt-2 text-sm">Only the agency and the awarded supplier can view this channel.</p>
      </div>
    );
  }

  const otherParty = amIRequestor ? supplier : requestor;
  const myParty = amIRequestor ? requestor : supplier;

  return (
    <div className="py-6 px-4 md:py-8 md:px-8 max-w-6xl mx-auto w-full flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <Link 
          href={amIRequestor ? "/dashboard/my-procurements" : "/dashboard/supplier"} 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> BACK_TO_DASHBOARD
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">
            [ WORKSPACE: <span className="text-primary">{project.title}</span> ]
          </h1>
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-md border border-green-500/20">
            <LockClosedIcon className="w-4 h-4" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">E2E_Encrypted_Channel</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar - Contact Info Reveal */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
          
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">[ YOUR_PROFILE ]</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-gray-100 border border-border overflow-hidden shrink-0">
                {myParty?.avatar_url ? <img src={myParty.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-primary/20" />}
              </div>
              <div>
                <p className="font-bold text-text-main leading-tight">{myParty?.nickname || 'Unknown'}</p>
                <p className="text-xs text-text-muted font-mono mt-1">{myParty?.entity_type}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-primary/30 p-5 rounded-md shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
            <h3 className="font-mono text-xs text-secondary uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
              [ COUNTERPARTY_INFO ]
              <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md">REVEALED</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gray-100 border border-border overflow-hidden shrink-0">
                  {otherParty?.avatar_url ? <img src={otherParty.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-secondary/20" />}
                </div>
                <div>
                  <p className="font-bold text-text-main leading-tight">{otherParty?.nickname || 'Unknown'}</p>
                  <p className="text-xs text-text-muted font-mono mt-1">{otherParty?.entity_type}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Wallet / ID</p>
                  <p className="text-xs font-mono text-text-main truncate mt-0.5" title={otherParty?.wallet_address || otherParty?.id}>
                    {otherParty?.wallet_address || otherParty?.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Location</p>
                  <p className="text-xs text-text-main mt-0.5">{otherParty?.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Area - Discussion Board */}
        <div className="flex-1 bg-surface border border-border rounded-md shadow-sm flex flex-col min-h-[400px]">
          
          <div className="p-3 border-b border-border bg-gray-50/50 flex justify-between items-center rounded-t-md">
            <span className="font-mono text-xs font-bold text-text-main uppercase tracking-widest">[ COMMUNICATION_LOG ]</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcfc]">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest">[ NO_RECORDS_FOUND. INITIATE_COMMS. ]</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === profile?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-[10px] font-mono text-text-muted font-bold">
                        {isMe ? 'YOU' : otherParty?.nickname?.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div 
                      className={`max-w-[85%] px-4 py-2.5 rounded-md text-sm border ${
                        isMe 
                          ? 'bg-primary/10 border-primary/20 text-text-main' 
                          : 'bg-white border-border text-text-main shadow-sm'
                      }`}
                      style={{ borderTopRightRadius: isMe ? 0 : undefined, borderTopLeftRadius: !isMe ? 0 : undefined }}
                    >
                      <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-white">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="[ TYPE_MESSAGE_HERE... ]"
                className="flex-1 bg-surface border border-border px-4 py-3 rounded-md text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? 'SENDING...' : 'TRANSMIT'} <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
