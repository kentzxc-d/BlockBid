import React from 'react';

export interface AcquisitionCardProps {
  title: string;
  description: string;
  status: string;
  location: string;
  estBudget: string | number;
  closingDate: string;
  contractHash?: string;
  customMetaLabel?: string;
  customMetaValue?: string;
  actionButton?: React.ReactNode;
}

export default function AcquisitionCard({
  title,
  description,
  status,
  location,
  estBudget,
  closingDate,
  contractHash,
  customMetaLabel,
  customMetaValue,
  actionButton,
}: AcquisitionCardProps) {
  const statusUpper = status.toUpperCase();
  const isStatusGreen = statusUpper === 'OPEN' || statusUpper === 'WON';
  
  // Format budget to PHP if it's a number
  const formattedBudget = typeof estBudget === 'number' 
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(estBudget)
    : estBudget;

  return (
    <div className="bg-surface border border-border rounded-none p-8 flex flex-col gap-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-secondary)]">
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl md:text-[22px] font-semibold mb-3 text-secondary font-heading tracking-tight leading-tight">
          {title}
        </h3>
        <span 
          className={`px-3 py-1 text-xs font-mono font-bold tracking-widest text-white rounded-none shrink-0 ${
            isStatusGreen ? 'bg-green-600' : 'bg-secondary'
          }`}
        >
          STATUS: {statusUpper}
        </span>
      </div>
      
      <p className="text-text-muted line-clamp-3 leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-6 font-mono text-[13px] text-text-muted mt-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-widest text-text-muted">Location</span>
          <span className="text-text-main font-medium">{location}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-widest text-text-muted">Est. Budget</span>
          <span className="text-text-main font-medium">{formattedBudget}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-widest text-text-muted">Closing Date</span>
          <span className="text-text-main font-medium">{closingDate}</span>
        </div>
        {contractHash && (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Contract Hash</span>
            <span className="text-primary font-medium">{contractHash}</span>
          </div>
        )}
        {customMetaLabel && customMetaValue && (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-widest text-text-muted">{customMetaLabel}</span>
            <span className="text-primary font-medium">{customMetaValue}</span>
          </div>
        )}
      </div>

      {actionButton && (
        <div className="mt-4 pt-4 border-t border-border flex justify-end">
          {actionButton}
        </div>
      )}
    </div>
  );
}
