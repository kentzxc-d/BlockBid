import Script from 'next/script';
import Link from 'next/link';
import HeroAuthButtons from '@/components/HeroAuthButtons';
import LoginButton from '@/components/LoginButton';
import GetStartedButton from '@/components/GetStartedButton';

// Extend the IntrinsicElements to support iconify-icon
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { icon: string };
    }
  }
}

export default function Home() {
  return (
    <>
      <Script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" strategy="afterInteractive" />
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fira%2BCode:wght@100;200;300;400;500;600;700;800;900&display=swap');

        :root {
            --background: #0B132B;
            --surface: #1A1625;
            --accent: #FBBF24;
            --accent-muted: #C5A059;
            --text-primary: #FFFFFF;
            --text-secondary: #94A3B8;
        }

        .landing-body {
            font-family: 'Inter', sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
        }

        .landing-heading {
            font-family: 'Outfit', sans-serif;
            letter-spacing: -0.03em;
        }

        .mono-label {
            font-family: 'Fira Code', monospace;
            letter-spacing: 0.1em;
            font-size: 0.75rem;
        }

        .glass-header {
            background: #0B132B;
            border-bottom: 1px solid rgba(74, 85, 104, 0.3);
        }

        .hero-gradient {
            background: linear-gradient(135deg, #130B29 0%, #0B132B 100%);
        }

        .hex-watermark {
            background-image: radial-gradient(circle at 2px 2px, rgba(197, 160, 89, 0.05) 1px, transparent 0);
            background-size: 32px 32px;
        }

        .card-institutional {
            background-color: var(--surface);
            border: 1px solid rgba(197, 160, 89, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-institutional:hover {
            border-color: var(--accent-muted);
            transform: translateY(-4px);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .gold-glow:hover {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
        }
        `
      }} />

      <div className="landing-body min-h-screen bg-[#0B132B] text-white flex flex-col">
        {/* Navigation */}
        <header className="sticky top-0 z-50 glass-header border-b border-slate-800/50 bg-[#0B132B]/90 backdrop-blur-md">
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
                
                {/* Left: Logo */}
                <div className="flex items-center gap-3 z-10">
                    <a href="/" className="flex items-center gap-3 group">
                        <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/brand/56c94a00-09c1-4de7-9ad9-b1855552e0a9/assets/487fd5ae-53ad-44f8-9459-afa4773fbe93.png" alt="BlockBid Logo" className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-105 transition-transform" />
                        <span className="text-xl md:text-2xl font-black text-white tracking-tight">BLOCK<span className="text-[#FBBF24]">BID</span></span>
                    </a>
                </div>
                
                {/* Center: Nav Links */}
                <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
                    <a href="#features" className="mono-label text-slate-400 hover:text-white transition-colors">[ TECH ]</a>
                    <a href="#how-it-works" className="mono-label text-slate-400 hover:text-white transition-colors">[ WORKFLOWS ]</a>
                    <a href="/portal" className="mono-label text-[#FBBF24] font-bold hover:text-white transition-colors">[ PUBLIC PORTAL ]</a>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-6 z-10">
                    <GetStartedButton />
                </div>
            </nav>
        </header>

        <main className="flex-1 relative">
            {/* Hero Section */}
            <section className="relative pt-24 pb-40 overflow-hidden hero-gradient hex-watermark">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="w-full lg:w-[50%] xl:w-[55%] relative z-10 pr-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#C5A059]/30 bg-[#C5A059]/5 text-[#C5A059] mono-label font-bold uppercase mb-8">
                            [ 0x01. POLYGON AMOY DEPLOYED ]
                        </div>
                        <h1 className="landing-heading text-6xl md:text-[75px] font-black text-white mb-6 leading-[1.05] tracking-tight italic [text-wrap:balance]">
                            On-Chain <span className="text-[#FBBF24] not-italic">Acquisition</span> for Government Integrity.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed font-light max-w-lg">
                            Eliminate corruption, bias, and red tape with cryptographically-secured government procurement powered by AI and blockchain.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 items-center">
                            <a href="/bac" id="hero-bac-btn" className="flex items-center justify-center gap-3 bg-[#0B132B] border-2 border-[#FBBF24] text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-[#FBBF24]/5 transition-all transform hover:-translate-y-1 gold-glow uppercase">
                                <iconify-icon icon="lucide:shield-check" className="text-lg text-[#FBBF24]"></iconify-icon>
                                Access BAC Portal
                            </a>
                            <a href="/suppliers" id="hero-supplier-btn" className="flex items-center justify-center gap-2 bg-transparent border-2 border-[#FBBF24] text-[#FBBF24] px-8 py-4 rounded-xl text-base font-bold hover:bg-[#FBBF24]/10 transition-all uppercase">
                                Supplier Dashboard
                            </a>
                        </div>
                    </div>
                </div>

                {/* Institutional UI */}
                <div className="absolute top-24 right-[-8%] w-1/2 hidden lg:block opacity-90 z-20">
                    <div className="bg-[#1A1625] rounded-3xl border border-[#C5A059]/20 p-10 shadow-2xl rotate-[1deg] hover:rotate-0 hover:scale-[1.02] transition-all duration-500 cursor-default">
                        <div className="flex items-center gap-[200px] mb-10">
                            <div>
                                <h4 className="landing-heading text-xl font-bold text-white tracking-tight italic">Award Verification</h4>
                                <p className="mono-label text-slate-500 mt-1">[ TX_ID: 0x4f...a2e8 ]</p>
                            </div>
                            <span className="px-4 py-1 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 rounded-full text-xs font-bold mono-label uppercase shrink-0">VERIFIED ON-CHAIN</span>
                        </div>
                        <div className="space-y-4 font-mono text-sm text-slate-400 bg-[#0B132B] p-6 rounded-xl border border-slate-800">
                            <div className="flex gap-4"><span className="text-[#FBBF24]">STAMP:</span> <span>BLOCKBID_PROTO_V1</span></div>
                            <div className="flex gap-4"><span className="text-[#FBBF24]">BIDDER:</span> <span>SUPPLIER_0X9B1...</span></div>
                            <div className="flex gap-4"><span className="text-[#FBBF24]">AI_SCORE:</span> <span>98.4 / 100</span></div>
                            <div className="flex gap-4"><span className="text-[#FBBF24]">NETWORK:</span> <span className="text-blue-400">POLYGON_AMOY</span></div>
                        </div>
                        <div className="mt-8 text-center">
                             <span className="text-[10px] mono-label text-slate-600 uppercase tracking-widest italic">Immutable Record - Cor Jesu College Capstone 2025</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid (Real Differentiators) */}
            <section id="features" className="py-32 bg-[#1A1625] border-y border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="mono-label text-[#C5A059] uppercase">[ Key Differentiators ]</span>
                        <h2 className="landing-heading text-3xl md:text-4xl font-extrabold text-white mt-4 mb-6">Modernizing Public Acquisition</h2>
                        <p className="text-base text-slate-400 font-light">Moving beyond legacy systems with next-generation architectural capacity.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="card-institutional p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-[#FBBF24]/10 text-[#FBBF24] rounded-xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:database" className="text-2xl"></iconify-icon>
                            </div>
                            <h3 className="landing-heading text-lg font-bold text-white mb-3">On-Chain Immutability</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Every bid and contract hashed to Polygon blockchain. Records cannot be retroactively altered, guaranteeing absolute transparency and public accountability.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="card-institutional p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:brain-circuit" className="text-2xl"></iconify-icon>
                            </div>
                            <h3 className="landing-heading text-lg font-bold text-white mb-3">AI-Powered Evaluation</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Google Gemini rigorously scores supplier bids against project criteria. Removes human bias with instant, objective evaluation and reasoning.
                            </p>
                        </div>
                        {/* Card 3 */}
                        <div className="card-institutional p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:area-chart" className="text-2xl"></iconify-icon>
                            </div>
                            <h3 className="landing-heading text-lg font-bold text-white mb-3">Market-Driven SRP</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Aggregates past winning bids to dynamically suggest reference budgets. Ensures the SRP reflects real, local market conditions, not static APIs.
                            </p>
                        </div>
                        {/* Card 4 */}
                        <div className="card-institutional p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:fingerprint" className="text-2xl"></iconify-icon>
                            </div>
                            <h3 className="landing-heading text-lg font-bold text-white mb-3">Frictionless Web3 Access</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Zero crypto experience needed. Suppliers log in with email via Privy. Secure, non-custodial wallets are automatically provisioned in background.
                            </p>
                        </div>
                        {/* Card 5 */}
                        <div className="card-institutional p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:globe-2" className="text-2xl"></iconify-icon>
                            </div>
                            <h3 className="landing-heading text-lg font-bold text-white mb-3">Public Transparency Portal</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                A completely login-free portal where citizens can view all awarded contracts, winning suppliers, bid amounts, and direct verification links to PolygonScan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works (Workflow) */}
            <section id="how-it-works" className="py-32 bg-[#0B132B]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20">
                        <span className="mono-label text-[#C5A059] uppercase">[ The Ecosystem ]</span>
                        <h2 className="landing-heading text-3xl md:text-4xl font-extrabold text-white mt-4">Simplified Governance.</h2>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="space-y-5">
                            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-lg font-bold text-lg">1</div>
                            <h4 className="landing-heading text-xl font-bold italic text-white">BAC (Government)</h4>
                            <p className="text-slate-400 font-light leading-relaxed text-sm">Draft Acquisition Requests → Receive supplier bids → Use AI insights for evaluation → Award contracts with cryptographic verification.</p>
                        </div>
                        <div className="space-y-5">
                            <div className="w-10 h-10 bg-[#FBBF24] text-[#0B132B] flex items-center justify-center rounded-lg font-bold text-lg">2</div>
                            <h4 className="landing-heading text-xl font-bold italic text-white">Suppliers (Bidders)</h4>
                            <p className="text-slate-400 font-light leading-relaxed text-sm">View approved government requests → Submit bids securely → Track status → Build a permanent Verified Vendor track record.</p>
                        </div>
                        <div className="space-y-5">
                            <div className="w-10 h-10 bg-slate-700 flex items-center justify-center rounded-lg font-bold text-lg">3</div>
                            <h4 className="landing-heading text-xl font-bold italic text-white">Public & Auditors</h4>
                            <p className="text-slate-400 font-light leading-relaxed text-sm">Access Transparency Portal → Search awarded contracts → Verify on PolygonScan → Download audit-ready records.</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Final CTA */}
            <section className="py-32 bg-[#1A1625] relative overflow-hidden border-t border-slate-800">
                <div className="absolute inset-0 hex-watermark opacity-20"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="landing-heading text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white">Ready to Transform Government Acquisition?</h2>
                    <p className="text-lg text-slate-400 mb-10 font-light leading-relaxed">Join the future of transparent, bias-free, and blockchain-secured procurement.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-5">
                        <Link href="/portal" id="final-cta-portal" className="bg-transparent border-2 border-slate-700 hover:bg-slate-800/50 text-white px-8 py-4 rounded-lg text-base font-bold transition-all uppercase">View Transparency Portal</Link>
                        <a href="#" id="final-cta-demo" className="bg-[#FBBF24] hover:bg-[#FCD34D] text-[#0B132B] hover:text-[#0B132B] px-8 py-4 rounded-lg text-base font-bold transition-all transform hover:scale-105 gold-glow uppercase">Request System Demo</a>
                    </div>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#050505] pt-24 pb-12 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-24">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/brand/56c94a00-09c1-4de7-9ad9-b1855552e0a9/assets/487fd5ae-53ad-44f8-9459-afa4773fbe93.png" alt="BlockBid Logo" className="w-6 h-6" />
                            <span className="text-xl font-black uppercase tracking-tighter">Block<span className="text-[#FBBF24]">Bid</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">
                            Institutional-grade blockchain infrastructure for bias-free government procurement. Built for absolute public accountability.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" id="footer-twitter-btn" className="text-slate-600 hover:text-[#FBBF24] transition-colors"><iconify-icon icon="lucide:twitter" className="text-2xl"></iconify-icon></a>
                            <a href="#" id="footer-linkedin-btn" className="text-slate-600 hover:text-[#FBBF24] transition-colors"><iconify-icon icon="lucide:linkedin" className="text-2xl"></iconify-icon></a>
                            <a href="#" id="footer-github-btn" className="text-slate-600 hover:text-[#FBBF24] transition-colors"><iconify-icon icon="lucide:github" className="text-2xl"></iconify-icon></a>
                        </div>
                    </div>
                    
                    <div>
                        <h5 className="font-bold text-white mb-8 mono-label uppercase tracking-widest">[ Solutions ]</h5>
                        <ul className="space-y-5 text-sm text-slate-500">
                            <li><a href="/bac" id="f-link-bac" className="hover:text-white transition-colors">BAC Portal</a></li>
                            <li><a href="/suppliers" id="f-link-suppliers" className="hover:text-white transition-colors">Supplier Dashboard</a></li>
                            <li><a href="/portal" id="f-link-transparency" className="hover:text-white transition-colors">Transparency Portal</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-8 mono-label uppercase tracking-widest">[ Technical ]</h5>
                        <ul className="space-y-5 text-sm text-slate-500">
                            <li><a href="#" id="f-link-docs" className="hover:text-white transition-colors">API Documentation</a></li>
                            <li><a href="#" id="f-link-contracts" className="hover:text-white transition-colors">Smart Contracts</a></li>
                            <li><a href="#" id="f-link-explorer" className="hover:text-white transition-colors">Polygon Explorer</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-8 mono-label uppercase tracking-widest">[ Project ]</h5>
                        <div className="space-y-5">
                            <p className="text-xs text-slate-500">
                                Cor Jesu College<br/>
                                BSIT Capstone 2025-2026<br/>
                                Davao del Sur, PH
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-600 mono-label uppercase font-medium italic">© 2024 BLOCKBID PROTOCOL. BUILT FOR THE PUBLIC GOOD.</p>
                    <div className="flex gap-10 text-xs text-slate-600 mono-label uppercase">
                        <a href="#" id="footer-privacy-link" className="hover:text-[#FBBF24]">Privacy</a>
                        <a href="#" id="footer-terms-link" className="hover:text-[#FBBF24]">Terms</a>
                        <a href="#" id="footer-security-link" className="hover:text-[#FBBF24]">Security</a>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}
