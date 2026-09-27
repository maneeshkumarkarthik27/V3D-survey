import React from 'react';
import { Survey, OwnershipSubmission } from '../../types/survey';
import { User, FileText, Phone, AlertCircle } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

const CLAIM_TYPES: OwnershipSubmission['claimType'][] = [
  'Apartment Association / Society',
  'Sole Ownership',
  'Co-Ownership',
  'Government / Public Lease',
  'Other'
];

const RELATIONSHIPS: OwnershipSubmission['relationshipToProperty'][] = [
  'Authorized Representative',
  'Owner / Title Holder',
  'Tenant / Occupant',
  'Developer'
];

export const StepOwnership: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const ownership = survey.ownership;

  const handleUpdateField = (field: keyof OwnershipSubmission, value: any) => {
    onUpdateSurvey({
      ownership: {
        ...ownership,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header & Status Banner (Section 19) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Ownership Information</h2>
            <p className="text-xs text-[#64748B]">
              Record submitted property interests and supporting documentary references
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] self-start sm:self-auto">
            <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Pending Official Verification</span>
          </span>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#64748B] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <span>
            <strong>Submitted Information Notice:</strong> This data represents claimant submissions collected during field survey. It is unverified until officially checked and certified by the Revenue Registrar.
          </span>
        </div>

        {/* Clean Form Fields (Section 12, 19) */}
        <div className="space-y-4 pt-1">
          {/* Claim Type */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Ownership Claim Type <span className="text-red-500">*</span>
            </label>
            <select
              value={ownership.claimType}
              onChange={(e) => handleUpdateField('claimType', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              {CLAIM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Claimant Name */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Claimant / Association Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ownership.claimantName}
                onChange={(e) => handleUpdateField('claimantName', e.target.value)}
                placeholder="e.g. Annamalai Owners Welfare Association"
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Relationship to Property */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Claimant Relationship to Property <span className="text-red-500">*</span>
            </label>
            <select
              value={ownership.relationshipToProperty}
              onChange={(e) => handleUpdateField('relationshipToProperty', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              {RELATIONSHIPS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Supporting Record Reference */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Supporting Record / Patta Reference <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ownership.supportingRecordReference}
                onChange={(e) => handleUpdateField('supportingRecordReference', e.target.value)}
                placeholder="e.g. Patta TR/2021/8871 & CMDA Sanction B/WD/2022/194"
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] font-mono focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Contact Phone / Representative Mobile
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ownership.contactPhone}
                onChange={(e) => handleUpdateField('contactPhone', e.target.value)}
                placeholder="+91 94440 12891"
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] font-mono focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Surveyor Field Observations
            </label>
            <textarea
              rows={2}
              value={ownership.remarks}
              onChange={(e) => handleUpdateField('remarks', e.target.value)}
              placeholder="Physical possession and documents checked in field..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
