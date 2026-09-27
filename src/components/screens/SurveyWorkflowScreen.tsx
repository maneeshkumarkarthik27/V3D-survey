import React, { useState } from 'react';
import { Survey, Parcel } from '../../types/survey';
import { surveyRepo } from '../../services/surveyRepository';
import { StepLocation } from '../survey/StepLocation';
import { StepProperty } from '../survey/StepProperty';
import { StepBuilding } from '../survey/StepBuilding';
import { StepFloors } from '../survey/StepFloors';
import { StepUnits } from '../survey/StepUnits';
import { StepCamera } from '../survey/StepCamera';
import { StepBlueprint } from '../survey/StepBlueprint';
import { Step3DModel } from '../survey/Step3DModel';
import { StepCandidateId } from '../survey/StepCandidateId';
import { StepOwnership } from '../survey/StepOwnership';
import { StepValidation } from '../survey/StepValidation';
import { RealtimeHouse3DScanner } from '../camera/RealtimeHouse3DScanner';
import { ChevronLeft, ChevronRight, CheckCircle2, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialSurvey: Survey;
  parcel: Parcel;
  onExit: () => void;
  onViewCertificate: (survey: Survey) => void;
}

const STEPS = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Property' },
  { id: 3, label: 'Building' },
  { id: 4, label: 'Floors' },
  { id: 5, label: 'Units' },
  { id: 6, label: 'Capture' },
  { id: 7, label: 'Blueprint' },
  { id: 8, label: '3D Model' },
  { id: 9, label: 'Candidate ID' },
  { id: 10, label: 'Ownership' },
  { id: 11, label: 'Validation' }
];

export const SurveyWorkflowScreen: React.FC<Props> = ({
  initialSurvey,
  parcel,
  onExit,
  onViewCertificate
}) => {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [currentStep, setCurrentStep] = useState<number>(initialSurvey.currentStep || 1);
  const [saveIndicator, setSaveIndicator] = useState<string>('Autosaved');
  const [submissionComplete, setSubmissionComplete] = useState<boolean>(false);
  const [isRealtimeScanning, setIsRealtimeScanning] = useState<boolean>(false);

  const handleUpdateSurvey = (updated: Partial<Survey>) => {
    const nextSurvey = {
      ...survey,
      ...updated,
      currentStep: currentStep,
      updatedAt: new Date().toISOString()
    };
    setSurvey(nextSurvey);
    surveyRepo.saveSurvey(nextSurvey);
    setSaveIndicator('Saving...');
    setTimeout(() => setSaveIndicator('Autosaved ✓'), 400);
  };

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      handleUpdateSurvey({ currentStep: next });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      handleUpdateSurvey({ currentStep: prev });
    }
  };

  const handleStepClick = (stepNum: number) => {
    setCurrentStep(stepNum);
    handleUpdateSurvey({ currentStep: stepNum });
  };

  const handleSubmitSuccess = (submitted: Survey) => {
    setSurvey(submitted);
    setSubmissionComplete(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleSimulateOfficialReview = () => {
    const reviewed = surveyRepo.simulateOfficialAction(survey.id, 'UNDER_REVIEW');
    setSurvey(reviewed);
  };

  const handleSimulateOfficialVerify = () => {
    const verified = surveyRepo.simulateOfficialAction(survey.id, 'VERIFIED');
    setSurvey(verified);
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  };

  const currentStepObj = STEPS.find(s => s.id === currentStep) || STEPS[0];

  return (
    <div className="space-y-5">
      {/* Workflow Navigation Header & Stepper (Section 11) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base text-[#2563EB]">{survey.id}</span>
            <span className="text-xs text-[#64748B] font-mono">Base Parcel: {survey.baseUlpin}</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
              {saveIndicator}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">
              Step <strong className="text-[#172033]">{currentStep}</strong> of {STEPS.length}: {currentStepObj.label}
            </span>
            <button
              onClick={onExit}
              className="text-xs text-[#64748B] hover:text-[#172033] font-medium ml-2 px-2 py-1 rounded hover:bg-[#F8FAFC]"
            >
              Exit to Menu
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Horizontal Stepper (Section 11) */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.id;
            const isDone = currentStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : isDone
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                    : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">{s.id}</span>
                <span>{s.label}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="sm:hidden space-y-1.5">
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#64748B]">
            <span>{currentStepObj.label}</span>
            <span>{Math.round((currentStep / STEPS.length) * 100)}% Completed</span>
          </div>
        </div>
      </div>

      {/* Active Step Content */}
      <div className="min-h-[460px]">
        {currentStep === 1 && (
          <StepLocation survey={survey} parcel={parcel} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 2 && (
          <StepProperty survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 3 && (
          <StepBuilding survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 4 && (
          <StepFloors survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 5 && (
          <StepUnits survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 6 && (
          <StepCamera
            survey={survey}
            onUpdateSurvey={handleUpdateSurvey}
            onLaunchRealtimeScanner={() => setIsRealtimeScanning(true)}
          />
        )}
        {currentStep === 7 && (
          <StepBlueprint survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 8 && (
          <Step3DModel survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 9 && (
          <StepCandidateId survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 10 && (
          <StepOwnership survey={survey} onUpdateSurvey={handleUpdateSurvey} />
        )}
        {currentStep === 11 && (
          <StepValidation survey={survey} onSubmitSuccess={handleSubmitSuccess} />
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      {!submissionComplete && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E2E8F0] p-4 rounded-xl shadow-sm flex items-center justify-between gap-3 z-20">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="py-2.5 px-4 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 text-[#475569] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-[#64748B] hidden sm:inline">
            Step {currentStep} of {STEPS.length}
          </span>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNextStep}
              className="py-2.5 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      )}

      {/* Submission Success Dialog Modal (Section 21) */}
      {submissionComplete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#059669]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                Transmission Acknowledged
              </span>
              <h2 className="text-xl font-bold text-[#172033]">Survey Submitted Successfully</h2>
              <p className="text-xs text-[#64748B]">
                Payload ingested into the V3D cloud geospatial repository for official verification.
              </p>
            </div>

            {/* Dossier Specifications Summary */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Survey ID:</span>
                <span className="font-bold text-[#172033]">{survey.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Base ULPIN:</span>
                <span className="text-[#172033]">{survey.baseUlpin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Candidate 3D ID:</span>
                <span className="text-[#2563EB] font-bold truncate max-w-[210px]">{survey.candidate3DId}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E2E8F0]">
                <span className="text-[#64748B]">Verification Status:</span>
                <span className={`font-bold ${survey.status === 'VERIFIED' ? 'text-[#16A34A]' : 'text-[#7C3AED]'}`}>
                  {survey.status === 'VERIFIED'
                    ? 'Verified ✓'
                    : survey.status === 'UNDER_REVIEW'
                    ? 'Under Review'
                    : 'Pending Official Verification'}
                </span>
              </div>
            </div>

            {/* Timeline (Section 21) */}
            <div className="text-left text-xs border border-[#E2E8F0] rounded-xl p-3 bg-white space-y-2">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Workflow Progress
              </div>
              <div className="space-y-1.5 font-medium">
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Survey Created & Captured</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3D Digital Twin Generated</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submitted to V3D Hub</span>
                </div>
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Official Registrar Review: Pending</span>
                </div>
              </div>
            </div>

            {/* Actions & Simulation */}
            <div className="space-y-2 pt-1">
              {survey.status !== 'VERIFIED' ? (
                <>
                  <button
                    onClick={handleSimulateOfficialVerify}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Simulate Official Verification (Issue Certificate)
                  </button>
                  <button
                    onClick={handleSimulateOfficialReview}
                    className="w-full py-2 px-3 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] font-medium text-xs transition-colors"
                  >
                    Simulate Status → Under Review
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onViewCertificate(survey)}
                  className="w-full py-3 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Open Prototype 3D Certificate</span>
                </button>
              )}

              <button
                onClick={onExit}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] font-semibold text-xs transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time House 3D Scanner Modal within Survey Workflow */}
      {isRealtimeScanning && (
        <RealtimeHouse3DScanner
          initialParcel={parcel}
          onClose={() => setIsRealtimeScanning(false)}
          onCompleted={(scannedSurvey) => {
            setSurvey(scannedSurvey);
            setIsRealtimeScanning(false);
            handleStepClick(8); // jump straight to 3D model & ownership inspection
          }}
        />
      )}
    </div>
  );
};
