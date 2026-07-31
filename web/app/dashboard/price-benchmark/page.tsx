"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, CheckCircleIcon, ArrowTrendingUpIcon, FunnelIcon } from "@heroicons/react/24/outline";

type BenchmarkItem = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  specs_description?: string;
  base_srp?: number;
  platform_average?: number;
};

export default function PriceBenchmarkPage() {
  const { profile } = useProfile();
  const [items, setItems] = useState<BenchmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [subCategoryFilter, setSubCategoryFilter] = useState("ALL");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    category: "IT Equipment",
    subcategory: "",
    specsDescription: "",
    proposedPrice: "",
    proofLink: ""
  });

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch("/api/benchmark");
      const data = await res.json();
      if (data.success) {
        setItems(data.benchmarks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSubCategoryFilter("ALL");
  }, [categoryFilter]);

  const categories = ["ALL", ...Array.from(new Set(items.map(i => i.category)))];
  
  // Get available subcategories for the current selected category
  const availableSubcategories = categoryFilter === "ALL" 
    ? [] 
    : ["ALL", ...Array.from(new Set(items.filter(i => i.category === categoryFilter && i.subcategory).map(i => i.subcategory as string)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === "ALL" || item.subcategory === subCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const formatPrice = (price?: number) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/benchmark/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: profile.id,
          item_name: formData.itemName,
          category: formData.category,
          subcategory: formData.subcategory || null,
          specs_description: formData.specsDescription,
          proposed_price: parseFloat(formData.proposedPrice),
          proof_link: formData.proofLink
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Proposal submitted successfully and is pending admin approval.");
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg("");
          setFormData({ itemName: "", category: "IT Equipment", subcategory: "", specsDescription: "", proposedPrice: "", proofLink: "" });
        }, 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const isSupplier = profile?.role === "supplier";
  const needsSpecsForm = formData.category === "IT Equipment" || formData.category === "Heavy Machinery";
  
  // Smart Columns Logic
  const showSpecsColumn = categoryFilter !== "ALL" && filteredItems.some(i => i.specs_description);
  const showTrendMarks = categoryFilter !== "ALL";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main font-heading tracking-tight uppercase mb-2">
            [ PRICE_BENCHMARK ]
          </h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            A composite market index combining official SRPs and BlockBid historical data.
          </p>
        </div>
        
        {/* Search, Filter & Propose Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted stroke-2" />
            <input 
              type="text" 
              placeholder="SEARCH_BENCHMARK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-md border border-border focus:border-text-main outline-none transition-colors text-xs font-mono font-bold tracking-widest w-full md:w-64 placeholder:text-text-muted uppercase"
            />
          </div>
          <div className="relative group w-full sm:w-auto flex">
            <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-md text-xs font-mono font-bold tracking-widest text-text-main hover:bg-gray-50 transition-colors uppercase whitespace-nowrap">
              <FunnelIcon className="w-4 h-4 stroke-2 text-text-main" />
              {categoryFilter === "ALL" ? "Filter" : categoryFilter}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1 overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors ${categoryFilter === cat ? 'text-primary bg-primary/5' : 'text-text-main'}`}
                >
                  {cat === "ALL" ? "ALL_CATEGORIES" : cat}
                </button>
              ))}
            </div>
          </div>
          
          {isSupplier && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md hover:bg-primary-light transition-colors shadow-sm w-full sm:w-auto sm:ml-2"
            >
              <PlusIcon className="w-4 h-4 stroke-2" /> Propose
            </button>
          )}
        </div>
      </div>

      {/* Sub-Category Tabs (Only shown if a specific category is selected and has subcategories) */}
      {categoryFilter !== "ALL" && availableSubcategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {availableSubcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSubCategoryFilter(sub)}
              className={`px-4 py-1.5 text-xs font-mono tracking-widest uppercase rounded-md border transition-colors ${
                subCategoryFilter === sub 
                  ? "bg-secondary text-white border-secondary" 
                  : "bg-white text-text-muted border-border hover:border-text-muted"
              }`}
            >
              {sub === "ALL" ? "ALL" : sub}
            </button>
          ))}
        </div>
      )}

      {/* Data Sources Disclaimer */}
      <div className="bg-surface border border-border border-l-4 border-l-primary p-5 mb-6 flex flex-col justify-center">
        <p className="font-mono font-bold text-text-main mb-2 uppercase tracking-widest text-xs">[ DATA_SOURCES ]</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
          <p className="text-text-muted">
            <strong className="text-text-main font-heading">Official SRP (DTI):</strong> Government-mandated baseline prices for essential and common commodities.
          </p>
          <p className="text-text-muted">
            <strong className="text-primary font-heading">BlockBid Average:</strong> Real-time, crowdsourced market rates derived from active platform bids and verified supplier proposals.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border">
                <th className="p-4 font-mono text-xs font-bold tracking-widest uppercase text-text-muted">Item / Category</th>
                {showSpecsColumn && (
                  <th className="p-4 font-mono text-xs font-bold tracking-widest uppercase text-text-muted w-1/3">Specs Reference</th>
                )}
                <th className="p-4 font-mono text-xs font-bold tracking-widest uppercase text-text-muted text-right">Official SRP (DTI)</th>
                <th className="p-4 font-mono text-xs font-bold tracking-widest uppercase text-primary text-right bg-primary/5">BlockBid Average</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showSpecsColumn ? 4 : 3} className="p-8 text-center text-text-muted font-mono text-sm animate-pulse">
                    LOADING_BENCHMARK_DATA...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={showSpecsColumn ? 4 : 3} className="p-8 text-center text-text-muted">
                    No items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-text-main text-base">{item.name}</p>
                    </td>
                    
                    {showSpecsColumn && (
                      <td className="p-4">
                        {item.specs_description ? (
                          <p className="text-sm text-text-muted">{item.specs_description}</p>
                        ) : (
                          <span className="text-xs font-mono text-gray-300">N/A</span>
                        )}
                      </td>
                    )}
                    
                    <td className="p-4 text-right">
                      <p className="font-mono text-base font-medium text-text-muted">
                        {formatPrice(item.base_srp)}
                      </p>
                    </td>
                    
                    <td className="p-4 text-right bg-primary/5">
                      <p className="font-mono text-lg font-bold text-primary">
                        {formatPrice(item.platform_average)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg border border-border rounded-none shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-text-main uppercase">Propose Market Price</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <XMarkIcon className="w-5 h-5 stroke-2" />
              </button>
            </div>
            
            {successMsg ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <CheckCircleIcon className="w-16 h-16 text-emerald-500 mb-4" />
                <p className="font-mono font-bold text-text-main">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePropose} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Item Name *</label>
                    <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. ThinkPad T14 Gen 3" />
                  </div>
                  
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Category *</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Medical Supplies">Medical Supplies</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Heavy Machinery">Heavy Machinery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Subcategory</label>
                    <input type="text" value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Laptop" />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Proposed Price (₱) *</label>
                    <input required type="number" min="0" step="0.01" value={formData.proposedPrice} onChange={e => setFormData({...formData, proposedPrice: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" />
                  </div>
                </div>

                {needsSpecsForm && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Specs Description *</label>
                    <textarea required rows={2} value={formData.specsDescription} onChange={e => setFormData({...formData, specsDescription: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Intel Core i5, 16GB RAM, 512GB SSD, Windows 11 Pro" />
                    <p className="text-[10px] text-text-muted">Required for {formData.category} to justify the proposed price.</p>
                  </div>
                )}
                {!needsSpecsForm && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Specs Description (Optional)</label>
                    <input type="text" value={formData.specsDescription} onChange={e => setFormData({...formData, specsDescription: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Optional brief description" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Proof / Source Link</label>
                  <input type="url" value={formData.proofLink} onChange={e => setFormData({...formData, proofLink: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://store.link/item" />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-mono font-bold tracking-widest uppercase text-text-muted hover:text-text-main transition-colors">
                    CANCEL
                  </button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-white text-xs font-mono font-bold tracking-widest uppercase rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center gap-2">
                    {submitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
