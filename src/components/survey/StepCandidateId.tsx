import React, { useState } from 'react';
import { Survey } from '../../types/survey';
import { Copy, Check, Info } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepCandidateId: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const [copied, setCopied] = useState(false);

  const activeFloor = survey.floors.find(f => f.id === survey.selectedFloorId) || survey.floors.find(f => f.floorCode === 'F02') || survey.floors[2];
  const activeUnit = survey.units.find(u => u.id === survey.selectedUnitId) || survey.units.find(u => u.unitCode === 'U203');

  const generatedCandidateId =
    survey.candidate3DId ||
    `V3D-${survey.baseUlpin.replace('DEMO-', '')}-${survey.building.id}-${activeFloor.floorCode}-${activeUnit?.unitCode || 'U203'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCandidateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Candidate Identifier Presentation Card (Section 18) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div>
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Volumetric Cadastral Formulation
          </span>
          <h2 className="text-xl font-bold text-[#172033] mt-0.5">
            Candidate 3D Spatial Identifier
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Standardized vertical spatial nomenclature generated from base land parcel and vertical unit bounds
          </p>
        </div>

        {/* Large Clean Candidate Identifier Box */}
        <div className="bg-[#F8FAFC] border-2 border-[#BFDBFE] rounded-xl p-5 text-center space-y-1.5">
          <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider block">
            Generated Candidate ID
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-[#1D4ED8] tracking-wide break-all">
            {generatedCandidateId}
          </div>
        </div>

        {/* Breakdown of ID Components */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold block">Base ULPIN</span>
            <span className="font-mono text-[#172033] text-sm font-bold mt-0.5 block">{survey.baseUlpin}</span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold block">Building</span>
            <span className="font-mono text-[#172033] text-sm font-bold mt-0.5 block">{survey.building.id}</span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold block">Floor</span>
            <span className="font-mono text-[#172033] text-sm font-bold mt-0.5 block">{activeFloor.floorCode}</span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold block">Unit</span>
            <span className="font-mono text-[#16A34A] text-sm font-bold mt-0.5 block">{activeUnit?.unitCode || 'U203'}</span>
          </div>
        </div>

        {/* Informational Disclaimer Banner (Section 18) */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3.5 text-xs text-[#1E40AF] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Prototype Identifier</span>
            <p className="text-[11px] text-[#3B82F6] leading-relaxed">
              This is a prototype-generated candidate spatial identifier and is not an official government ULPIN. Only authorized statutory registration authorities verify and issue legal identifiers.
            </p>
          </div>
        </div>

        {/* Action Buttons (Section 18, 24) */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Candidate ID!' : 'Copy Candidate ID'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
