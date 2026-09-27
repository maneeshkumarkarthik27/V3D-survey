import React from 'react';
import { Survey, Parcel } from '../../types/survey';
import { Compass, MapPin, Clock, UserCheck } from 'lucide-react';

interface Props {
  survey: Survey;
  parcel: Parcel;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
}

export const StepLocation: React.FC<Props> = ({ survey, parcel }) => {
  return (
    <div className="space-y-4">
      {/* Cadastral Land Reference Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Existing 2D Land Parcel (Base Cadastre)</h2>
              <p className="text-xs text-[#64748B]">Foundational land reference for vertical volumetric mapping</p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-md border border-[#BFDBFE]">
            {survey.baseUlpin}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Address / Landmark</span>
            <p className="text-[#172033] font-medium mt-1 leading-snug">{parcel.address}</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Jurisdiction</span>
            <p className="text-[#172033] font-medium mt-1 leading-snug">{parcel.village}, {parcel.taluk}, {parcel.district}</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Cadastral Survey No.</span>
            <p className="text-[#172033] font-mono font-medium mt-1 leading-snug">{parcel.surveyNumber} / {parcel.subDivision}</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Base Parcel Extent</span>
            <p className="text-[#172033] font-mono font-medium mt-1 leading-snug">{parcel.areaSqMeters} m² ({parcel.landUse})</p>
          </div>
        </div>
      </div>

      {/* GNSS / GPS Lock Diagnostics Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033]">GNSS Field Telemetry & Geodetic Fix</h3>
              <p className="text-xs text-[#64748B]">Real-time coordinate lock at physical building boundary</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
            GPS Locked ✓
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Latitude</span>
            <div className="text-sm font-mono font-bold text-[#172033] mt-0.5">13.0850° N</div>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Longitude</span>
            <div className="text-sm font-mono font-bold text-[#172033] mt-0.5">80.2101° E</div>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Estimated Accuracy</span>
            <div className="text-sm font-mono font-bold text-[#16A34A] mt-0.5">± 4.2 m</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Session Timestamp: {new Date(survey.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Survey Officer: {survey.surveyorId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
