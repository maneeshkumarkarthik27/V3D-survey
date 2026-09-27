import React, { useState } from 'react';
import { Survey, SurveyStatus } from '../../types/survey';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  Search,
  ArrowRight,
  Download
} from 'lucide-react';
import { downloadCertificatePDF } from '../../services/certificatePdfGenerator';

interface Props {
  surveys: Survey[];
  onSelectSurvey: (survey: Survey) => void;
  onOpenCertificate: (survey: Survey) => void;
}

export const SurveysListScreen: React.FC<Props> = ({
  surveys,
  onSelectSurvey,
  onOpenCertificate
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | SurveyStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurveys = surveys.filter(s => {
    const matchesFilter = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.baseUlpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.candidate3DId && s.candidate3DId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: SurveyStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Under Review
          </span>
        );
      case 'CORRECTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Correction Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[#172033]">Survey Registry</h1>
            <p className="text-xs text-[#64748B]">Complete cadastral survey dossiers and verification statuses</p>
          </div>
          <span className="text-xs font-semibold text-[#64748B] self-start sm:self-auto">
            {filteredSurveys.length} of {surveys.length} Records
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Survey ID, Base ULPIN, or Candidate ID..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'CORRECTION_REQUIRED', 'DRAFT'] as const).map(
            (status) => {
              const isSelected = statusFilter === status;
              const count = status === 'ALL' ? surveys.length : surveys.filter(s => s.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All Records' : status.replace('_', ' ')}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-3">
        {filteredSurveys.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-[#64748B] text-sm">
            No survey records match the current filter criteria.
          </div>
        ) : (
          filteredSurveys.map((survey) => {
            const isCorrection = survey.status === 'CORRECTION_REQUIRED';
            const isVerified = survey.status === 'VERIFIED';

            return (
              <div
                key={survey.id}
                onClick={() => onSelectSurvey(survey)}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-colors cursor-pointer group space-y-3 ${
                  isCorrection
                    ? 'border-rose-300 hover:border-rose-400'
                    : isVerified
                    ? 'border-[#E2E8F0] hover:border-emerald-300'
                    : 'border-[#E2E8F0] hover:border-[#BFDBFE]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#2563EB]">{survey.id}</span>
                      {getStatusBadge(survey.status)}
                    </div>
                    <div className="text-xs text-[#64748B] font-mono mt-0.5">
                      Base 2D ULPIN: <strong className="text-[#172033]">{survey.baseUlpin}</strong>
                    </div>
                  </div>

                  {isVerified && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCertificate(survey);
                        }}
                        className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#DCFCE7] transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await downloadCertificatePDF(survey);
                        }}
                        className="flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                        title="Download Certificate PDF directly"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 29: Correction Workflow */}
                {isCorrection && survey.verification?.officialComments && (
                  <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-lg p-3 text-xs text-[#9F1239] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#E11D48]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>OFFICIAL CORRECTION REQUIRED</span>
                    </div>
                    <p className="text-xs text-[#9F1239]">
                      <strong>Official Comment:</strong> {survey.verification.officialComments}
                    </p>
                    <div className="pt-1 flex items-center justify-end">
                      <span className="text-xs font-bold text-[#BE123C] flex items-center gap-1 group-hover:underline">
                        <span>Open Survey & Correct</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Property Structure Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Property Type</span>
                    <span className="font-semibold text-[#172033] mt-0.5 block">{survey.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Building</span>
                    <span className="font-semibold text-[#172033] mt-0.5 block truncate">{survey.building.name}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Vertical Levels</span>
                    <span className="font-semibold text-[#172033] mt-0.5 block">{survey.floors.length} Levels ({survey.building.approxHeightMeters}m H)</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Units</span>
                    <span className="font-semibold text-[#172033] mt-0.5 block">{survey.units.length} Units</span>
                  </div>
                </div>

                {/* Candidate 3D ID Footer */}
                {survey.candidate3DId && (
                  <div className="flex items-center justify-between text-xs bg-[#EFF6FF] border border-[#DBEAFE] px-3 py-1.5 rounded-lg text-[#1D4ED8]">
                    <span className="font-mono font-medium truncate">{survey.candidate3DId}</span>
                    <ChevronRight className="w-4 h-4 text-[#2563EB] shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
