"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, CheckCircleIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

type BenchmarkItem = {
  id: string;
  name: string;
  category: string;
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
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    category: "IT Equipment",
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

  const categories = ["ALL", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
          setFormData({ itemName: "", category: "IT Equipment", specsDescription: "", proposedPrice: "", proofLink: "" });
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
  const needsSpecs = formData.category === "IT Equipment" || formData.category === "Heavy Machinery";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main font-heading tracking-tight mb-2">Price Benchmark</h1>
          <p className="text-text-muted">A composite market index combining official SRPs and BlockBid historical data.</p>
        </div>
        
        {isSupplier && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-mono text-xs font-bold tracking-widest uppercase rounded-md hover:bg-primary-light transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4 stroke-2" /> Propose Market Price
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border p-4 rounded-none shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border">
                <th className="p-4 font-mono text-[10px] font-bold tracking-widest uppercase text-text-muted">Item / Category</th>
                <th className="p-4 font-mono text-[10px] font-bold tracking-widest uppercase text-text-muted w-1/3">Specs Reference</th>
                <th className="p-4 font-mono text-[10px] font-bold tracking-widest uppercase text-text-muted text-right">Official SRP (DTI)</th>
                <th className="p-4 font-mono text-[10px] font-bold tracking-widest uppercase text-primary text-right bg-primary/5">BlockBid Average</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted font-mono text-sm animate-pulse">
                    LOADING_BENCHMARK_DATA...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    No items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-text-main text-sm">{item.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 bg-gray-100 border border-border text-[10px] font-mono tracking-wider text-text-muted rounded-md uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.specs_description ? (
                        <p className="text-xs text-text-muted">{item.specs_description}</p>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-mono text-sm font-medium text-text-muted">
                        {formatPrice(item.base_srp)}
                      </p>
                    </td>
                    <td className="p-4 text-right bg-primary/5 relative">
                      {item.platform_average && (
                        <div className="absolute top-4 left-2 text-emerald-500 opacity-20">
                          <ArrowTrendingUpIcon className="w-6 h-6" />
                        </div>
                      )}
                      <p className="font-mono text-sm font-bold text-primary relative z-10">
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
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Proposed Price (₱) *</label>
                    <input required type="number" min="0" step="0.01" value={formData.proposedPrice} onChange={e => setFormData({...formData, proposedPrice: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" />
                  </div>
                </div>

                {needsSpecs && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-xs font-mono font-bold tracking-widest uppercase text-text-muted">Specs Description *</label>
                    <textarea required rows={2} value={formData.specsDescription} onChange={e => setFormData({...formData, specsDescription: e.target.value})} className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Intel Core i5, 16GB RAM, 512GB SSD, Windows 11 Pro" />
                    <p className="text-[10px] text-text-muted">Required for {formData.category} to justify the proposed price.</p>
                  </div>
                )}
                {!needsSpecs && (
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
