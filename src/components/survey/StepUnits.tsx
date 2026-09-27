import React, { useState } from 'react';
import { Survey, Unit } from '../../types/survey';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepUnits: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const [selectedFloorCode, setSelectedFloorCode] = useState<string>('F02');

  const floors = survey.floors.filter(f => !f.isBasement);
  const units = survey.units;

  const currentFloor = floors.find(f => f.floorCode === selectedFloorCode) || floors[0];
  const floorUnits = units.filter(u => u.floorCode === selectedFloorCode);

  const handleSelectCandidateUnit = (unit: Unit) => {
    onUpdateSurvey({
      selectedUnitId: unit.id,
      selectedFloorId: unit.floorId,
      candidate3DId: `V3D-${survey.baseUlpin.replace('DEMO-', '')}-${survey.building.id}-${unit.floorCode}-${unit.unitCode}`
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#172033]">Unit Volumetric Demarcation</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Map individual apartment/office spatial units in 3D vertical space with explicit bounding boxes
        </p>
      </div>

      {/* Floor Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {floors.map((floor) => {
          const isSelected = floor.floorCode === selectedFloorCode;
          return (
            <button
              key={floor.id}
              onClick={() => setSelectedFloorCode(floor.floorCode)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
              }`}
            >
              {floor.floorCode} ({floor.floorName.split(' ')[0]})
            </button>
          );
        })}
      </div>

      {/* Floor Summary Bar */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span className="text-[#172033] font-bold">{currentFloor?.floorName}</span>
        </div>
        <div className="text-[#2563EB] font-mono font-semibold">
          Z-Elevation: {currentFloor?.zMin.toFixed(1)}m → {currentFloor?.zMax.toFixed(1)}m
        </div>
      </div>

      {/* Units List (Section 17) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {floorUnits.map((unit) => {
          const isTargetCandidate = survey.selectedUnitId === unit.id || unit.unitCode === 'U203';

          return (
            <div
              key={unit.id}
              onClick={() => handleSelectCandidateUnit(unit)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer relative ${
                isTargetCandidate
                  ? 'bg-[#F0FDF4] border-[#16A34A] ring-1 ring-[#16A34A]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              {isTargetCandidate && (
                <div className="absolute top-2 right-2 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Target Candidate
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                    isTargetCandidate
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  {unit.unitCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172033]">{unit.usage}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      Captured
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Floor {unit.floorCode} • Area: <strong className="text-[#172033]">{unit.approxAreaSqFt} sq.ft</strong>
                  </p>
                </div>
              </div>

              {/* Volumetric Bounding Box */}
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] text-xs font-mono grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">X-Bounds</span>
                  <span className="text-[#172033] font-semibold">{unit.bounds.xMin.toFixed(1)} → {unit.bounds.xMax.toFixed(1)}m</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">Y-Bounds</span>
                  <span className="text-[#172033] font-semibold">{unit.bounds.yMin.toFixed(1)} → {unit.bounds.yMax.toFixed(1)}m</span>
                </div>
                <div>
                  <span className="text-[#16A34A] block text-[10px] uppercase font-sans font-bold">Z-Elevation</span>
                  <span className="text-[#16A34A] font-bold">{unit.bounds.zMin.toFixed(1)} → {unit.bounds.zMax.toFixed(1)}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
        <span>
          <strong>Volumetric Prototype Notice:</strong> Demarcated units represent candidate 3D spatial subdivisions. Legal ownership is submitted separately and subject to official registrar verification.
        </span>
      </div>
    </div>
  );
};
