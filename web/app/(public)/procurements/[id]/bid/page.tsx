"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmitBidPage() {
  const [bidAmount, setBidAmount] = useState("");
  const [proposal, setProposal] = useState("");

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/procurements" style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px', display: 'inline-block' }}>
          &larr; Back to Procurements
        </Link>
        <h1>Submit Bid Proposal</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>You are bidding for: <strong>Procurement of Medical Supplies (Q3 2026)</strong></p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Dynamic Criteria Display */}
        <div style={{ padding: '16px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Evaluation Criteria for this Item:</h3>
          <ul style={{ listStylePosition: 'inside', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            <li><strong>40%</strong> - Specs/Quality</li>
            <li><strong>30%</strong> - Price</li>
            <li><strong>20%</strong> - Supplier Reputation</li>
            <li><strong>10%</strong> - Delivery Time</li>
          </ul>
          <p style={{ fontSize: '12px', marginTop: '12px', color: 'var(--color-primary)' }}>
            ℹ️ Your bid will be evaluated blindly by AI against these exact criteria. Your company name will be hidden.
          </p>
        </div>

        {/* Bid Input */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Your Proposed Price (PHP)</label>
          <input 
            type="number" 
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="e.g. 4800000"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Technical Proposal & Justification</label>
          <textarea 
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Explain why your items meet the 40% Specs criteria, your expected delivery time, and warranty details..."
            rows={6}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', fontFamily: 'inherit' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          disabled={!bidAmount || !proposal}
          style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}
        >
          Sign & Submit Encrypted Bid to Blockchain
        </button>

      </div>
    </div>
  );
}
