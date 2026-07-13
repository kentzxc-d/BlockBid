"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { 
  ArrowLeftIcon, 
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
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = usePrivy();
  
  // Dynamic Criteria State
  const [criteria, setCriteria] = useState([
    { id: 1, name: "Specs/Quality", weight: 40 },
    { id: 2, name: "Price", weight: 30 },
    { id: 3, name: "Supplier Reputation", weight: 20 },
    { id: 4, name: "Delivery Time", weight: 10 },
  ]);

  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const isValid = totalWeight === 100 && title.trim().length > 0 && deadline.trim().length > 0;

  const handleAddCriteria = () => {
    setCriteria([...criteria, { id: Date.now(), name: "", weight: 0 }]);
  };

  const handleCriteriaChange = (id: number, field: string, value: string | number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveCriteria = (id: number) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleDistributeEvenly = () => {
    if (criteria.length === 0) return;
    const equalWeight = Math.floor(100 / criteria.length);
    let remainder = 100 % criteria.length;

    const newCriteria = criteria.map((c, index) => {
      let weight = equalWeight;
      if (remainder > 0) {
        weight += 1;
        remainder -= 1;
      }
      return { ...c, weight };
    });
    setCriteria(newCriteria);
  };

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setIsSubmitting(true);

    try {
      // Create deadline as ISO string (end of the selected day)
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(23, 59, 59, 999);

      const payload = {
        requestor_id: user.id,
        title,
        description,
        deadline: deadlineDate.toISOString(),
        criteria: criteria.map(c => ({ name: c.name, weight: c.weight }))
      };

      const res = await fetch("/api/procurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      // Success
      router.push("/dashboard/agency");
    } catch (err) {
      console.error(err);
      alert("Error publishing procurement. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 px-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <Link 
          href="/dashboard/agency" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-text-muted hover:text-text-main transition-colors uppercase mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Workspace
        </Link>
        <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">[ POST_PROCUREMENT ]</h1>
        <p className="text-sm font-mono font-bold text-text-muted tracking-widest uppercase">
          Define_Requirements_&_Evaluation_Matrix
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Basic Info */}
        <div className="bg-surface border border-border p-8">
          <h2 className="text-sm font-mono font-bold text-primary tracking-widest uppercase mb-8">
            [ 0x01_BASIC_INFO ]
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-2">Item/Project Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PROCUREMENT OF 500 DESKTOP COMPUTERS"
                className="w-full px-4 py-3 bg-background border border-border rounded-none focus:outline-none focus:border-text-main hover:border-text-main transition-colors text-text-main font-mono text-sm font-bold tracking-wider placeholder:text-text-muted/50 uppercase"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-2">Description & Requirements</label>
                <span className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">{description.length}/1000</span>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe the items needed, minimum specs, and delivery location..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-none focus:outline-none focus:border-text-main hover:border-text-main transition-colors text-text-main font-mono text-sm font-bold tracking-wider placeholder:text-text-muted/50 uppercase resize-none"
              />
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-2">Estimated Budget (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-text-muted font-mono font-bold text-sm tracking-widest">₱</span>
                  </div>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5000000"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-none focus:outline-none focus:border-text-main hover:border-text-main transition-colors text-text-main font-mono text-sm font-bold tracking-wider placeholder:text-text-muted/50"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted tracking-widest uppercase mb-2">Submission Deadline</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-none focus:outline-none focus:border-text-main hover:border-text-main transition-colors text-text-main font-mono text-sm font-bold tracking-wider uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Evaluation Criteria */}
        <div className="bg-surface border border-border p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-sm font-mono font-bold text-primary tracking-widest uppercase">
              [ 0x02_EVALUATION_MATRIX ]
            </h2>
            <button 
              type="button" 
              onClick={handleDistributeEvenly}
              className="px-4 py-2 bg-background border border-border hover:border-text-main transition-colors text-xs font-mono font-bold tracking-widest text-text-main uppercase"
            >
              Distribute_Evenly
            </button>
          </div>

          <div className="mb-8">
            {/* Total Weight Indicator */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 border transition-colors ${totalWeight === 100 ? 'bg-primary/5 border-primary text-primary' : 'bg-danger/5 border-danger text-danger'}`}>
              <div>
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-1">
                  TOTAL_WEIGHT_DISTRIBUTION
                </p>
                <p className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-80">
                  {totalWeight === 100 
                    ? "[ STATUS: VALID ] Weights equal 100%." 
                    : `[ STATUS: INVALID ] Currently at ${totalWeight}%. Must equal exactly 100%.`}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <span className="text-3xl font-heading font-black tracking-tighter">
                  {totalWeight}%
                </span>
                {totalWeight === 100 ? (
                  <CheckCircleIcon className="w-8 h-8 stroke-2" />
                ) : (
                  <ExclamationCircleIcon className="w-8 h-8 stroke-2" />
                )}
              </div>
            </div>

            {/* Visual Stacked Bar */}
            <div className="h-2 w-full bg-background mt-4 flex overflow-hidden">
              {criteria.map((c, i) => (
                <div 
                  key={c.id} 
                  className={`h-full ${CRITERIA_COLORS[i % CRITERIA_COLORS.length]} transition-all duration-300 ease-out border-r border-background last:border-r-0`}
                  style={{ width: `${Math.min(100, Math.max(0, c.weight))}%` }}
                  title={`${c.name}: ${c.weight}%`}
                />
              ))}
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-3 mb-6">
            <div className="hidden md:flex items-center px-4 mb-2">
              <span className="flex-1 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase pl-7">Criteria Name</span>
              <span className="w-32 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase text-right pr-12">Weight (%)</span>
            </div>
            
            {criteria.map((c, index) => {
              const colorClass = CRITERIA_COLORS[index % CRITERIA_COLORS.length];
              return (
                <div key={c.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 border border-border bg-background hover:border-text-muted transition-colors">
                  
                  {/* Color Dot & Input */}
                  <div className="flex items-center gap-3 w-full sm:flex-1">
                    <div className={`w-3 h-3 ${colorClass} shrink-0 ml-1`} />
                    <input 
                      type="text" 
                      value={c.name}
                      onChange={(e) => handleCriteriaChange(c.id, 'name', e.target.value)}
                      placeholder="CRITERIA_NAME"
                      className="flex-1 px-3 py-2 bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-surface outline-none text-xs font-mono font-bold tracking-widest text-text-main uppercase transition-colors"
                    />
                  </div>

                  {/* Number Input & Delete */}
                  <div className="flex items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
                    <div className="relative w-24 shrink-0">
                      <input 
                        type="number" 
                        value={c.weight === 0 ? '' : c.weight}
                        onChange={(e) => handleCriteriaChange(c.id, 'weight', parseInt(e.target.value) || 0)}
                        className="w-full pr-8 pl-3 py-2 bg-transparent border border-border focus:border-text-main outline-none text-xs font-mono font-bold tracking-widest text-text-main text-right transition-colors"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">%</span>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCriteria(c.id)}
                      className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                      title="Remove Criteria"
                    >
                      <TrashIcon className="w-4 h-4 stroke-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Criteria Button */}
          <button 
            type="button" 
            onClick={handleAddCriteria} 
            className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-border text-text-muted font-mono text-xs font-bold tracking-widest uppercase hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
          >
            <PlusIcon className="w-4 h-4 stroke-2" />
            Append_Criteria
          </button>
        </div>

        {/* Publish Action */}
        <div className="pt-4">
          <button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`w-full py-5 text-sm font-mono font-bold tracking-widest uppercase shadow-md transition-all flex items-center justify-center gap-3 ${
              isValid && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 border border-primary shadow-primary/20" 
                : "bg-surface text-text-muted border border-border cursor-not-allowed opacity-50"
            }`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">[ PUBLISHING... ]</span>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 stroke-2" />
                [ PUBLISH_PROCUREMENT_REQUEST ]
              </>
            )}
          </button>
          {!isValid && (
            <p className="text-center text-[10px] font-mono font-bold text-danger tracking-widest uppercase mt-4">
              {totalWeight !== 100 
                ? "ERR: MATRIX_WEIGHT_TOTAL != 100"
                : "ERR: PROJECT_TITLE_EMPTY"}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
