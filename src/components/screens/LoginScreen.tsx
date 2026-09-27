import React, { useState } from 'react';
import { Box, MapPin, Compass, Shield, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { CURRENT_SURVEYOR } from '../../data/mockData';
import { PrototypeBadge } from '../common/PrototypeBadge';

interface Props {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 max-w-md mx-auto w-full">
      {/* Official Branding Card */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Logo & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
            V3D
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              V3D Field Survey
            </h1>
            <p className="text-xs font-semibold text-[#2563EB] mt-0.5">
              3D Property Survey & Spatial Registration
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              State Geospatial Cadastral Survey Portal (SIH26011)
            </p>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="text-center">
          <PrototypeBadge variant="synthetic-data" />
        </div>

        {/* Surveyor Credentials Card */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#64748B] uppercase tracking-wider">
              Surveyor Profile
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
              RTK Authorized
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              KR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#172033] truncate">
                  {CURRENT_SURVEYOR.name}
                </span>
                <span className="text-[11px] font-mono font-medium text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.2 rounded border border-[#BFDBFE]">
                  {CURRENT_SURVEYOR.id}
                </span>
              </div>
              <p className="text-xs text-[#64748B] truncate mt-0.5">{CURRENT_SURVEYOR.role}</p>
              <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                <span className="truncate">{CURRENT_SURVEYOR.region}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-75 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Sign In as Field Surveyor</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>

        {/* Footer Guidance */}
        <div className="border-t border-[#E2E8F0] pt-4 text-center">
          <p className="text-[11px] text-[#64748B]">
            Field surveyor authentication complies with State Land Administration & Cadastral Registration guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
