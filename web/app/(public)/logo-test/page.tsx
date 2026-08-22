"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function LogoTestPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Mathematically precise Isometric paths to prevent any distortion or "cartoon" stretching
  const BaseHexagon = () => (
    <>
      <polygon points="12 2 20.66 7 20.66 17 12 22 3.34 17 3.34 7" />
      <path d="M12 12 L12 22 M12 12 L20.66 7 M12 12 L3.34 7" />
    </>
  );

  const EyeSymbol = ({ fillDot = true }) => (
    <>
      <path d="M 12 5 L 15.5 7 L 12 9 L 8.5 7 Z" />
      <circle cx="12" cy="7" r="1" fill={fillDot ? "currentColor" : "none"} stroke={fillDot ? "none" : "currentColor"} />
    </>
  );

  const ScaleSymbol = () => (
    <>
      <path d="M 7.67 11.5 V 17" />
      <path d="M 5.17 11.5 L 10.17 14.44" />
      <path d="M 5.17 11.5 V 14.5" />
      <path d="M 10.17 14.44 V 17.5" />
    </>
  );

  const LockSymbol = ({ fillDot = true }) => (
    <>
      <path d="M 14.6 14.5 L 18.06 12.5 V 16 L 14.6 18 Z" />
      <path d="M 15.3 14.1 V 11.5 L 17.3 10.3 V 12.9" />
      <circle cx="16.33" cy="15.2" r="0.75" fill={fillDot ? "currentColor" : "none"} stroke={fillDot ? "none" : "currentColor"} />
    </>
  );

  const logos = [
    {
      id: 1,
      name: "1. The Impeccable Blueprint",
      description: "Ang pinaka-limpyo ug sharp nga execution. Uniform 2px stroke. Ang Eye, Scale, ug Lock kay gi-draw MANUALLY sa exact isometric coordinates. Zero distortion, zero cartoon. Pure mathematical tech logo.",
      svg: (
        <svg className="w-16 h-16 text-[#FBBF24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <BaseHexagon />
          <EyeSymbol />
          <ScaleSymbol />
          <LockSymbol />
        </svg>
      )
    },
    {
      id: 2,
      name: "2. The Luminous Engraving",
      description: "Baga ang outer cube (2.5px) para mu-match sa BLOCKBID text, pero ang symbols sa sulod pirti ka nipis (1px). Naghimo'g visual contrast nga grabe ka-premium.",
      svg: (
        <svg className="w-16 h-16 text-[#FBBF24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Thick Frame */}
          <g strokeWidth="2.5">
            <BaseHexagon />
          </g>
          {/* Thin Inner Symbols */}
          <g strokeWidth="1">
            <EyeSymbol fillDot={false} />
            <ScaleSymbol />
            <LockSymbol fillDot={false} />
          </g>
        </svg>
      )
    },
    {
      id: 3,
      name: "3. The Solid Vault (Negative Space)",
      description: "Solid Gold Block siya, unya ang Y ug ang 3 ka symbols kay gi-ukit (cut-out) pagawas. Bug-at ang dating ani, pang enterprise ug banking level ang kaisog.",
      svg: (
        <svg className="w-16 h-16 text-[#FBBF24]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <mask id="impeccable-cut">
              <rect width="24" height="24" fill="white" />
              <g stroke="black" fill="none" strokeWidth="1.5">
                <path d="M12 12 L12 25 M12 12 L24 5 M12 12 L0 5" strokeWidth="2.5" />
                <EyeSymbol />
                <ScaleSymbol />
                <LockSymbol />
              </g>
            </mask>
          </defs>
          <polygon points="12 1 21.5 6.5 21.5 17.5 12 23 2.5 17.5 2.5 6.5" fill="currentColor" mask="url(#impeccable-cut)"></polygon>
        </svg>
      )
    },
    {
      id: 4,
      name: "4. The Bi-Color Matrix",
      description: "Ang cube kay Gold (#FBBF24), pero ang 3 ka symbols kay White. Ang pag-lahi sa color nag-prevent nga mag-mura siyag drawing; nag-make sure nga murag display/data nodes ang symbols.",
      svg: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g className="text-[#FBBF24]" stroke="currentColor" strokeWidth="2">
            <BaseHexagon />
          </g>
          <g className="text-white" stroke="currentColor" strokeWidth="1.5">
            <EyeSymbol />
            <ScaleSymbol />
            <LockSymbol />
          </g>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 font-sans p-10 relative overflow-hidden">
      {/* Impeccable Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] bg-center opacity-50 z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-white font-outfit tracking-tight mb-2">
              BlockBid <span className="text-[#FBBF24]">The True Impeccable Setup</span>
            </h1>
            <p className="text-slate-400">Gibalanse nato ang gusto nimo nga symbols (Eye, Scale, Lock) + Impeccable Mathematical Geometry. Zero cartoon distortion.</p>
          </div>
          <Link href="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {logos.map((logo, index) => (
            <div 
              key={logo.id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative bg-[#0f172a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:border-[#FBBF24]/30 hover:bg-[#0f172a]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-[#FBBF24]/0 to-[#FBBF24]/5 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}></div>
              
              <div className="flex flex-col relative z-10 h-full">
                
                {/* Horizontal Lockup Display */}
                <div className="flex items-center gap-5 mb-8 mt-2 p-6 rounded-xl bg-[#020617]/50 border border-white/5 shadow-inner">
                  <div className={`relative flex items-center justify-center transition-transform duration-500 ${hoveredIndex === index ? 'scale-105' : 'scale-100'}`}>
                    {logo.svg}
                    <div className={`absolute inset-0 rounded-full bg-[#FBBF24]/20 transition-all duration-700 blur-2xl ${hoveredIndex === index ? 'opacity-60 scale-150' : 'opacity-0 scale-95'}`}></div>
                  </div>
                  
                  {/* Heavy Typography Match */}
                  <span className="text-[3.5rem] font-black text-white tracking-tighter font-outfit leading-none mt-1">BLOCKBID</span>
                </div>

                <div className="mt-auto">
                  <h3 className="text-xl font-bold text-white mb-2">{logo.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{logo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
