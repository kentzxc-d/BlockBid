"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const MOCK_PROCUREMENT = {
  id: "REQ-2026-081",
  title: "100 Laptops for New Department",
  description: "Require 100 high-performance laptops. Minimum specs: 16GB RAM, 512GB SSD, Intel i7 or equivalent. Must include 3-year warranty.",
  budget: "₱ 8,000,000",
  criteria: [
    { name: "Price", weight: 40, type: "number" },
    { name: "Technical Specs", weight: 30, type: "textarea" },
    { name: "Warranty & Support", weight: 20, type: "textarea" },
    { name: "Delivery Time", weight: 10, type: "text" }
  ]
};

type FieldData = {
  id: string;
  label: string;
  value: string;
  isCustom: boolean;
};

export default function SubmitBidPage({ params }: { params: { id: string } }) {
  // Initialize fields based on criteria
  const [fields, setFields] = useState<FieldData[]>(
    MOCK_PROCUREMENT.criteria.map((c, i) => ({
      id: `criteria-${i}`,
      label: c.name,
      value: "",
      isCustom: false
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFieldChange = (id: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  const addCustomField = () => {
    setFields([...fields, {
      id: `custom-${Date.now()}`,
      label: "",
      value: "",
      isCustom: true
    }]);
  };

  const updateCustomLabel = (id: string, newLabel: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call and formatting
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="py-10 px-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/procurements" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Solicitations
        </Link>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight mb-2">
          Submit Proposal: <span className="text-primary">{params.id || MOCK_PROCUREMENT.id}</span>
        </h1>
        <p className="text-text-muted text-sm md:text-base">
          Fill out the structured fields below. Our system will automatically format this into a standardized document for evaluation.
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm mb-8">
        <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-1">{MOCK_PROCUREMENT.title}</h3>
          <p className="text-sm text-blue-800/80 mb-2">{MOCK_PROCUREMENT.description}</p>
          <div className="text-sm font-bold text-slate-700">Estimated Budget: {MOCK_PROCUREMENT.budget}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold text-text-main font-heading border-b border-border pb-3">Proposal Details</h2>
          
          {fields.map((field, index) => (
            <div key={field.id} className="relative bg-slate-50 p-5 rounded-xl border border-slate-200 group transition-colors focus-within:border-primary/40 focus-within:bg-white">
              {field.isCustom ? (
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Enter Field Name (e.g., Value Added Services)"
                    value={field.label}
                    onChange={(e) => updateCustomLabel(field.id, e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => removeField(field.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove field"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {field.label} <span className="text-red-500">*</span>
                </label>
              )}
              
              <textarea
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={`Enter your ${field.label ? field.label.toLowerCase() : 'details'}...`}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-y min-h-[100px]"
                required
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomField}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Add Additional Field
          </button>

          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-sm shadow-blue-500/25 flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-5 h-5" /> Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b-4 border-emerald-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <CheckBadgeIcon className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="font-black text-2xl text-text-main mb-2">Proposal Submitted!</h3>
              <p className="text-slate-500 mb-6 font-medium">
                Your structured inputs have been automatically formatted and submitted anonymously to the procurement committee.
              </p>
              
              <Link 
                href="/dashboard/procurements" 
                className="inline-flex w-full justify-center py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                Back to Solicitations
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
