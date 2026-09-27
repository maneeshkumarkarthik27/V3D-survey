import React, { useState } from 'react';
import { Survey, SurveyValidationResult } from '../../types/survey';
import { surveyRepo } from '../../services/surveyRepository';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UploadCloud,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface Props {
  survey: Survey;
  onSubmitSuccess: (submittedSurvey: Survey) => void;
}

const UPLOAD_SEQUENCE = [
  'Packaging survey geospatial metadata',
  'Compressing 8 photogrammetric assets',
  'Serializing floor CAD blueprint & vector layers',
  'Compiling parametric 3D volumetric mesh',
  'Registering candidate 3D spatial ID',
  'Transmitting encrypted payload to V3D state server'
];

export const StepValidation: React.FC<Props> = ({ survey, onSubmitSuccess }) => {
  const [validationResult, setValidationResult] = useState<SurveyValidationResult>(() => {
    return surveyRepo.validateSurvey(survey);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  const handleRevalidate = () => {
    const result = surveyRepo.validateSurvey(survey);
    setValidationResult(result);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadStep(0);

    for (let i = 0; i <= UPLOAD_SEQUENCE.length; i++) {
      setUploadStep(i);
      await new Promise(r => setTimeout(r, 220));
    }

    const updated = await surveyRepo.submitSurvey(survey);
    setIsSubmitting(false);
    onSubmitSuccess(updated);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#172033]">Pre-Submission Survey Validation</h2>
        <p className="text-xs text-[#64748B]">
          Automated geometric consistency, attribute integrity, and photographic evidence verification
        </p>
      </div>

      {/* Validation Checklist Card (Section 20) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033]">Validation Checklist</h3>
          </div>
          <button
            onClick={handleRevalidate}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-2.5 py-1 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-verify</span>
          </button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {validationResult.checks.map((check) => {
            const isSuccess = check.severity === 'success';
            const isWarning = check.severity === 'warning';
            const isError = check.severity === 'error';

            return (
              <div key={check.id} className="py-3 flex items-start gap-3 text-xs">
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-[#D97706]" />}
                  {isError && <XCircle className="w-4 h-4 text-[#DC2626]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172033] text-sm">{check.label}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isSuccess
                          ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                          : isWarning
                          ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                          : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      }`}
                    >
                      {check.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{check.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ready for Submission Banner */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-[#16A34A] font-bold block">
          All Pre-Flight Checks Passed
        </span>
        <div className="text-base font-bold text-[#166534]">
          Ready for Submission to V3D State Platform
        </div>
        <p className="text-xs text-[#64748B] font-mono">
          Candidate ID: <strong className="text-[#172033]">{survey.candidate3DId}</strong>
        </p>
      </div>

      {/* Upload Animation or Submit CTA (Section 20, 24) */}
      {isSubmitting ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            <div className="w-4 h-4 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
            <span>Transmitting Payload to V3D State Server...</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {UPLOAD_SEQUENCE.map((seq, idx) => {
              const isPassed = uploadStep > idx;
              const isCurrent = uploadStep === idx;

              return (
                <div
                  key={seq}
                  className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-lg ${
                    isPassed
                      ? 'text-[#16A34A] bg-[#F0FDF4] font-medium'
                      : isCurrent
                      ? 'text-[#1D4ED8] bg-[#EFF6FF] font-semibold'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  <span>{seq}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : isCurrent ? (
                    <span className="text-[10px] text-[#2563EB] font-mono animate-pulse">Syncing</span>
                  ) : (
                    <span className="text-[#CBD5E1]">○</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <UploadCloud className="w-5 h-5 text-white" />
          <span>Submit to V3D</span>
        </button>
      )}
    </div>
  );
};
