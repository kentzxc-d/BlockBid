'use client';

import React from 'react';

export default function HexcoTestPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">HEXCO Font Tests</h1>
        <p className="text-slate-400 mb-12">Compare how the HEXCO font looks in different scenarios.</p>

        <div className="grid gap-8">
          
          {/* Option A */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Option A: Current (Outfit + Inter)</h2>
            <p className="text-sm text-slate-400 mb-6">Clean and modern. No HEXCO used here.</p>
            
            <div className="bg-[#0B132B] border border-[#1E293B] rounded-lg p-6">
              <div className="font-body text-[10px] font-bold text-bb-gold tracking-widest uppercase mb-2">
                [ STATUS: EVALUATION ]
              </div>
              <h3 className="font-heading font-bold text-2xl text-white mb-4">
                Procurement of 10,000 sets of Textbooks
              </h3>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Supply and delivery of educational materials for secondary public schools. 
                Includes textbooks covering Science, Technology, and Mathematics curriculum for Grades 7-10.
              </p>
            </div>
          </div>

          {/* Option B */}
          <div className="bg-slate-900/50 border border-bb-gold/30 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-bb-gold/20 text-bb-gold text-xs px-3 py-1 rounded font-bold">Recommended</div>
            <h2 className="text-xl font-bold text-white mb-2">Option B: Accents Only (HEXCO + Outfit + Inter)</h2>
            <p className="text-sm text-slate-400 mb-6">HEXCO used for small techy labels. Keeps readability high.</p>
            
            <div className="bg-[#0B132B] border border-[#1E293B] rounded-lg p-6">
              <div className="font-hexco text-[13px] font-normal text-bb-gold tracking-wider uppercase mb-2">
                [ STATUS: EVALUATION ]
              </div>
              <h3 className="font-heading font-bold text-2xl text-white mb-4">
                Procurement of 10,000 sets of Textbooks
              </h3>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Supply and delivery of educational materials for secondary public schools. 
                Includes textbooks covering Science, Technology, and Mathematics curriculum for Grades 7-10.
              </p>
            </div>
          </div>

          {/* Option C */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Option C: Headings (HEXCO + Inter)</h2>
            <p className="text-sm text-slate-400 mb-6">HEXCO used for big titles. Very bold but can look heavy.</p>
            
            <div className="bg-[#0B132B] border border-[#1E293B] rounded-lg p-6">
              <div className="font-hexco text-[13px] font-normal text-bb-gold tracking-wider uppercase mb-2">
                [ STATUS: EVALUATION ]
              </div>
              <h3 className="font-hexco font-normal text-2xl text-white mb-4 leading-tight">
                Procurement of 10,000 sets of Textbooks
              </h3>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Supply and delivery of educational materials for secondary public schools. 
                Includes textbooks covering Science, Technology, and Mathematics curriculum for Grades 7-10.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
