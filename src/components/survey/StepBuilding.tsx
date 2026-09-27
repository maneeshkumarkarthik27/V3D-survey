import React, { useState } from 'react';
import { Survey, Building } from '../../types/survey';
import { Ruler, PenTool } from 'lucide-react';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepBuilding: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const [footprintMode, setFootprintMode] = useState<'existing' | 'custom'>('existing');

  const building = survey.building;

  const handleFieldChange = (field: keyof Building, value: any) => {
    onUpdateSurvey({
      building: {
        ...building,
        [field]: value
      }
    });
  };

  const handleUseExistingFootprint = () => {
    setFootprintMode('existing');
    onUpdateSurvey({
      building: {
        ...building,
        widthMeters: 24.0,
        lengthMeters: 16.0,
        approxHeightMeters: 13.0,
        footprintPolygon: [
          { x: 0, y: 0 },
          { x: 24, y: 0 },
          { x: 24, y: 16 },
          { x: 0, y: 16 }
        ]
      }
    });
  };

  const handleCustomFootprintPreset = () => {
    setFootprintMode('custom');
    onUpdateSurvey({
      building: {
        ...building,
        widthMeters: 26.0,
        lengthMeters: 18.0,
        footprintPolygon: [
          { x: 0, y: 0 },
          { x: 26, y: 0 },
          { x: 26, y: 10 },
          { x: 14, y: 10 },
          { x: 14, y: 18 },
          { x: 0, y: 18 }
        ]
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Form Design (Section 12) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#172033]">Building Physical Identifiers & Dimensions</h2>
          <p className="text-xs text-[#64748B]">
            Record physical structural parameters for volumetric boundary generation
          </p>
        </div>

        {/* Building ID & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Building ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={building.id}
              onChange={(e) => handleFieldChange('id', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Building Name / Block Ref <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={building.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Physical Metric Dimensions */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Ruler className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Envelope Dimensions (Meters)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
              <label className="text-xs font-medium text-[#64748B] block">Building Width (X)</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.5"
                  value={building.widthMeters}
                  onChange={(e) => handleFieldChange('widthMeters', parseFloat(e.target.value) || 20)}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-sm font-mono font-bold text-[#172033] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">m</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
              <label className="text-xs font-medium text-[#64748B] block">Building Length (Y)</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.5"
                  value={building.lengthMeters}
                  onChange={(e) => handleFieldChange('lengthMeters', parseFloat(e.target.value) || 15)}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-sm font-mono font-bold text-[#172033] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">m</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
              <label className="text-xs font-medium text-[#64748B] block">Total Height (Z)</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.5"
                  value={building.approxHeightMeters}
                  onChange={(e) => handleFieldChange('approxHeightMeters', parseFloat(e.target.value) || 12)}
                  className="w-full bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-sm font-mono font-bold text-[#2563EB] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Construction & Roof Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Construction Type
            </label>
            <select
              value={building.constructionType}
              onChange={(e) => handleFieldChange('constructionType', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="RCC Framed">RCC Framed Structure</option>
              <option value="Load Bearing">Load Bearing Brick</option>
              <option value="Steel Frame">Steel Frame / Structural Steel</option>
              <option value="Prefabricated">Prefabricated Modular</option>
              <option value="Traditional">Traditional Masonry</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
              Roof Type
            </label>
            <select
              value={building.roofType}
              onChange={(e) => handleFieldChange('roofType', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Flat RCC">Flat RCC Slab</option>
              <option value="Sloped Tile">Sloped Tile</option>
              <option value="Metal Sheet">Profile Metal Sheet</option>
              <option value="Terrace Garden">Terrace Garden</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2D Footprint Polygon Preview Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033]">2D Footprint Boundary Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUseExistingFootprint}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                footprintMode === 'existing'
                  ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Standard Rectangular
            </button>
            <button
              onClick={handleCustomFootprintPreset}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                footprintMode === 'custom'
                  ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#172033]'
              }`}
            >
              L-Shaped Wing
            </button>
          </div>
        </div>

        {/* Clean Light SVG Preview */}
        <div className="w-full h-40 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full p-3" viewBox="-5 -5 60 45">
            <defs>
              <pattern id="lightFootprintGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="-5" y="-5" width="60" height="45" fill="url(#lightFootprintGrid)" />

            {/* Parcel boundary outline */}
            <rect x="2" y="2" width="46" height="36" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" />

            {/* Building Polygon */}
            {footprintMode === 'existing' ? (
              <rect
                x="8"
                y="6"
                width={building.widthMeters * 1.3}
                height={building.lengthMeters * 1.3}
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.5"
                rx="1"
              />
            ) : (
              <polygon
                points="8,6 40,6 40,20 25,20 25,32 8,32"
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.5"
              />
            )}

            <text x="14" y="20" fill="#2563EB" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
              {building.widthMeters}m x {building.lengthMeters}m
            </text>
          </svg>

          <span className="absolute bottom-2 right-2 text-xs font-mono font-medium text-[#475569] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded shadow-xs">
            Calculated Footprint: {(building.widthMeters * building.lengthMeters).toFixed(0)} m²
          </span>
        </div>
      </div>
    </div>
  );
};
