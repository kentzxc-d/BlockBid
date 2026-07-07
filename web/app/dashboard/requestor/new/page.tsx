"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px', display: 'inline-block' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Create Item Procurement</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Define the requirements and dynamic criteria for the new solicitation.</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Details */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Item/Project Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Procurement of 500 Desktop Computers"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Description & Requirements</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the items needed, minimum specs, and delivery location..."
            rows={4}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Estimated Budget (PHP)</label>
          <input 
            type="number" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 5000000"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

        {/* Dynamic Criteria Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600 }}>Dynamic Criteria for Evaluation</label>
              <span style={{ fontSize: '14px', color: totalWeight === 100 ? 'var(--color-secondary)' : 'red' }}>
                Total Weight: {totalWeight}% (Must equal 100%)
              </span>
            </div>
            <button type="button" onClick={handleAddCriteria} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '14px' }}>
              + Add Criteria
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criteria.map((c, index) => (
              <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={c.name}
                  onChange={(e) => handleCriteriaChange(c.id, 'name', e.target.value)}
                  placeholder="Criteria Name (e.g. Price)"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <div style={{ position: 'relative', width: '120px' }}>
                  <input 
                    type="number" 
                    value={c.weight}
                    onChange={(e) => handleCriteriaChange(c.id, 'weight', parseInt(e.target.value) || 0)}
                    placeholder="%"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', paddingRight: '30px' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>%</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveCriteria(c.id)}
                  style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '8px' }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          disabled={totalWeight !== 100 || !title}
          style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px', opacity: totalWeight !== 100 ? 0.5 : 1 }}
        >
          Publish Procurement Request
        </button>

      </div>
    </div>
  );
}
