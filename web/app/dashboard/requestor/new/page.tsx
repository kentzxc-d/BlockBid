"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  Bars3Icon, 
  TrashIcon, 
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

// A set of colors to uniquely identify criteria visually
const CRITERIA_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500"
];

export default function CreateProcurementPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  
  // Dynamic Criteria State
  const [criteria, setCriteria] = useState([
    { id: 1, name: "Specs/Quality", weight: 40 },
    { id: 2, name: "Price", weight: 30 },
    { id: 3, name: "Supplier Reputation", weight: 20 },
    { id: 4, name: "Delivery Time", weight: 10 },
  ]);

  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const isValid = totalWeight === 100 && title.trim().length > 0;

  const handleAddCriteria = () => {
    setCriteria([...criteria, { id: Date.now(), name: "", weight: 0 }]);
  };

  const handleCriteriaChange = (id: number, field: string, value: string | number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveCriteria = (id: number) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  return (
    <div className="py-10 px-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/user" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight mb-2">Create Item Procurement</h1>
        <p className="text-text-muted text-sm md:text-base">
          Define the requirements and dynamic criteria for the new solicitation.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Basic Info */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text-main mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">1</span>
            Basic Information
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Item/Project Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Procurement of 500 Desktop Computers"
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-main font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-sm font-semibold text-text-main">Description & Requirements</label>
                <span className="text-xs font-medium text-slate-400">{description.length}/1000 characters</span>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe the items needed, minimum specs, and delivery location..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-main font-medium resize-none"
              />
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Include specs, quantity, delivery timeline, and other vital details.</p>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Estimated Budget</label>
              <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-semibold select-none">₱</span>
                </div>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="5,000,000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-main font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Evaluation Criteria */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text-main mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">2</span>
            Evaluation Criteria
          </h2>

          <div className="mb-8">
            {/* Total Weight Indicator */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border mb-4 transition-colors ${totalWeight === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div>
                <p className={`font-bold ${totalWeight === 100 ? 'text-emerald-800' : 'text-red-800'}`}>
                  Total Weight Distribution
                </p>
                <p className={`text-sm font-medium ${totalWeight === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalWeight === 100 
                    ? "Perfect! Weights equal 100%." 
                    : `Currently at ${totalWeight}%. You must adjust weights to equal exactly 100%.`}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <span className={`text-3xl font-black ${totalWeight === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalWeight}%
                </span>
                {totalWeight === 100 ? (
                  <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>

            {/* Visual Stacked Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {criteria.map((c, i) => (
                <div 
                  key={c.id} 
                  className={`h-full ${CRITERIA_COLORS[i % CRITERIA_COLORS.length]} transition-all duration-300 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(0, c.weight))}%` }}
                  title={`${c.name}: ${c.weight}%`}
                />
              ))}
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-4 mb-6">
            {criteria.map((c, index) => {
              const colorClass = CRITERIA_COLORS[index % CRITERIA_COLORS.length];
              return (
                <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 group hover:bg-slate-50 transition-colors">
                  
                  {/* Drag Handle & Color Dot */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Bars3Icon className="w-5 h-5 text-slate-300 cursor-grab hover:text-slate-500 shrink-0" />
                    <div className={`w-3 h-3 rounded-full ${colorClass} shrink-0 shadow-sm`} />
                    <input 
                      type="text" 
                      value={c.name}
                      onChange={(e) => handleCriteriaChange(c.id, 'name', e.target.value)}
                      placeholder="e.g. Technical Specs"
                      className="flex-1 sm:w-48 px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold bg-white"
                    />
                  </div>

                  {/* Slider & Number */}
                  <div className="flex-1 flex items-center gap-4 w-full px-2 sm:px-0">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={c.weight}
                      onChange={(e) => handleCriteriaChange(c.id, 'weight', parseInt(e.target.value) || 0)}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="relative w-20 shrink-0">
                      <input 
                        type="number" 
                        value={c.weight}
                        onChange={(e) => handleCriteriaChange(c.id, 'weight', parseInt(e.target.value) || 0)}
                        className="w-full pl-3 pr-6 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold bg-white text-right"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveCriteria(c.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-red-50 transition-colors shrink-0"
                    title="Remove Criteria"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Criteria Button */}
          <button 
            type="button" 
            onClick={handleAddCriteria} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-semibold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            Add Evaluation Criteria
          </button>
        </section>

        {/* Publish Action */}
        <div className="pt-4">
          <button 
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
              isValid 
                ? "bg-primary text-white hover:bg-primary-hover hover:shadow-md" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            disabled={!isValid}
          >
            {isValid ? <CheckCircleIcon className="w-6 h-6" /> : null}
            Publish Procurement Request
          </button>
          {!isValid && (
            <p className="text-center text-sm font-semibold text-danger mt-3">
              {totalWeight !== 100 
                ? "Total criteria weight must equal exactly 100% to publish."
                : "Please fill in the project title."}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
