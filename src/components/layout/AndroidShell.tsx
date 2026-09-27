import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Compass,
  Home,
  FileText,
  MapPin,
  FolderArchive,
  User,
  UploadCloud,
  History,
  ChevronLeft,
  Menu,
  X,
  Layers,
  Box,
  RefreshCw
} from 'lucide-react';
import { surveyRepo } from '../../services/surveyRepository';
import { CURRENT_SURVEYOR } from '../../data/mockData';

export type ActiveTab = 'home' | 'map' | 'surveys' | 'drafts' | 'pending' | 'history' | 'profile' | 'survey_workflow';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  pendingCount?: number;
}

export const AndroidShell: React.FC<Props> = ({
  activeTab,
  onTabChange,
  title = 'V3D Field Survey',
  subtitle = '3D Property Survey & Spatial Registration',
  showBack = false,
  onBack,
  children,
  pendingCount = 0
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [tabletCollapsed, setTabletCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(surveyRepo.getNetworkStatus());
  }, []);

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    surveyRepo.setNetworkStatus(nextState);
    setIsOnline(nextState);
  };

  const handleSyncNow = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    await surveyRepo.syncPendingQueue();
    setIsSyncing(false);
  };

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'map' as ActiveTab, label: 'Map', icon: MapPin },
    { id: 'surveys' as ActiveTab, label: 'Surveys', icon: FileText },
    { id: 'drafts' as ActiveTab, label: 'Drafts', icon: FolderArchive },
    { id: 'pending' as ActiveTab, label: 'Pending Uploads', icon: UploadCloud, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'history' as ActiveTab, label: 'Survey History', icon: History },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User }
  ];

  // Mobile bottom bar items (top 5 essential)
  const mobileNavItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'map' as ActiveTab, label: 'Map', icon: MapPin },
    { id: 'surveys' as ActiveTab, label: 'Surveys', icon: FileText },
    { id: 'drafts' as ActiveTab, label: 'Drafts', icon: FolderArchive },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col font-sans antialiased">
      {/* Top Quiet Official Metadata Ribbon */}
      <div className="bg-[#EFF6FF] border-b border-[#DBEAFE] px-4 py-1 text-center text-xs font-medium text-[#1E40AF] flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        <span>Prototype • Synthetic Demonstration Data • Candidate 3D Spatial IDs (SIH26011)</span>
      </div>

      {/* Offline Status Alert */}
      {!isOnline && (
        <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-4 py-1.5 text-center text-xs font-medium text-[#92400E] flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Offline mode active — changes cached locally in IndexedDB and will sync upon connection.</span>
        </div>
      )}

      {/* GLOBAL HEADER (Height 64-72px, Clean White, Subtle Bottom Border) */}
      <header className="h-16 sm:h-[68px] bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Mobile & Tablet Sidebar Hamburger Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            aria-label="Toggle navigation drawer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Back Button or V3D Official Logo */}
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-3 py-2 rounded-lg transition-colors mr-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
              V3D
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#172033] leading-tight">
                V3D Field Survey
              </span>
              <span className="hidden md:inline-block text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                Cadastral 3D
              </span>
            </div>
            <p className="text-xs text-[#64748B] hidden sm:block leading-tight">
              3D Property Survey & Spatial Registration
            </p>
          </div>
        </div>

        {/* Center / Right: Survey Status, Network Status, Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* GNSS Accuracy Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#475569]">
            <Compass className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>GNSS ±4.2m (RTK Lock)</span>
          </div>

          {/* Network Status Toggle Button (Section 4 & Section 33) */}
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isOnline
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534] hover:bg-[#DCFCE7]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] hover:bg-[#FEE2E2]'
            }`}
            title="Click to toggle Network simulation"
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {/* Pending Sync Trigger Button */}
          {pendingCount > 0 && isOnline && (
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : `${pendingCount} Pending`}</span>
              <span className="sm:hidden">{pendingCount}</span>
            </button>
          )}

          {/* Surveyor Profile Pill */}
          <div
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-2 pl-2 sm:border-l border-[#E2E8F0] cursor-pointer hover:opacity-85 transition-opacity"
            title="View Surveyor Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              KR
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-bold text-[#172033] leading-tight">{CURRENT_SURVEYOR.name}</div>
              <div className="text-[11px] text-[#64748B] leading-tight">{CURRENT_SURVEYOR.id}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full">
        {/* DESKTOP SIDEBAR (Width 240-280px, Clean White, Section 5) */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 sm:top-[68px] z-30 w-64 lg:w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-3.5 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Cadastral Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border-l-4 border-[#2563EB]'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#172033]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom (App Version, Prototype / Synthetic Data Notice) */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2 text-xs text-[#64748B]">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span>App Version</span>
              <span className="font-semibold text-[#172033]">v2.6.4-prod</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[11px] text-[#1E40AF] leading-relaxed">
              <strong>Prototype Notice:</strong> Synthetic demo GIS dataset for SIH26011 3D Spatial Registration.
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Workspace Content (Responsive & Full Bleed where needed) */}
        <main
          className={`flex-1 w-full min-w-0 ${
            activeTab === 'map'
              ? 'p-3 sm:p-5 pb-20 lg:pb-5 flex flex-col'
              : 'p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto'
          }`}
        >
          <div className={`${activeTab === 'map' ? 'w-full flex-1 flex flex-col' : 'max-w-7xl mx-auto w-full'}`}>
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (< 768px, Touch Friendly, Section 3) */}
      {activeTab !== 'survey_workflow' && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E2E8F0] py-1 px-2 flex items-center justify-around z-30 shadow-md">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] rounded-lg transition-colors ${
                  isActive ? 'text-[#2563EB] font-bold' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
