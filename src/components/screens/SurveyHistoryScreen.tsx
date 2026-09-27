import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  Calendar,
  Building,
  ArrowRight,
  Download
} from 'lucide-react';
import { Survey, SurveyStatus } from '../../types/survey';

interface Props {
  surveys: Survey[];
  onSelectSurvey: (survey: Survey) => void;
  onOpenCertificate: (survey: Survey) => void;
}

export const SurveyHistoryScreen: React.FC<Props> = ({
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
      (s.candidate3DId && s.candidate3DId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.building.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#2563EB]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Survey History & Audit Log
            </h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Chronological audit trail of all vertical property surveys, registrations, and official reviews.
          </p>
        </div>

        <div className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2 rounded-lg self-start sm:self-auto">
          Total Recorded: <strong className="text-[#172033]">{surveys.length} Dossiers</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Survey ID, Base ULPIN, Building Name, or 3D Spatial ID..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[#64748B] font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['ALL', 'VERIFIED', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'DRAFT'] as const).map((status) => {
            const isActive = statusFilter === status;
            const count = status === 'ALL' ? surveys.length : surveys.filter(s => s.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                <span>{status === 'ALL' ? 'All Records' : status.replace('_', ' ')}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#475569]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* History Table (Desktop / Tablet) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                <th className="py-3 px-5">Dossier ID</th>
                <th className="py-3 px-4">Base ULPIN</th>
                <th className="py-3 px-4">Building & Parcel</th>
                <th className="py-3 px-4">Levels / Units</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B] text-xs">
                    No survey records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
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
                      <div className="font-semibold text-[#172033]">{survey.building.name}</div>
                      <div className="text-xs text-[#64748B]">{survey.propertyType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <span className="font-medium text-[#172033]">{survey.floors.length} Floors</span>
                      <span className="text-xs text-[#64748B] block">{survey.units.length} Units</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(survey.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] font-mono">
                      {new Date(survey.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {survey.status === 'VERIFIED' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCertificate(survey);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Certificate</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#2563EB] group-hover:underline inline-flex items-center gap-0.5">
                            Inspect <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {filteredSurveys.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] text-xs">
              No survey records match the selected filter.
            </div>
          ) : (
            filteredSurveys.map((survey) => (
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
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Building</span>
                    <span className="font-medium text-[#172033]">{survey.building.name}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Levels</span>
                    <span className="font-medium text-[#172033]">{survey.floors.length} Floors</span>
                  </div>
                </div>

                {survey.candidate3DId && (
                  <div className="text-[11px] font-mono text-[#475569] truncate bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#DBEAFE]">
                    {survey.candidate3DId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
