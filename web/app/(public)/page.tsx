'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import AuthLink from '@/components/AuthLink';
import GetStartedButton from '@/components/GetStartedButton';

export default function Home() {
    // Ported Isometric Carousel Javascript
    useEffect(() => {
        const stackContainer = document.getElementById('isometric-stack');
        if (!stackContainer) return;
        
        const cards = Array.from(stackContainer.children);
        let positions = ['pos-3', 'pos-2', 'pos-1'];
        let autoPlayInterval: NodeJS.Timeout;
        let isAnimating = false;
    
        function applyPositions() {
          cards.forEach((card, index) => {
            card.classList.remove('pos-1', 'pos-2', 'pos-3', 'pos-lifting');
            card.classList.add(positions[index]);
          });
        }
    
        function rotateStack() {
          if (isAnimating) return;
          isAnimating = true;
    
          const frontCardIndex = positions.indexOf('pos-1');
          const frontCard = cards[frontCardIndex];
          
          frontCard.classList.remove('pos-1');
          frontCard.classList.add('pos-lifting');
    
          const middleCardIndex = positions.indexOf('pos-2');
          const backCardIndex = positions.indexOf('pos-3');
          
          cards[middleCardIndex].classList.remove('pos-2');
          cards[middleCardIndex].classList.add('pos-1');
          
          cards[backCardIndex].classList.remove('pos-3');
          cards[backCardIndex].classList.add('pos-2');
    
          setTimeout(() => {
            frontCard.classList.remove('pos-lifting');
            frontCard.classList.add('pos-3');
            
            positions[frontCardIndex] = 'pos-3';
            positions[middleCardIndex] = 'pos-1';
            positions[backCardIndex] = 'pos-2';
            
            isAnimating = false;
          }, 350); 
        }
    
        function startAutoplay() {
          autoPlayInterval = setInterval(rotateStack, 4000);
        }
        
        function resetAutoplay() {
          clearInterval(autoPlayInterval);
          startAutoplay();
        }
    
        const handleClick = () => {
          rotateStack();
          resetAutoplay();
        };
        
        stackContainer.addEventListener('click', handleClick);
    
        applyPositions();
        startAutoplay();
    
        // Intersection Observer for Reveal Elements
        const revealElements = document.querySelectorAll('.reveal-hidden');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('reveal-hidden');
              entry.target.classList.add('reveal-visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px"
        });
        
        revealElements.forEach((el) => observer.observe(el));
        
        return () => {
           clearInterval(autoPlayInterval);
           stackContainer.removeEventListener('click', handleClick);
           observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-page bg-grid-pattern bg-[length:40px_40px] bg-center bg-[#0b1120] text-slate-300 min-h-screen flex flex-col font-sans overflow-x-hidden relative">
            
<div className="ambient-aura-1"></div>
<div className="ambient-aura-2"></div>

<header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10 relative">
{/* Logo Lockup */}
<div className="flex items-center gap-2.5 cursor-pointer group">
<div 
  className="w-9 h-9 bg-bb-gold transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
  style={{
    maskImage: 'url(/logo-gold-transparent.png)',
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: 'url(/logo-gold-transparent.png)',
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center'
  }}
  aria-label="BlockBid Logo"
  role="img"
></div>
  <span className="text-[1.75rem] font-black tracking-tight text-white font-outfit leading-none mt-1">
    BLOCK<span className="text-bb-gold">BID</span>
  </span>
</div>
{/* Navigation */}
<nav className="hidden md:flex gap-8 items-center text-sm">
  <Link className="group transition-colors text-white flex items-center font-medium" href="#top">
    <span className="text-bb-gold transition-all duration-300 font-bold mr-1.5">[</span>
    <span>Home</span>
    <span className="text-bb-gold transition-all duration-300 font-bold ml-1.5">]</span>
  </Link>
  <Link className="group transition-colors text-slate-300 hover:text-white flex items-center font-medium" href="#features">
    <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold mr-1.5">[</span>
    <span>Features</span>
    <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold ml-1.5">]</span>
  </Link>
  <Link className="group transition-colors text-slate-300 hover:text-white flex items-center font-medium" href="#ecosystem">
    <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold mr-1.5">[</span>
    <span>Workflows</span>
    <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold ml-1.5">]</span>
  </Link>
  <Link className="group transition-colors text-slate-300 hover:text-white flex items-center font-medium" href="/portal">
    <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold mr-1.5">[</span>
    <span>Public Portal</span>
    <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 text-bb-gold transition-all duration-300 font-bold ml-1.5">]</span>
  </Link>
</nav>
{/* Actions */}
<div className="flex gap-4 items-center">
  <GetStartedButton />
</div>
</header>

{/*  BEGIN: Main Content  */}
<main className="flex-grow flex flex-col relative z-10 w-full max-w-7xl mx-auto px-6 py-12 lg:py-24">
<div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
{/*  Left Column: Hero Text & Stats  */}
<section className="flex flex-col gap-8 max-w-xl">
<h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight flex flex-col gap-2">
          <span className="overflow-hidden pb-1"><span className="block animate-reveal-up text-white">Acquisitions, Unveiled.</span></span>
          <span className="overflow-hidden pb-1"><span className="block animate-reveal-up" style={{"animationDelay":"200ms"}}><span className="text-shimmer block">Bidding, Uncompromised.</span></span></span>
        </h1>
<p className="text-slate-400 text-lg leading-relaxed">
          BlockBid is the premier Web3 platform for secure, transparent, and efficient asset bidding. Leverage blockchain technology for tamper-proof transactions and unparalleled clarity.
        </p>
<div className="flex flex-wrap gap-4 pt-4">

  <AuthLink target="/dashboard" intent="officer" className="group btn-gold px-8 py-3.5 rounded-lg font-semibold text-base flex items-center gap-3">
    <svg className="w-6 h-6 text-bb-darker overflow-visible" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path className="origin-center transition-transform duration-300 ease-out group-hover:scale-[1.10]" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2.5L3.5 6v5c0 5.55 3.84 10.74 8.5 12 4.66-1.26 8.5-6.45 8.5-12V6l-8.5-3.5z"></path>
      <path className="check-anim origin-center" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8.5 12.5 L11.5 15.5 L16.5 10"></path>
    </svg>
    Access BAC Portal
  </AuthLink>
  

  <AuthLink target="/dashboard" intent="supplier" className="group btn-outline-gold px-8 py-3.5 rounded-lg font-semibold text-base flex items-center gap-2">
    Supplier Dashboard
    <svg className="w-4 h-4 opacity-0 -ml-4 group-hover:ml-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
  </AuthLink>
  
</div>

</section>
{/*  Right Column: Glassmorphic Bid Card (Isometric Stack)  */}
<section className="flex justify-center lg:justify-end relative w-full mt-12 lg:-mt-24 cursor-pointer group/stack" style={{"perspective":"2500px"}}>
  
  {/*  Stack Container  */}
  {/*  Note: We must give it a fixed height because absolute children collapse the parent's height  */}
  <div id="isometric-stack" className="relative w-full lg:w-[145%] max-w-[900px] h-[450px] z-10 lg:translate-x-12 xl:translate-x-16 transition-transform duration-500 group-hover/stack:translate-x-8 group-hover/stack:-translate-y-4" 
       style={{"transform":"rotateX(15deg) rotateY(-20deg) rotateZ(3deg) translateY(-5%)","transformStyle":"preserve-3d"}}>
    
    {/*  Card 3 (Back)  */}
    <div className="iso-card glass-card w-full flex flex-col rounded-2xl p-8 overflow-hidden border border-bb-gold/20 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 bg-bb-gold opacity-10 blur-[100px] rounded-full translate-x-10 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bb-gold/40 to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
        <h3 className="text-white font-bold text-xl leading-tight">Procurement of 10,000 sets of Public School Textbooks and Learning Materials</h3>
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 whitespace-nowrap">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
           STATUS: EVALUATION
        </div>
      </div>
      
      <p className="text-slate-400 text-sm leading-loose relative z-10">
        Supply and delivery of educational materials for secondary public schools. Includes textbooks covering Science, Technology, and Mathematics curriculum for Grades 7-10. All materials must meet the Department of Education's latest syllabus standards.
      </p>
      
      <div className="w-full relative z-10 mt-8 mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
          <span>Bid Activity</span>
          <span className="text-blue-400">4 Active Bidders</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full relative" style={{"width":"35%"}}>
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 mt-auto">
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">LOCATION</p>
          <p className="text-slate-200 text-sm font-semibold">Cebu City</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">EST. BUDGET</p>
          <p className="text-bb-gold text-sm font-bold font-mono">₱8,200,000.00</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CLOSING DATE</p>
          <p className="text-slate-200 text-sm font-semibold">T-12 Days</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CONTRACT HASH</p>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-bb-gold-light group/hash">
            <p className="text-sm font-mono truncate">0x9a2b...4f81</p>
            <svg className="w-3.5 h-3.5 opacity-70 group-hover/hash:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    {/*  Card 2 (Middle)  */}
    <div className="iso-card glass-card w-full flex flex-col rounded-2xl p-8 overflow-hidden border border-bb-gold/20 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 bg-bb-gold opacity-10 blur-[100px] rounded-full translate-x-10 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bb-gold/40 to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
        <h3 className="text-white font-bold text-xl leading-tight">Supply and Delivery of Advanced MRI and Ultrasound Equipment for City Hospital</h3>
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 whitespace-nowrap">
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
           STATUS: AWARDING
        </div>
      </div>
      
      <p className="text-slate-400 text-sm leading-loose relative z-10">
        Procurement of critical medical diagnostic imaging equipment. Specifications include 3.0T MRI scanner with advanced neuro and cardiac packages, and two high-resolution 3D ultrasound machines. Includes installation, calibration, and 5-year maintenance contract.
      </p>
      
      <div className="w-full relative z-10 mt-8 mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
          <span>Bid Activity</span>
          <span className="text-yellow-400">12 Active Bidders</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full relative" style={{"width":"85%"}}>
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 mt-auto">
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">LOCATION</p>
          <p className="text-slate-200 text-sm font-semibold">Quezon City</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">EST. BUDGET</p>
          <p className="text-bb-gold text-sm font-bold font-mono">₱45,000,000.00</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CLOSING DATE</p>
          <p className="text-slate-200 text-sm font-semibold">T-2 Days</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CONTRACT HASH</p>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-bb-gold-light group/hash">
            <p className="text-sm font-mono truncate">0x1f2c...88d2</p>
            <svg className="w-3.5 h-3.5 opacity-70 group-hover/hash:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    {/*  Card 1 (Front - Original)  */}
    <div className="iso-card glass-card w-full flex flex-col rounded-2xl p-8 overflow-hidden border border-bb-gold/20 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 bg-bb-gold opacity-10 blur-[100px] rounded-full translate-x-10 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bb-gold/40 to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
        <h3 className="text-white font-bold text-xl leading-tight">Supply and Delivery of 50 Units High-End Desktop Computers for IT Laboratory</h3>
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 whitespace-nowrap">
           <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
           STATUS: OPEN
        </div>
      </div>
      
      <p className="text-slate-400 text-sm leading-loose relative z-10">
        We are requesting the procurement of fifty (50) units of high-end desktop computers to upgrade the existing Information Technology (IT) laboratory. Minimum Specifications per unit: Processor: At least 14-core, up to 5.1GHz (Intel Core i7 13th Gen or equivalent) Memory: 32GB DDR5 RAM Storage: 1TB NVMe PCIe 4.0 SSD Graphics: Dedicated GPU with at least 8GB GDDR6 VRAM.
      </p>
      
      <div className="w-full relative z-10 mt-8 mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
          <span>Bid Activity</span>
          <span className="text-green-400">2 Active Bidders</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full relative" style={{"width":"15%"}}>
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 mt-auto">
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">LOCATION</p>
          <p className="text-slate-200 text-sm font-semibold">Davao City</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">EST. BUDGET</p>
          <p className="text-bb-gold text-sm font-bold font-mono">₱4,500,000.00</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CLOSING DATE</p>
          <p className="text-slate-200 text-sm font-semibold">T-26 Days</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">CONTRACT HASH</p>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-bb-gold-light group/hash">
            <p className="text-sm font-mono truncate">0x7d57d4e0...17ca</p>
            <svg className="w-3.5 h-3.5 opacity-70 group-hover/hash:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
        </div>
      </div>
      
    </div>

  </div>
</section>
</div>
  {/*  SECTION A: KEY DIFFERENTIATORS  */}
  <section id="features" className="w-full mt-32 scroll-mt-24">
    <div className="text-center mb-16">
      <span className="text-bb-gold font-semibold tracking-widest text-sm uppercase mb-4 block">[ KEY DIFFERENTIATORS ]</span>
      <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Modernizing Public Acquisition</h2>
      <p className="text-slate-400 max-w-2xl mx-auto">Moving beyond legacy systems with next-generation architectural capacity.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/*  Card 1  */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group reveal-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:border-bb-gold/50">
        <div className="absolute inset-0 bg-bb-gold opacity-0 blur-[80px] rounded-full translate-x-10 -z-10 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-lg inner-card flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-bb-gold animate-pulse-glow origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">On-Chain Immutability</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">Every bid and contract hashed to Polygon blockchain. Records cannot be retroactively altered, guaranteeing absolute transparency.</p>
      </div>
      {/*  Card 2  */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group reveal-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:border-bb-gold/50" style={{"transitionDelay":"100ms"}}>
        <div className="absolute inset-0 bg-bb-gold opacity-0 blur-[80px] rounded-full translate-x-10 -z-10 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-lg inner-card flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-bb-gold animate-strike origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">AI-Powered Evaluation</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">Google Gemini rigorously scores supplier bids against project criteria. Removes human bias with instant, objective evaluation.</p>
      </div>
      {/*  Card 3  */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group reveal-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:border-bb-gold/50" style={{"transitionDelay":"200ms"}}>
        <div className="absolute inset-0 bg-bb-gold opacity-0 blur-[80px] rounded-full translate-x-10 -z-10 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-lg inner-card flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-bb-gold animate-bounce-up origin-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Market-Driven SRP</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">Aggregates past winning bids to dynamically suggest reference budgets. Ensures the SRP reflects real, local market conditions.</p>
      </div>
      {/*  Card 4  */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden group reveal-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:border-bb-gold/50" style={{"transitionDelay":"300ms"}}>
        <div className="absolute inset-0 bg-bb-gold opacity-0 blur-[80px] rounded-full translate-x-10 -z-10 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-lg inner-card flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-bb-gold animate-scan origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Frictionless Web3 Access</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">Zero crypto experience needed. Suppliers log in with email via Privy. Secure, non-custodial wallets are automatically provisioned in background.</p>
      </div>
      {/*  Card 5  */}
      <div className="glass-card rounded-2xl p-8 md:col-span-2 lg:col-span-1 relative overflow-hidden group reveal-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:border-bb-gold/50" style={{"transitionDelay":"400ms"}}>
        <div className="absolute inset-0 bg-bb-gold opacity-0 blur-[80px] rounded-full translate-x-10 -z-10 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
        <div className="w-12 h-12 rounded-lg inner-card flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-bb-gold animate-blink origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Public Transparency Portal</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10">A completely login-free portal where citizens can view all awarded contracts, winning suppliers, and direct verification links.</p>
      </div>
    </div>
  </section>

  {/*  SECTION B: THE ECOSYSTEM  */}
  <section id="ecosystem" className="w-full mt-32 scroll-mt-24">
    <div className="mb-16 text-center">
      <span className="text-bb-gold font-semibold tracking-widest text-sm uppercase mb-4 block">[ THE ECOSYSTEM ]</span>
      <h2 className="text-3xl lg:text-5xl font-bold text-white">Simplified Governance.</h2>
    </div>
    
    <div className="ecosystem-grid relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12 items-start">
      {/*  Step 1  */}
      <div className="eco-step transition-all duration-500 reveal-hidden relative z-10 glass-card rounded-2xl p-8 pt-10 mt-6">
        <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500/50">1</div>
        <h3 className="text-xl font-bold text-white mb-6">BAC (Government)</h3>
        <ul className="flex flex-col gap-4">
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Draft Acquisition Requests</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Receive supplier bids</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Use AI insights for evaluation</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Award contracts with verification</span>
          </li>
        </ul>
      </div>
      {/*  Step 2  */}
      <div className="eco-step transition-all duration-500 reveal-hidden relative z-10 glass-card rounded-2xl p-8 pt-10 mt-6 md:mt-16" style={{"transitionDelay":"150ms"}}>
        <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-bb-gold text-bb-darker font-bold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(250,204,21,0.5)] border border-yellow-400">2</div>
        <h3 className="text-xl font-bold text-white mb-6">Suppliers (Bidders)</h3>
        <ul className="flex flex-col gap-4">
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">View approved government requests</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Submit bids securely</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Track status</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Build a Verified Vendor track record</span>
          </li>
        </ul>
      </div>
      {/*  Step 3  */}
      <div className="eco-step transition-all duration-500 reveal-hidden relative z-10 glass-card rounded-2xl p-8 pt-10 mt-6 md:mt-28" style={{"transitionDelay":"300ms"}}>
        <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl inner-card border border-slate-700/50 text-white font-bold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">3</div>
        <h3 className="text-xl font-bold text-white mb-6">Public & Auditors</h3>
        <ul className="flex flex-col gap-4">
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Access Transparency Portal</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Search awarded contracts</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Verify on PolygonScan</span>
          </li>
          <li className="group/item flex items-start gap-3 cursor-pointer">
            <svg className="w-4 h-4 mt-0.5 text-bb-gold/40 group-hover/item:text-bb-gold transition-all duration-300 group-hover/item:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            <span className="text-slate-400 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300 flex-1">Download audit-ready records</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  {/*  SECTION C: CTA  */}
  <section id="portal" className="w-full mt-32 text-center relative py-20 scroll-mt-24">
    <div className="absolute inset-0 bg-bb-gold opacity-5 blur-[120px] rounded-full w-3/4 mx-auto"></div>
    <div className="relative z-10">
      <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Government Acquisition?</h2>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">Join the future of transparent, bias-free, and blockchain-secured procurement.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="btn-outline-gold px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide">VIEW TRANSPARENCY PORTAL</button>
        <button className="btn-gold px-8 py-3.5 rounded-lg font-semibold text-sm tracking-wide">REQUEST SYSTEM DEMO</button>
      </div>
    </div>
  </section>

</main>
{/*  END: Main Content  */}

{/*  BEGIN: Footer  */}
<footer className="w-full border-t border-slate-800/80 bg-[#020617] pt-16 pb-8 px-6 mt-16 relative z-20">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      
      {/*  Col 1  */}
      <div>
        <div className="flex items-center gap-2.5 mb-6 cursor-pointer group">
          <div 
            className="w-8 h-8 bg-bb-gold transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            style={{
              maskImage: 'url(/logo-gold-transparent.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/logo-gold-transparent.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
            aria-label="BlockBid Logo"
            role="img"
          ></div>
          <span className="text-2xl font-black tracking-tight text-white font-outfit leading-none mt-1">
            BLOCK<span className="text-bb-gold">BID</span>
          </span>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">Institutional-grade blockchain infrastructure for bias-free government procurement. Built for absolute public accountability.</p>
        <div className="flex gap-4 text-slate-500">
          <svg className="w-5 h-5 cursor-pointer hover:text-bb-gold transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          <svg className="w-5 h-5 cursor-pointer hover:text-bb-gold transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </div>
      </div>

      {/*  Col 2  */}
      <div>
        <h4 className="text-bb-gold font-semibold tracking-widest text-xs uppercase mb-6">[ SOLUTIONS ]</h4>
        <ul className="space-y-4 text-sm text-slate-400">
          <li><a href="#" className="hover:text-white transition-colors">BAC Portal</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Supplier Dashboard</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Transparency Portal</a></li>
        </ul>
      </div>

      {/*  Col 3  */}
      <div>
        <h4 className="text-bb-gold font-semibold tracking-widest text-xs uppercase mb-6">[ TECHNICAL ]</h4>
        <ul className="space-y-4 text-sm text-slate-400">
          <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Smart Contracts</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Polygon Explorer</a></li>
        </ul>
      </div>

      {/*  Col 4  */}
      <div>
        <h4 className="text-bb-gold font-semibold tracking-widest text-xs uppercase mb-6">[ PROJECT ]</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Cor Jesu College<br />
          BSIT Capstone 2025-2026<br />
          Davao del Sur, PH
        </p>
      </div>
      
    </div>
    
    {/*  Bottom Bar  */}
    <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-slate-500 text-xs font-mono">© 2026 BLOCKBID PROTOCOL. BUILT FOR THE PUBLIC GOOD.</p>
      <div className="flex gap-6 text-xs text-bb-gold font-semibold tracking-wider">
        <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
        <a href="#" className="hover:text-white transition-colors">TERMS</a>
        <a href="#" className="hover:text-white transition-colors">SECURITY</a>
      </div>
    </div>
  </div>
</footer>
{/*  END: Footer  */}
{/*  Isometric Carousel Javascript  */}


        </div>
    );
}
