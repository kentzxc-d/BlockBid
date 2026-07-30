"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useRef, use } from "react";
import { ArrowLeftIcon, LockClosedIcon, DocumentArrowDownIcon, PaperAirplaneIcon, XMarkIcon, FingerPrintIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Avatar from "boring-avatars";
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
  contact_name?: string;
  contact_number?: string;
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
  const [signingOff, setSigningOff] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch(`/api/acquisitions/${params.id}/workspace`);
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
      const res = await fetch(`/api/acquisitions/${params.id}/workspace`, {
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

  const executeSignOff = async () => {
    if (!profile?.id || signingOff) return;

    setSigningOff(true);
    try {
      const res = await fetch(`/api/acquisitions/${params.id}/sign-off`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sender_id: profile.id, 
          role: amIRequestor ? 'requestor' : 'supplier'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkspace();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningOff(false);
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

  const hasRequestorSigned = messages.some(m => m.content === '[SYSTEM_SIGNOFF_REQUESTOR]');
  const hasSupplierSigned = messages.some(m => m.content === '[SYSTEM_SIGNOFF_SUPPLIER]');
  const isProjectClosed = project?.status === 'closed' || messages.some(m => m.content === '[SYSTEM_TRANSACTION_COMPLETED]');
  const haveISigned = amIRequestor ? hasRequestorSigned : hasSupplierSigned;

  return (
    <div className="py-6 px-4 md:py-8 md:px-8 max-w-6xl mx-auto w-full flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <Link 
          href={amIRequestor ? "/dashboard/my-acquisitions" : "/dashboard/supplier"} 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> BACK_TO_DASHBOARD
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase">
              [ WORKSPACE: <span className="text-primary">{project.title}</span> ]
            </h1>
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-none border border-green-500/20">
              <LockClosedIcon className="w-4 h-4" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase hidden md:inline">E2E_Encrypted_Channel</span>
            </div>
          </div>

          {project.status === 'awarded' && !isProjectClosed && (
            <button
              onClick={() => setShowSignOffModal(true)}
              className={`flex items-center justify-center px-6 py-3 rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 shrink-0 ${
                haveISigned 
                  ? 'bg-gray-100 border border-border text-text-muted hover:bg-gray-200'
                  : 'bg-primary text-white hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40'
              }`}
            >
              {haveISigned ? 'VIEW SIGNATURES' : 'MARK AS COMPLETED'}
            </button>
          )}
          {isProjectClosed && (
            <div className="flex items-center justify-center px-5 py-2.5 rounded-none border border-blue-500/30 bg-blue-500/10 text-blue-600 font-mono text-xs font-bold tracking-widest uppercase shrink-0">
              PROJECT COMPLETED
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar - Contact Info Reveal */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
          
          <div className="bg-surface border border-border p-5 rounded-none shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">[ YOUR_PROFILE ]</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-none bg-gray-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                {myParty?.avatar_url ? <img src={myParty.avatar_url} className="w-full h-full object-cover"/> : <Avatar size={36} name={myParty?.wallet_address || myParty?.id || 'default'} variant="beam" colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']} />}
              </div>
              <div>
                <p className="font-bold text-text-main leading-tight">{myParty?.nickname || 'Unknown'}</p>
                <p className="text-xs text-text-muted font-mono mt-1 capitalize">{myParty?.entity_type || 'Unknown Entity'} <span className="opacity-50 mx-1">•</span> <span className="text-primary">{amIRequestor ? 'Requestor' : 'Supplier'}</span></p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Contact Person</p>
                <p className="text-xs font-mono text-text-main mt-0.5">{myParty?.contact_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Contact Number</p>
                <p className="text-xs font-mono text-text-main mt-0.5">{myParty?.contact_number || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-primary/30 p-5 rounded-none shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
            <h3 className="font-mono text-xs text-secondary uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
              [ COUNTERPARTY_INFO ]
              <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-none">REVEALED</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-gray-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                  {otherParty?.avatar_url ? <img src={otherParty.avatar_url} className="w-full h-full object-cover"/> : <Avatar size={36} name={otherParty?.wallet_address || otherParty?.id || 'default'} variant="beam" colors={['#C5A059', '#1A2138', '#4B5563', '#FFFFFF', '#D1D5DB']} />}
                </div>
                <div>
                  <p className="font-bold text-text-main leading-tight">{otherParty?.nickname || 'Unknown'}</p>
                  <p className="text-xs text-text-muted font-mono mt-1 capitalize">{otherParty?.entity_type || 'Unknown Entity'} <span className="opacity-50 mx-1">•</span> <span className="text-secondary">{amIRequestor ? 'Supplier' : 'Requestor'}</span></p>
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
                <div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Contact Person</p>
                  <p className="text-xs font-mono text-text-main mt-0.5">{otherParty?.contact_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Contact Number</p>
                  <p className="text-xs font-mono text-text-main mt-0.5">{otherParty?.contact_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Area - Discussion Board */}
        <div className="flex-1 bg-surface border border-border rounded-none shadow-sm flex flex-col min-h-[400px]">
          
          <div className="p-3 border-b border-border bg-gray-50/50 flex justify-between items-center rounded-none">
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
                    {msg.content.startsWith('[SYSTEM_') ? (
                      <div className="max-w-[85%] px-4 py-2.5 rounded-none text-xs font-mono font-bold tracking-widest uppercase border bg-gray-100 border-border text-text-muted text-center shadow-sm">
                        {msg.content === '[SYSTEM_SIGNOFF_REQUESTOR]' && 'REQUESTOR HAS SIGNED OFF ON COMPLETION'}
                        {msg.content === '[SYSTEM_SIGNOFF_SUPPLIER]' && 'SUPPLIER HAS SIGNED OFF ON COMPLETION'}
                        {msg.content === '[SYSTEM_TRANSACTION_COMPLETED]' && 'TRANSACTION HAS BEEN MARKED AS COMPLETED. WORKSPACE LOCKED.'}
                        {msg.content.startsWith('[SYSTEM_BLOCKCHAIN_RECEIPT]') && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-blue-600">ON-CHAIN PAYMENT GUARANTEE ISSUED</span>
                            <span className="text-[9px] text-gray-500 break-all">{msg.content.split('\n')[1]}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className={`max-w-[85%] px-4 py-2.5 rounded-none text-sm border ${
                          isMe 
                            ? 'bg-primary/10 border-primary/20 text-text-main' 
                            : 'bg-white border-border text-text-main shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                      </div>
                    )}
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
                placeholder={isProjectClosed ? "[ WORKSPACE LOCKED. COMPLETED. ]" : "[ TYPE_MESSAGE_HERE... ]"}
                className="flex-1 bg-surface border border-border px-4 py-3 rounded-none text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:bg-gray-50"
                disabled={sending || isProjectClosed}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending || isProjectClosed}
                className="bg-primary text-white px-6 py-3 rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
              >
                {sending ? 'SENDING...' : 'TRANSMIT'} <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Multi-Sig Completion Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] w-full max-w-md border border-slate-700/50 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
            
            <button onClick={() => setShowSignOffModal(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <XMarkIcon className="w-4 h-4 stroke-2" />
            </button>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
                <LockClosedIcon className="w-5 h-5 text-primary stroke-2" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white leading-tight">Multi-Sig Auth</h3>
                <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Smart Contract Escrow</p>
              </div>
            </div>

            <div className="text-center mb-8 relative z-10">
              <div className="text-5xl font-black font-heading tracking-tight mb-2">
                {Number(hasRequestorSigned) + Number(hasSupplierSigned)}<span className="text-white/40">/2</span>
              </div>
              <p className="font-mono text-[11px] font-bold tracking-widest text-primary uppercase">Signatures Required</p>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              {/* Procuring Agency Signer */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${hasRequestorSigned ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasRequestorSigned ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                    {hasRequestorSigned ? <CheckBadgeIcon className="w-5 h-5" /> : <FingerPrintIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{requestor?.nickname || 'Procuring Agency'}</p>
                    <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Procuring Agency</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${hasRequestorSigned ? 'bg-primary shadow-[0_0_8px_rgba(197,160,89,0.8)]' : 'bg-white/20'}`} />
              </div>

              {/* Supplier Signer */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${hasSupplierSigned ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasSupplierSigned ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                    {hasSupplierSigned ? <CheckBadgeIcon className="w-5 h-5" /> : <FingerPrintIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{supplier?.nickname || 'Awarded Supplier'}</p>
                    <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Awarded Supplier</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${hasSupplierSigned ? 'bg-primary shadow-[0_0_8px_rgba(197,160,89,0.8)]' : 'bg-white/20'}`} />
              </div>
            </div>

            <button 
              onClick={executeSignOff}
              disabled={haveISigned || signingOff || isProjectClosed}
              className="relative z-10 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {haveISigned 
                ? 'SIGNATURE RECORDED' 
                : (signingOff ? 'PROCESSING ON-CHAIN...' : 'AUTHORIZE & SIGN')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
