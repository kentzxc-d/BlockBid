"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, FireIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

interface TopBidsCarouselProps {
  location: string | null;
  onOpenLocationModal: () => void;
}

const MOCK_BIDS = [
  { id: 1, title: "₱5M IT Equipment Supply", category: "Technology", label: "URGENT", color: "from-blue-600 to-indigo-600" },
  { id: 2, title: "₱2.5M Medical Supplies", category: "Healthcare", label: "HIGH VALUE", color: "from-emerald-500 to-teal-600" },
  { id: 3, title: "₱1M Office Renovations", category: "Infrastructure", label: "FEATURED", color: "from-orange-500 to-red-600" },
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 cursor-pointer group mb-10 shadow-lg border border-slate-700/50"
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-inner">
              <MapPinIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white tracking-tight drop-shadow-md">
                Find top bids near you
              </h2>
              <p className="text-slate-300 mt-1 font-medium text-sm md:text-base">
                Set your operating region to unlock high-value local solicitations.
              </p>
            </div>
          </div>
          <button className="whitespace-nowrap px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors shadow-xl shadow-white/10 flex items-center gap-2">
            Set Location <ArrowRightIcon className="w-4 h-4 stroke-2" />
          </button>
        </div>
      </div>
    );
  }

  const bid = MOCK_BIDS[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-10 shadow-2xl group min-h-[160px] md:min-h-[180px]">
      {/* Background Slides */}
      {MOCK_BIDS.map((b, index) => (
        <div 
          key={b.id}
          className={`absolute inset-0 bg-gradient-to-r ${b.color} transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-black/10 rounded-full blur-3xl"></div>
          
          <div className="relative h-full p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm">
                <FireIcon className="w-3.5 h-3.5 text-yellow-300" />
                {b.label}
              </span>
              <span className="text-white/90 text-sm font-bold flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-white/70" /> {location}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight drop-shadow-md leading-tight">
                  {b.title}
                </h2>
                <p className="text-white/90 mt-1 font-medium text-sm md:text-base">
                  New high-value opportunity in {b.category}.
                </p>
              </div>
              <button className="whitespace-nowrap px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:scale-105 transition-transform shadow-xl flex items-center gap-2 z-20">
                View Details <ArrowRightIcon className="w-4 h-4 stroke-2" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {MOCK_BIDS.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
