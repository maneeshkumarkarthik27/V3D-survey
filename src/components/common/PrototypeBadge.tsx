import React from 'react';
import { AlertCircle, ShieldAlert, Award } from 'lucide-react';

interface Props {
  variant?: 'candidate-id' | 'synthetic-data' | 'certificate-prototype' | 'unverified-ownership' | 'compact';
  customText?: string;
  className?: string;
}

export const PrototypeBadge: React.FC<Props> = ({ variant = 'synthetic-data', customText, className = '' }) => {
  if (variant === 'candidate-id') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>CANDIDATE ID — PROTOTYPE</span>
      </span>
    );
  }

  if (variant === 'certificate-prototype') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase bg-emerald-50 border border-emerald-300 text-emerald-800 ${className}`}>
        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>PROTOTYPE CERTIFICATE — NOT A GOVERNMENT LEGAL CERTIFICATE</span>
      </span>
    );
  }

  if (variant === 'unverified-ownership') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>SUBMITTED FOR VERIFICATION — NOT LEGAL TITLE</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        {customText || 'SYNTHETIC DEMO'}
      </span>
    );
  }

  // Default synthetic-data
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
      <span>{customText || 'PROTOTYPE / SYNTHETIC DEMONSTRATION DATA (SIH26011)'}</span>
    </span>
  );
};
