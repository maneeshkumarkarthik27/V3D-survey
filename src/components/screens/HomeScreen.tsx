import React from 'react';
import {
  Compass,
  Plus,
  MapPin,
  FolderArchive,
  UploadCloud,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Award,
  ChevronRight,
  ArrowRight,
  Camera,
  Sparkles
} from 'lucide-react';
import { Survey, SurveyorProfile } from '../../types/survey';

interface Props {
  surveyor: SurveyorProfile;
  surveys: Survey[];
  onStartNewSurvey: () => void;
  onOpenMap: () => void;
  onOpenDrafts: () => void;
  onOpenPending?: () => void;
  onOpenRealtimeScanner?: () => void;
  onSelectSurvey: (survey: Survey) => void;
  onOpenCertificate: (survey: Survey) => void;
  onSyncPending: () => void;
  pendingCount: number;
}

export const HomeScreen: React.FC<Props> = ({
  surveyor,
  surveys,
  onStartNewSurvey,
  onOpenMap,
  onOpenDrafts,
  onOpenPending,
  onOpenRealtimeScanner,
  onSelectSurvey,
  onOpenCertificate,
  onSyncPending,
  pendingCount
}) => {
  const drafts = surveys.filter(s => s.status === 'DRAFT');
  const recentSurveys = surveys.slice(0, 6);

  const getStatusBadge = (status: Survey['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            Verified
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
            <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
            Under Review
          </span>
        );
      case 'CORRECTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
            Correction Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Section (Clean White Card, Section 6) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 sm:p-6 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Good morning, Surveyor
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage field property surveys and submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Jurisdiction</span>
            <span className="font-bold text-[#172033]">{surveyor.region.split('(')[0]}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs">
            <span className="text-[#166534] block text-[10px] uppercase font-semibold">GNSS Accuracy</span>
            <span className="font-bold text-[#15803D]">±4.2m (RTK Lock)</span>
          </div>
        </div>
      </div>

      {/* Real-time House 3D Scanner Callout Banner */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#172033]">Real-Time House 3D Scanner</h2>
              <span className="text-[11px] font-bold text-[#1D4ED8] bg-white px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                Live Camera Photogrammetry
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-1">
              Take a live picture of a house in real time → Automatically convert into an interactive 3D model → Assign statutory ownership details.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRealtimeScanner}
          className="py-2.5 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Launch Real-Time 3D Scanner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK ACTIONS (Large cards, Section 6) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start New Survey */}
          <button
            onClick={onStartNewSurvey}
            className="p-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs flex flex-col justify-between text-left transition-all group min-h-[124px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </span>
              <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Start New Survey</div>
              <p className="text-xs text-blue-100 mt-1">Select parcel & initiate 3D capture</p>
            </div>
          </button>

          {/* Find Parcel */}
          <button
            onClick={onOpenMap}
            className="p-5 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] shadow-xs flex flex-col justify-between text-left transition-all group min-h-[124px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Find Parcel</div>
              <p className="text-xs text-[#64748B] mt-1">Cadastral GIS map & GPS location</p>
            </div>
          </button>

          {/* Continue Draft */}
          <button
            onClick={onOpenDrafts}
            className="p-5 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] shadow-xs flex flex-col justify-between text-left transition-all group min-h-[124px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="w-9 h-9 rounded-lg bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                {drafts.length} Saved
              </span>
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Continue Draft</div>
              <p className="text-xs text-[#64748B] mt-1">Resume cached offline surveys</p>
            </div>
          </button>

          {/* Pending Uploads */}
          <button
            onClick={onOpenPending || onSyncPending}
            className={`p-5 rounded-xl border text-left shadow-xs flex flex-col justify-between transition-all group min-h-[124px] ${
              pendingCount > 0
                ? 'bg-[#FFFBEB] border-[#FDE68A] hover:bg-[#FEF3C7]'
                : 'bg-[#FFFFFF] hover:bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  pendingCount > 0 ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                <UploadCloud className="w-5 h-5" />
              </span>
              {pendingCount > 0 && (
                <span className="text-xs font-mono font-bold text-[#B45309] bg-[#FDE68A] px-2 py-0.5 rounded-full">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-base text-[#172033] leading-tight">Pending Uploads</div>
              <p className="text-xs text-[#64748B] mt-1">
                {pendingCount > 0 ? `${pendingCount} payloads awaiting sync` : 'All records synchronized'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* STATISTICS (Assigned: 12, Completed: 7, Pending: 5, Drafts: 2, Section 6) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Survey Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-semibold text-[#64748B]">Assigned</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] mt-1.5 font-mono">
              {surveyor.assignedCount || 12}
            </div>
            <span className="text-[11px] text-[#64748B] mt-1 block">Assigned by District Cadastre</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-semibold text-[#16A34A]">Completed</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#16A34A] mt-1.5 font-mono">
              {surveyor.completedCount || 7}
            </div>
            <span className="text-[11px] text-[#64748B] mt-1 block">Verified & Registered</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-semibold text-[#D97706]">Pending</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#D97706] mt-1.5 font-mono">
              {surveyor.pendingCount || 5}
            </div>
            <span className="text-[11px] text-[#64748B] mt-1 block">Awaiting field inspection</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-semibold text-[#2563EB]">Drafts</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#2563EB] mt-1.5 font-mono">
              {drafts.length || 2}
            </div>
            <span className="text-[11px] text-[#64748B] mt-1 block">Locally cached on device</span>
          </div>
        </div>
      </div>

      {/* RECENT SURVEYS (Clean Table on Desktop / Cards on Mobile, Section 6) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#172033]">Recent Surveys</h2>
          </div>
          <button
            onClick={onOpenDrafts}
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
          >
            <span>View All ({surveys.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                <th className="py-3 px-5">Survey ID</th>
                <th className="py-3 px-4">Base ULPIN</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Floors</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {recentSurveys.map((survey) => (
                <tr
                  key={survey.id}
                  onClick={() => onSelectSurvey(survey)}
                  className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-[#2563EB]">
                    {survey.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#172033] font-medium">
                    {survey.baseUlpin}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">
                    <div className="font-semibold text-[#172033]">{survey.propertyType}</div>
                    <div className="text-xs text-[#64748B]">{survey.building.name}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569] font-medium">
                    {survey.building.basementCount > 0
                      ? `B + G + ${survey.building.floorCount - 1}`
                      : `G + ${survey.building.floorCount - 1}`} ({survey.floors.length} lvls)
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(survey.status)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {survey.status === 'VERIFIED' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCertificate(survey);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Certificate</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#2563EB] group-hover:underline inline-flex items-center gap-0.5">
                        Open <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Visible only on mobile < 768px) */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {recentSurveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => onSelectSurvey(survey)}
              className="p-4 hover:bg-[#F8FAFC] transition-colors space-y-2.5 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-[#2563EB]">{survey.id}</div>
                  <div className="text-xs text-[#64748B] font-mono">Base: {survey.baseUlpin}</div>
                </div>
                {getStatusBadge(survey.status)}
              </div>

              <div className="text-xs text-[#475569] grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Property</span>
                  <span className="font-medium text-[#172033]">{survey.propertyType}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Floors</span>
                  <span className="font-medium text-[#172033]">{survey.floors.length} levels</span>
                </div>
              </div>

              {survey.candidate3DId && (
                <div className="text-[11px] font-mono text-[#475569] truncate bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#DBEAFE]">
                  {survey.candidate3DId}
                </div>
              )}

              {survey.status === 'VERIFIED' && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCertificate(survey);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>View Certificate</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
