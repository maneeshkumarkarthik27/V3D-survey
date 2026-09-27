import React, { useState } from 'react';
import { Survey, Floor } from '../../types/survey';
import { Plus, Trash2, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepFloors: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const [expandedFloorId, setExpandedFloorId] = useState<string | null>(survey.floors[2]?.id || null);

  const floors = survey.floors;

  const handleUpdateFloor = (floorId: string, updates: Partial<Floor>) => {
    const updatedFloors = floors.map(f => {
      if (f.id === floorId) {
        return { ...f, ...updates };
      }
      return f;
    });

    recalculateElevation(updatedFloors);
  };

  const recalculateElevation = (newFloors: Floor[]) => {
    let currentZ = 0.0;

    const basements = newFloors.filter(f => f.isBasement);
    basements.forEach(b => {
      b.zMax = 0.0;
      b.zMin = -Math.abs(b.heightMeters);
    });

    const aboveGround = newFloors.filter(f => !f.isBasement);
    aboveGround.forEach(f => {
      f.zMin = parseFloat(currentZ.toFixed(2));
      f.zMax = parseFloat((currentZ + f.heightMeters).toFixed(2));
      currentZ += f.heightMeters;
    });

    onUpdateSurvey({
      floors: newFloors,
      building: {
        ...survey.building,
        floorCount: aboveGround.length,
        basementCount: basements.length,
        approxHeightMeters: parseFloat(currentZ.toFixed(2))
      }
    });
  };

  const handleAddFloor = () => {
    const aboveGround = floors.filter(f => !f.isBasement);
    const nextNum = aboveGround.length;
    const floorCode = `F0${nextNum}`;
    const newFloor: Floor = {
      id: `flr-${Date.now()}`,
      floorNumber: nextNum,
      floorCode: floorCode,
      floorName: `Floor ${nextNum} (Residential)`,
      heightMeters: 3.2,
      approxAreaSqFt: 2400,
      usage: 'Residential Apartments',
      unitCount: 4,
      zMin: 0,
      zMax: 0,
      status: 'Captured'
    };

    const nextFloors = [...floors, newFloor];
    recalculateElevation(nextFloors);
    setExpandedFloorId(newFloor.id);
  };

  const handleRemoveFloor = (floorId: string) => {
    if (floors.length <= 2) return;
    const nextFloors = floors.filter(f => f.id !== floorId);
    recalculateElevation(nextFloors);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#172033]">Vertical Stacking & Floor Levels</h2>
          <p className="text-xs text-[#64748B]">
            Define continuous vertical elevations from subterranean basement to terrace
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddFloor}
          className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Floor</span>
        </button>
      </div>

      {/* Floors List Stack */}
      <div className="space-y-3">
        {[...floors].reverse().map((floor) => {
          const isExpanded = expandedFloorId === floor.id;
          const isBasement = floor.isBasement;

          return (
            <div
              key={floor.id}
              className={`rounded-xl border transition-colors overflow-hidden ${
                isExpanded
                  ? 'bg-white border-[#2563EB] shadow-xs'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              {/* Floor Header Bar */}
              <div
                onClick={() => setExpandedFloorId(isExpanded ? null : floor.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isBasement
                        ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                        : 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                    }`}
                  >
                    {floor.floorCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#172033]">{floor.floorName}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                        <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                        Captured
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] font-mono mt-0.5">
                      Elevation Z: <span className="font-semibold text-[#172033]">{floor.zMin.toFixed(1)}m → {floor.zMax.toFixed(1)}m</span> ({floor.heightMeters}m Height)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-[#172033]">{floor.unitCount} Units</span>
                    <p className="text-[11px] text-[#64748B]">{floor.approxAreaSqFt} sq.ft</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#2563EB]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </div>
              </div>

              {/* Expanded Floor Editor Form */}
              {isExpanded && (
                <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-[#64748B] block mb-1">Floor Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="2.0"
                      max="6.0"
                      value={floor.heightMeters}
                      onChange={(e) => handleUpdateFloor(floor.id, { heightMeters: parseFloat(e.target.value) || 3.0 })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 font-mono text-[#172033] font-bold focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] block mb-1">Approx Area (sq.ft)</label>
                    <input
                      type="number"
                      step="50"
                      value={floor.approxAreaSqFt}
                      onChange={(e) => handleUpdateFloor(floor.id, { approxAreaSqFt: parseInt(e.target.value) || 1200 })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 font-mono text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] block mb-1">Unit Count</label>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      value={floor.unitCount}
                      onChange={(e) => handleUpdateFloor(floor.id, { unitCount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 font-mono text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] block mb-1">Level Usage</label>
                    <input
                      type="text"
                      value={floor.usage}
                      onChange={(e) => handleUpdateFloor(floor.id, { usage: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  {!isBasement && floors.filter(f => !f.isBasement).length > 2 && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveFloor(floor.id)}
                        className="flex items-center gap-1 text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium px-2.5 py-1 rounded bg-[#FEF2F2] border border-[#FECACA]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Floor</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
