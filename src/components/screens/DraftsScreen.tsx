import React from 'react';
import { Survey } from '../../types/survey';
import { PlayCircle } from 'lucide-react';

interface Props {
  draftSurveys: Survey[];
  onContinueDraft: (survey: Survey) => void;
}

export const DraftsScreen: React.FC<Props> = ({ draftSurveys, onContinueDraft }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#172033]">Draft Surveys</h1>
          <p className="text-xs text-[#64748B]">
            Workflows autosaved in local device persistence ready for field completion
          </p>
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {draftSurveys.length} Drafts Saved
        </span>
      </div>

      {/* Drafts List (Section 27) */}
      <div className="space-y-3.5">
        {draftSurveys.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-[#64748B] text-sm">
            No draft surveys pending on this device.
          </div>
        ) : (
          draftSurveys.map((survey) => {
            const progressPercent = Math.round((survey.currentStep / 11) * 100);
            const modelGenerated = survey.currentStep >= 8;

            return (
              <div
                key={survey.id}
                onClick={() => onContinueDraft(survey)}
                className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-xl p-5 shadow-xs transition-colors cursor-pointer group space-y-3.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-base text-[#2563EB]">{survey.id}</span>
                    <div className="text-xs text-[#64748B] font-mono mt-0.5">
                      Base Parcel: <strong className="text-[#172033]">{survey.baseUlpin}</strong>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Draft
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B] font-medium">Survey Completion</span>
                    <span className="font-mono font-bold text-[#2563EB]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <div>
                    <span className="text-[#64748B] block text-[11px]">3D Model Status</span>
                    <p className={`font-semibold mt-0.5 ${modelGenerated ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                      {modelGenerated ? 'Generated ✓' : 'Pending Generation'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Current Stage</span>
                    <p className="font-semibold text-[#172033] mt-0.5">
                      Step {survey.currentStep} of 11
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinueDraft(survey);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Continue Survey</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
