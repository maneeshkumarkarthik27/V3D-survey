import React from 'react';
import { Survey, PropertyType, BuildingUsage } from '../../types/survey';
import { Building2, Home, Landmark, Briefcase, Factory, HelpCircle, Check } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

const PROPERTY_TYPES: { type: PropertyType; label: string; icon: any; desc: string }[] = [
  { type: 'Residential', label: 'Residential', icon: Home, desc: 'Apartments, residential towers, multi-family' },
  { type: 'Commercial', label: 'Commercial', icon: Briefcase, desc: 'Offices, commercial complexes, retail' },
  { type: 'Mixed Use', label: 'Mixed Use', icon: Building2, desc: 'Commercial ground with residential upper floors' },
  { type: 'Institutional', label: 'Institutional', icon: Landmark, desc: 'Educational, medical, public utilities' },
  { type: 'Industrial', label: 'Industrial', icon: Factory, desc: 'Warehousing, logistics, processing units' },
  { type: 'Other', label: 'Other', icon: HelpCircle, desc: 'Specialized physical infrastructure' }
];

const BUILDING_USAGES: BuildingUsage[] = [
  'Apartment',
  'House',
  'Office',
  'School',
  'Hospital',
  'Shopping Complex',
  'Warehouse',
  'Other'
];

export const StepProperty: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const handleSelectPropertyType = (type: PropertyType) => {
    onUpdateSurvey({ propertyType: type });
  };

  const handleSelectUsage = (usage: BuildingUsage) => {
    onUpdateSurvey({
      buildingUsage: usage,
      building: {
        ...survey.building,
        usage: usage
      }
    });
  };

  const handleBuildingCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(10, count));
    onUpdateSurvey({ buildingCount: safeCount });
  };

  return (
    <div className="space-y-5">
      {/* Property Type Grid (Section 11) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Property Classification <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-[#64748B] mt-0.5">
            Select the dominant statutory property category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(({ type, label, icon: Icon, desc }) => {
            const isSelected = survey.propertyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectPropertyType(type)}
                className={`p-3.5 rounded-lg border text-left flex items-start justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isSelected ? 'text-[#1D4ED8]' : 'text-[#172033]'}`}>
                      {label}
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5 leading-snug">{desc}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Building Usage Pattern */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
            Primary Building Usage <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-[#64748B] mt-0.5">
            Specific structural usage for spatial unit partitioning
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BUILDING_USAGES.map((usage) => {
            const isSelected = survey.buildingUsage === usage;
            return (
              <button
                key={usage}
                type="button"
                onClick={() => handleSelectUsage(usage)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {usage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number of Physical Structures on Parcel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-[#172033]">Number of Structures on Parcel</span>
          <p className="text-xs text-[#64748B] mt-0.5">
            Physical detached buildings within the 2D parcel boundary (1–10)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleBuildingCountChange(survey.buildingCount - 1)}
            disabled={survey.buildingCount <= 1}
            className="w-9 h-9 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] font-bold flex items-center justify-center disabled:opacity-40 transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center font-mono font-bold text-sm text-[#172033]">
            {survey.buildingCount}
          </span>
          <button
            type="button"
            onClick={() => handleBuildingCountChange(survey.buildingCount + 1)}
            disabled={survey.buildingCount >= 10}
            className="w-9 h-9 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] font-bold flex items-center justify-center disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
