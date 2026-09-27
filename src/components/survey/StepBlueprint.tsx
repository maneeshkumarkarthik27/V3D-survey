import React, { useState } from 'react';
import { Survey, Blueprint } from '../../types/survey';
import { FileUp, Sparkles, RefreshCw, ZoomIn, CheckCircle2 } from 'lucide-react';
import { extractBlueprintFeatures } from '../../services/aiAssistance';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepBlueprint: React.FC<Props> = ({ survey, onUpdateSurvey }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const blueprint = survey.blueprint || {
    id: 'bp-default',
    fileName: 'approved_plan_cmda_2023_04.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60',
    floorTarget: 'Floor 2 (Typical Floor Plan)',
    scaleRatio: '1:100',
    floorHeightMeters: 3.2,
    roomCount: 4,
    uploadedAt: new Date().toISOString(),
    aiExtraction: {
      wallsDetected: 18,
      doorsDetected: 7,
      windowsDetected: 9,
      estimatedRooms: 4,
      confidencePercentage: 92.4,
      extractedAt: new Date().toISOString()
    }
  };

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const extracted = extractBlueprintFeatures();
      onUpdateSurvey({
        blueprint: {
          ...blueprint,
          roomCount: extracted.estimatedRooms,
          scaleRatio: extracted.estimatedScale,
          aiExtraction: {
            ...extracted,
            extractedAt: new Date().toISOString()
          }
        }
      });
      setIsAnalyzing(false);
    }, 600);
  };

  const handleUpdateField = (field: keyof Blueprint, value: any) => {
    onUpdateSurvey({
      blueprint: {
        ...blueprint,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#172033]">Floor Plan & Architectural Vector Integration</h2>
        <p className="text-xs text-[#64748B]">
          Correlate physical field observations with municipal sanctioned architectural floor plans
        </p>
      </div>

      {/* Blueprint Upload & Preview Card (Section 14) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileUp className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033]">Floor Plan / Blueprint File</h3>
          </div>
          <span className="text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
            CAD / PDF Linked ✓
          </span>
        </div>

        {/* Blueprint Visual Preview */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
          <img
            src={blueprint.fileUrl}
            alt="Sanctioned Floor Plan"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#E2E8F0] text-xs font-semibold text-[#475569] shadow-xs flex items-center gap-1">
            <ZoomIn className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Scale {blueprint.scaleRatio}</span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-[#E2E8F0] flex items-center justify-between text-xs text-[#172033] shadow-xs">
            <span className="font-mono font-medium truncate">{blueprint.fileName}</span>
            <span className="text-[#2563EB] font-semibold shrink-0">{blueprint.floorTarget}</span>
          </div>
        </div>

        {/* Parameters Form (Section 14) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Target Floor</label>
            <input
              type="text"
              value={blueprint.floorTarget}
              onChange={(e) => handleUpdateField('floorTarget', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Scale Ratio</label>
            <input
              type="text"
              value={blueprint.scaleRatio}
              onChange={(e) => handleUpdateField('scaleRatio', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Clear Height (m)</label>
            <input
              type="number"
              step="0.1"
              value={blueprint.floorHeightMeters}
              onChange={(e) => handleUpdateField('floorHeightMeters', parseFloat(e.target.value) || 3.0)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">Room Count</label>
            <input
              type="number"
              value={blueprint.roomCount}
              onChange={(e) => handleUpdateField('roomCount', parseInt(e.target.value) || 4)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* AI-Assisted Prototype Extraction Card (Section 14 & 31) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033]">AI-Assisted Prototype Vector Extraction</h3>
          </div>
          <button
            type="button"
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block">Walls Detected</span>
            <span className="font-mono font-bold text-[#172033] text-lg mt-0.5 block">
              {blueprint.aiExtraction.wallsDetected}
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block">Doors Detected</span>
            <span className="font-mono font-bold text-[#172033] text-lg mt-0.5 block">
              {blueprint.aiExtraction.doorsDetected}
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block">Windows Detected</span>
            <span className="font-mono font-bold text-[#172033] text-lg mt-0.5 block">
              {blueprint.aiExtraction.windowsDetected}
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block">Vector Confidence</span>
            <span className="font-mono font-bold text-[#16A34A] text-lg mt-0.5 block">
              {blueprint.aiExtraction.confidencePercentage}%
            </span>
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed pt-1">
          <strong>AI Assistance Note:</strong> Automatic vector extraction provides surveyor guidance and boundary approximations. Official legal geometry is strictly governed by physical field observations and official certified blueprints.
        </p>
      </div>
    </div>
  );
};
