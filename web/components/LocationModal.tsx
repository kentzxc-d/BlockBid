"use client";

import { useState } from "react";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string) => Promise<void> | void;
}

const REGIONS = [
  "Metro Manila",
  "Cebu",
  "Davao",
  "Central Luzon",
  "Calabarzon",
  "Western Visayas",
  "Northern Mindanao"
];

export default function LocationModal({ isOpen, onClose, onSave }: LocationModalProps) {
  const [selected, setSelected] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    await onSave(selected);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-primary">
            <MapPinIcon className="w-6 h-6 stroke-2" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-800 tracking-tight">Set Your Region</h2>
            <p className="text-sm text-slate-500 mt-0.5">Find the highest value bids near you.</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelected(region)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  selected === region 
                    ? "border-primary bg-blue-50/50 shadow-sm" 
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className={`font-bold ${selected === region ? "text-primary" : ""}`}>
                  {region}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected === region ? "border-primary" : "border-slate-300"
                }`}>
                  {selected === region && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!selected || isSaving}
            className="w-full mt-6 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-base"
          >
            {isSaving ? "Saving..." : "Confirm Location"}
          </button>
        </div>

      </div>
    </div>
  );
}
