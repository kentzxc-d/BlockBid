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
      <div className="mb-8 border-b border-border pb-6">
        <Link 
          href="/dashboard/procurements" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-2" /> Back to Solicitations
        </Link>
        <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
          [ SUBMIT_PROPOSAL: <span className="text-primary">{params.id || MOCK_PROCUREMENT.id}</span> ]
        </h1>
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
          Enter structured bid data. System will auto-format payload for ledger execution.
        </p>
      </div>

      <div className="bg-surface rounded-md p-6 md:p-8 border border-border shadow-sm mb-8">
        
        <div className="mb-8 p-5 bg-gray-50 rounded-md border border-border">
          <h3 className="font-heading font-bold text-text-main text-lg mb-2 uppercase">{MOCK_PROCUREMENT.title}</h3>
          <p className="font-mono text-xs text-text-muted leading-relaxed mb-4">{MOCK_PROCUREMENT.description}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md shadow-sm">
            EST_BUDGET: {MOCK_PROCUREMENT.budget}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-text-main font-heading uppercase tracking-tight border-b border-border pb-3">
            Payload Details
          </h2>
          
          {fields.map((field, index) => (
            <div key={field.id} className="relative bg-surface p-5 rounded-md border border-border group transition-colors focus-within:border-text-main hover:border-text-muted">
              {field.isCustom ? (
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="ENTER_FIELD_KEY"
                    value={field.label}
                    onChange={(e) => updateCustomLabel(field.id, e.target.value)}
                    className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-xs font-mono font-bold tracking-widest text-text-main uppercase focus:outline-none focus:border-text-main transition-all placeholder:text-slate-300"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => removeField(field.id)}
                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors"
                    title="Remove field"
                  >
                    <TrashIcon className="w-4 h-4 stroke-2" />
                  </button>
                </div>
              ) : (
                <label className="block text-xs font-mono font-bold tracking-widest text-text-main uppercase mb-2">
                  {field.label} <span className="text-primary">*</span>
                </label>
              )}
              
              <textarea
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={`INPUT_${field.label ? field.label.toUpperCase().replace(/\s+/g, '_') : 'DATA'}...`}
                className="w-full bg-surface border border-border rounded-md p-4 text-sm font-mono text-text-main focus:outline-none focus:border-text-main transition-all resize-y min-h-[120px] placeholder:text-slate-300"
                required
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomField}
            className="w-full py-4 rounded-md border-2 border-dashed border-border text-text-muted font-mono text-xs font-bold tracking-widest uppercase hover:border-text-main hover:text-text-main hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4 stroke-2" /> Add_Custom_Field
          </button>

          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-text-main text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-text-main shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4 stroke-2" /> EXECUTE_PROPOSAL
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface rounded-md w-full max-w-md border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-t-4 border-t-primary">
              <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <CheckBadgeIcon className="w-8 h-8 text-primary stroke-2" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text-main mb-2 uppercase tracking-tight">TRANSACTION_SUCCESS</h3>
              <p className="font-mono text-xs text-text-muted mb-8 leading-relaxed uppercase tracking-widest">
                Payload formatted and transmitted anonymously to procurement ledger.
              </p>
              
              <Link 
                href="/dashboard/procurements" 
                className="inline-flex w-full justify-center py-3.5 bg-text-main text-white rounded-md font-mono text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors shadow-sm"
              >
                RETURN_TO_LEDGER
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
