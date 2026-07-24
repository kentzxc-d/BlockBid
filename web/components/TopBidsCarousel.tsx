"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, FireIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

interface TopBidsCarouselProps {
  location: string | null;
  onOpenLocationModal: () => void;
}

const MOCK_BIDS = [
  { id: 1, title: "₱5M IT Equipment Supply", category: "Technology", label: "URGENT_REQ", color: "from-secondary to-slate-900" },
  { id: 2, title: "₱2.5M Medical Supplies", category: "Healthcare", label: "HIGH_VALUE", color: "from-slate-900 to-slate-800" },
  { id: 3, title: "₱1M Office Renovations", category: "Infrastructure", label: "FEATURED_B", color: "from-secondary to-slate-800" },
];

export default function TopBidsCarousel({ location, onOpenLocationModal }: TopBidsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MOCK_BIDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [location]);

  if (!location) {
    return (
      <div 
        onClick={onOpenLocationModal}
        className="relative overflow-hidden rounded-none bg-secondary cursor-pointer group mb-10 shadow-none border border-border-inverse"
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-none bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <MapPinIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white tracking-tight uppercase">
                Find local opportunities
              </h2>
              <p className="text-text-inverse-muted mt-1 font-mono text-xs uppercase tracking-widest">
                Configure node location to unlock regional solicitations.
              </p>
            </div>
          </div>
          <button className="whitespace-nowrap px-6 py-3 rounded-md bg-primary text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-colors flex items-center gap-2 border border-transparent">
            Set_Location <ArrowRightIcon className="w-4 h-4 stroke-2" />
          </button>
        </div>
      </div>
    );
  }

  const bid = MOCK_BIDS[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-none mb-10 border border-border-inverse group min-h-[160px] md:min-h-[180px] bg-secondary">
      {/* Background Slides */}
      {MOCK_BIDS.map((b, index) => (
        <div 
          key={b.id}
          className={`absolute inset-0 bg-gradient-to-r ${b.color} transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative h-full p-8 md:p-10 flex flex-col justify-center border-l-4 border-l-primary">
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-primary text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                <FireIcon className="w-3.5 h-3.5 text-white" />
                [{b.label}]
              </span>
              <span className="text-text-inverse-muted text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-text-inverse-muted" /> {location}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight uppercase leading-tight">
                  {b.title}
                </h2>
                <p className="text-text-inverse-muted mt-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-primary"></span>
                  Category: {b.category}
                </p>
              </div>
              <button className="whitespace-nowrap px-8 py-3 rounded-md bg-white text-text-main font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center gap-2 z-20 border border-border">
                View_Details <ArrowRightIcon className="w-4 h-4 stroke-2" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-0 left-0 flex items-center z-20 w-full h-1 bg-black/20">
        {MOCK_BIDS.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-full transition-all duration-300 flex-1 ${
              index === currentSlide ? "bg-primary" : "bg-transparent hover:bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
