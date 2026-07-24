"use client";

import React, { useState, useEffect } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';
import { EnvelopeIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function CustomLoginModal({ isOpen, onClose, intent }: { isOpen: boolean, onClose: () => void, intent: 'officer' | 'supplier' | null }) {
  const [step, setStep] = useState<'initial' | 'email_input' | 'otp_input'>('initial');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onComplete: ({ user, isNewUser, wasAlreadyAuthenticated }) => {
      onClose();
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error) => {
      console.error(error);
      setErrorMsg("Authentication failed. Please check the code or try again.");
    }
  });

  useEffect(() => {
    if (!isOpen) {
      setStep('initial');
      setEmail('');
      setCode('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await sendCode({ email });
      setStep('otp_input');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to send code.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await loginWithCode({ code });
    } catch (err) {
      console.error(err);
      setErrorMsg("Invalid code.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity">
      <div 
        className="relative w-full max-w-[400px] p-8 bg-surface border border-border shadow-2xl text-text-main flex flex-col items-center justify-center min-h-[320px] rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main hover:bg-background rounded-full transition-colors">
          <XMarkIcon className="w-5 h-5 stroke-2" />
        </button>

        <h2 className="mb-2 font-heading text-xl font-bold uppercase tracking-widest text-text-main text-center">
          {intent === 'officer' ? '[ Officer Access ]' : '[ Supplier Login ]'}
        </h2>
        <p className="mb-8 text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest text-center">
          Protected by Privy
        </p>

        {errorMsg && (
          <div className="mb-6 w-full p-3 bg-danger/10 border border-danger/30 rounded-lg text-xs font-mono font-bold text-danger tracking-widest text-center">
            {errorMsg}
          </div>
        )}

        {/* Email Form (Animated) */}
        {(step === 'initial' || step === 'email_input') && (
          <form 
            onSubmit={handleSendCode}
            className={`relative flex items-center bg-background border border-border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
              step === 'initial' 
                ? 'w-16 h-16 justify-center rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 shadow-lg hover:shadow-primary/20' 
                : 'w-full h-14 pl-4 pr-2 rounded-xl shadow-inner'
            }`}
            onClick={() => {
              if (step === 'initial') setStep('email_input');
            }}
          >
            <EnvelopeIcon 
              className={`shrink-0 transition-all duration-500 ${
                step === 'initial' ? 'w-7 h-7 text-text-main group-hover:text-primary' : 'w-5 h-5 text-text-muted'
              }`} 
            />
            
            <input
              type="email"
              placeholder="your@email.com"
              required
              autoFocus={step === 'email_input'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`flex-1 bg-transparent border-none focus:outline-none text-sm font-mono font-bold tracking-widest ml-3 transition-all duration-500 placeholder:text-text-muted/50 ${
                step === 'initial' ? 'opacity-0 w-0' : 'opacity-100 w-full'
              }`}
              disabled={step === 'initial'}
            />

            {step === 'email_input' && (
              <button 
                type="submit"
                disabled={state.status === 'sending-code' || !email}
                className="bg-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest transition-colors shrink-0 flex items-center justify-center min-w-[44px]"
              >
                {state.status === 'sending-code' ? (
                   <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4 stroke-2" />
                )}
              </button>
            )}
          </form>
        )}

        {/* OTP Form */}
        {step === 'otp_input' && (
          <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <p className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-1">
                Enter OTP sent to
              </p>
              <p className="text-xs font-mono font-bold text-primary tracking-wider">
                {email}
              </p>
            </div>
            
            <input
              type="text"
              placeholder="000000"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-16 bg-background border-2 border-border focus:border-primary rounded-xl text-center text-3xl tracking-[0.7em] font-mono font-bold outline-none transition-colors"
            />
            
            <button 
              type="submit"
              disabled={state.status === 'submitting-code' || code.length < 6}
              className="w-full bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 shadow-lg shadow-primary/20 py-4 rounded-xl text-sm font-bold font-mono tracking-widest transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex justify-center items-center h-14"
            >
              {state.status === 'submitting-code' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : '[ VERIFY_CODE ]'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep('email_input');
                setCode('');
                setErrorMsg('');
              }}
              className="text-[10px] font-mono font-bold text-text-muted hover:text-text-main text-center mt-2 uppercase tracking-widest underline decoration-text-muted/30 underline-offset-4"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
