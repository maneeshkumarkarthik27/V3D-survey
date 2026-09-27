import React, { useState } from 'react';
import { SurveyorProfile } from '../../types/survey';
import { surveyRepo } from '../../services/surveyRepository';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  CheckCircle2,
  HardDrive,
  Camera,
  Compass,
  LogOut
} from 'lucide-react';

interface Props {
  surveyor: SurveyorProfile;
  onLogout: () => void;
  onResetData: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ surveyor, onLogout, onResetData }) => {
  const [isOnline, setIsOnline] = useState(surveyRepo.getNetworkStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const pendingCount = surveyRepo.getPendingQueue().length;

  const handleToggleOnline = () => {
    const next = !isOnline;
    surveyRepo.setNetworkStatus(next);
    setIsOnline(next);
  };

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const count = await surveyRepo.syncPendingQueue();
    setIsSyncing(false);
    setSyncMessage(`Successfully synchronized ${count} pending survey payloads.`);
    setTimeout(() => setSyncMessage(null), 3500);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Surveyor Credential Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Field Officer Identification
          </span>
          <span className="text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
            Active Duty
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            KR
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#172033]">{surveyor.name}</h2>
            <p className="text-xs text-[#2563EB] font-semibold">{surveyor.role}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B] font-mono">
              <span>ID: <strong className="text-[#172033]">{surveyor.id}</strong></span>
              <span>•</span>
              <span>Badge: {surveyor.badgeNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0]">
          <div>
            <span className="text-[#64748B] text-[11px] block">Assigned Sector</span>
            <p className="font-semibold text-[#172033] mt-0.5">{surveyor.region}</p>
          </div>
          <div>
            <span className="text-[#64748B] text-[11px] block">GNSS RTK Rating</span>
            <p className="font-bold text-[#16A34A] mt-0.5">{surveyor.accuracyRating}</p>
          </div>
        </div>
      </div>

      {/* Network Connectivity & Sync Card (Section 33) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033]">Field Connectivity & Sync Status</h3>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
              isOnline
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (5G / RTK Active)' : 'Offline (Local Only)'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs">
          <div>
            <span className="text-[#64748B]">Pending Local Payloads:</span>
            <strong className="text-[#172033] ml-1.5 font-mono">{pendingCount} records awaiting cloud sync</strong>
          </div>

          <button
            onClick={handleSync}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Sensor Calibration Diagnostics */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Field Sensor Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">GNSS RTK Fix</span>
              <span className="font-bold text-[#16A34A]">Locked (±4.2m Accuracy)</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">Optical Sensor</span>
              <span className="font-bold text-[#172033]">12MP Calibrated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset & Session Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onResetData}
          className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-[#94A3B8]" />
          <span>Reset Demonstration Datasets</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#DC2626]" />
          <span>Sign Out of Surveyor Portal</span>
        </button>
      </div>
    </div>
  );
};
