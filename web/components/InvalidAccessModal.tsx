import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InvalidAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function InvalidAccessModal({ isOpen, onClose, message }: InvalidAccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition-opacity">
      <div 
        className="relative w-full max-w-[400px] min-h-[340px] p-8 bg-[#111113] border border-zinc-800/60 shadow-2xl text-white flex flex-col rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-200 bg-[#222224] hover:bg-[#2c2c2f] rounded-full transition-colors"
        >
          <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="flex flex-col flex-1 mt-6">
          <h2 className="text-[20px] font-semibold text-white mb-2 font-body text-center leading-tight">
            Invalid Access
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            <div className="w-full px-5 py-4 rounded-xl border border-zinc-800 bg-[#161618] flex items-center justify-center min-h-[60px]">
               <p className="text-[15px] text-zinc-300 text-center font-body">
                 {message}
               </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 pb-2 flex justify-center opacity-70">
          <p className="text-[14px] text-zinc-500 font-body flex items-center gap-1.5">
            Protected by <span className="font-bold text-zinc-400 flex items-center gap-1"><div className="w-3.5 h-3.5 bg-zinc-400 rounded-full inline-block"></div> privy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
