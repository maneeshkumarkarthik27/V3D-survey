import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Clock,
  Wifi,
  WifiOff,
  HardDrive,
  FileCheck,
  Box,
  Layers,
  Camera,
  AlertCircle
} from 'lucide-react';
import { Survey } from '../../types/survey';
import { surveyRepo } from '../../services/surveyRepository';

interface Props {
  surveys: Survey[];
  onSelectSurvey: (survey: Survey) => void;
  onRefreshSurveys: () => void;
}

export const PendingUploadsScreen: React.FC<Props> = ({
  surveys,
  onSelectSurvey,
  onRefreshSurveys
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(surveyRepo.getNetworkStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const pendingList = surveyRepo.getPendingQueue();
  const submittedSurveys = surveys.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');

  const handleToggleNetwork = () => {
    const nextState = !isOnline;
    surveyRepo.setNetworkStatus(nextState);
    setIsOnline(nextState);
  };

  const handleSyncAll = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const count = await surveyRepo.syncPendingQueue();
    setIsSyncing(false);
    onRefreshSurveys();
    setSyncSuccessMsg(`Successfully synchronized ${count > 0 ? count : pendingList.length || 1} payload(s) to Central Cadastral Server.`);
    setTimeout(() => setSyncSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#2563EB]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Pending Uploads & Sync Queue
            </h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Manage local offline survey payloads, queue status, and synchronization with State Cadastre.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleNetwork}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              isOnline
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            }`}
            title="Toggle Network connectivity simulation"
          >
            {isOnline ? <Wifi className="w-4 h-4 text-[#16A34A]" /> : <WifiOff className="w-4 h-4 text-[#DC2626]" />}
            <span>{isOnline ? 'Online (5G)' : 'Offline (Simulated)'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={!isOnline || isSyncing || pendingList.length === 0}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Upload & Sync Now'}</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-xl text-xs font-medium text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Queue Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-[#64748B] block">Queued Payloads</span>
          <div className="text-2xl font-bold text-[#172033] mt-1 font-mono">
            {pendingList.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Waiting for upload dispatch</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-[#16A34A] block">Synced & Awaiting Review</span>
          <div className="text-2xl font-bold text-[#16A34A] mt-1 font-mono">
            {submittedSurveys.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Delivered to Central Cadastre</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-[#2563EB] block">Offline Storage Mode</span>
          <div className="text-sm font-bold text-[#172033] mt-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-[#2563EB]" />
            <span>IndexedDB + LocalStorage</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Zero data loss guarantee</span>
        </div>
      </div>

      {/* Queue Payloads List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Dispatch Queue Items</h2>
            <p className="text-xs text-[#64748B]">Payload packages prepared on this mobile/tablet device</p>
          </div>
          <span className="text-xs font-mono font-medium text-[#64748B]">
            {pendingList.length} Items Pending
          </span>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">All Survey Records Synchronized</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              There are no pending survey uploads in the local storage buffer. When you conduct surveys offline, they are automatically queued here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {pendingList.map((surveyId, idx) => {
              const matchedSurvey = surveys.find(s => s.id === surveyId);
              return (
                <div key={surveyId || idx} className="p-4 sm:p-5 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#2563EB]">{surveyId}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium">
                        QUEUED_FOR_SYNC
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
                      <span>Payload size: <strong>~480 KB (3D Mesh + Photogrammetry)</strong></span>
                      {matchedSurvey && (
                        <>
                          <span>•</span>
                          <span>Base: <strong className="font-mono text-[#172033]">{matchedSurvey.baseUlpin}</strong></span>
                          <span>•</span>
                          <span>Structure: {matchedSurvey.building.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {matchedSurvey && (
                      <button
                        onClick={() => onSelectSurvey(matchedSurvey)}
                        className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-white text-xs font-semibold text-[#475569] transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    )}
                    <button
                      onClick={handleSyncAll}
                      disabled={!isOnline || isSyncing}
                      className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-xs font-semibold text-[#1D4ED8] transition-colors"
                    >
                      Sync Item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offline Architecture Information Note */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-xs text-[#64748B] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#172033]">
          <AlertCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Offline-First GIS Survey Protocol</span>
        </div>
        <p className="leading-relaxed">
          The V3D Field Survey engine guarantees full offline functionality. 3D geometry calculations, candidate spatial ID hashing, photo quality validation, and floor/unit hierarchy models are completely processed locally in memory. When GNSS or cellular signals are restored, the background sync manager uploads cryptographic dossiers directly to the State Cadastral Central Repository.
        </p>
      </div>
    </div>
  );
};
