import React, { useState, useEffect } from 'react';
import { AndroidShell, ActiveTab } from './components/layout/AndroidShell';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { MapScreen } from './components/screens/MapScreen';
import { SurveysListScreen } from './components/screens/SurveysListScreen';
import { DraftsScreen } from './components/screens/DraftsScreen';
import { PendingUploadsScreen } from './components/screens/PendingUploadsScreen';
import { SurveyHistoryScreen } from './components/screens/SurveyHistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SurveyWorkflowScreen } from './components/screens/SurveyWorkflowScreen';
import { CertificateScreen } from './components/screens/CertificateScreen';
import { RealtimeHouse3DScanner } from './components/camera/RealtimeHouse3DScanner';
import { Survey, Parcel } from './types/survey';
import { CURRENT_SURVEYOR, DEMO_PARCELS } from './data/mockData';
import { surveyRepo } from './services/surveyRepository';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in with demo surveyor
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel>(DEMO_PARCELS[0]);
  const [isViewingCertificate, setIsViewingCertificate] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isRealtimeScannerOpen, setIsRealtimeScannerOpen] = useState<boolean>(false);

  const refreshSurveys = () => {
    const list = surveyRepo.getAllSurveys();
    setSurveys(list);
    setPendingCount(surveyRepo.getPendingQueue().length);
  };

  useEffect(() => {
    refreshSurveys();
  }, []);

  const handleStartNewSurvey = (targetParcel?: Parcel) => {
    const parcelToUse = targetParcel || selectedParcel;
    const newSurvey = surveyRepo.createNewSurvey(parcelToUse);
    setActiveSurvey(newSurvey);
    setSelectedParcel(parcelToUse);
    setIsViewingCertificate(false);
    setActiveTab('survey_workflow');
    refreshSurveys();
  };

  const handleSelectSurveyToOpen = (survey: Survey) => {
    const parcel = DEMO_PARCELS.find(p => p.id === survey.parcelId || p.baseUlpin === survey.baseUlpin) || DEMO_PARCELS[0];
    setSelectedParcel(parcel);
    setActiveSurvey(survey);
    setIsViewingCertificate(false);
    setActiveTab('survey_workflow');
  };

  const handleOpenCertificate = (survey: Survey) => {
    setActiveSurvey(survey);
    setIsViewingCertificate(true);
  };

  const handleCloseCertificate = () => {
    setIsViewingCertificate(false);
  };

  const handleExitWorkflow = () => {
    setActiveSurvey(null);
    setActiveTab('home');
    refreshSurveys();
  };

  const handleResetData = () => {
    surveyRepo.resetToDefaults();
    refreshSurveys();
    setActiveTab('home');
  };

  const handleSyncPending = async () => {
    await surveyRepo.syncPendingQueue();
    refreshSurveys();
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <AndroidShell
        activeTab="home"
        onTabChange={() => {}}
        title="V3D Field Survey"
        subtitle="Field Surveyor Portal"
      >
        <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
      </AndroidShell>
    );
  }

  // Certificate Viewer Screen
  if (isViewingCertificate && activeSurvey) {
    return (
      <AndroidShell
        activeTab="surveys"
        onTabChange={(tab) => {
          setIsViewingCertificate(false);
          setActiveTab(tab);
        }}
        title="3D Property Certificate"
        subtitle={activeSurvey.candidate3DId || activeSurvey.id}
        showBack={true}
        onBack={handleCloseCertificate}
      >
        <CertificateScreen survey={activeSurvey} onBack={handleCloseCertificate} />
      </AndroidShell>
    );
  }

  // Active Survey Workflow Screen (Steps 1 through 11)
  if (activeTab === 'survey_workflow' && activeSurvey) {
    return (
      <AndroidShell
        activeTab="survey_workflow"
        onTabChange={() => {}}
        title="3D Property Survey"
        subtitle={`Base: ${activeSurvey.baseUlpin}`}
        showBack={true}
        onBack={handleExitWorkflow}
      >
        <SurveyWorkflowScreen
          initialSurvey={activeSurvey}
          parcel={selectedParcel}
          onExit={handleExitWorkflow}
          onViewCertificate={handleOpenCertificate}
        />
      </AndroidShell>
    );
  }

  // Header Titles by Tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'map':
        return { title: 'Cadastral GIS Map', subtitle: 'Find & Select Base Parcel' };
      case 'surveys':
        return { title: 'Survey Registry', subtitle: 'Official Dossiers & Verification' };
      case 'drafts':
        return { title: 'Offline Drafts', subtitle: 'Local Device Persistence' };
      case 'pending':
        return { title: 'Pending Uploads', subtitle: 'Offline Sync Queue & Dispatch Buffer' };
      case 'history':
        return { title: 'Survey History', subtitle: 'Chronological Audit Trail & Status Log' };
      case 'profile':
        return { title: 'Surveyor Profile', subtitle: `${CURRENT_SURVEYOR.name} (${CURRENT_SURVEYOR.id})` };
      default:
        return { title: 'V3D Field Survey', subtitle: '3D Property Survey & Spatial Registration' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <AndroidShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={title}
      subtitle={subtitle}
      pendingCount={pendingCount}
    >
      {activeTab === 'home' && (
        <HomeScreen
          surveyor={CURRENT_SURVEYOR}
          surveys={surveys}
          onStartNewSurvey={() => handleStartNewSurvey()}
          onOpenMap={() => setActiveTab('map')}
          onOpenDrafts={() => setActiveTab('drafts')}
          onOpenPending={() => setActiveTab('pending')}
          onOpenRealtimeScanner={() => setIsRealtimeScannerOpen(true)}
          onSelectSurvey={handleSelectSurveyToOpen}
          onOpenCertificate={handleOpenCertificate}
          onSyncPending={handleSyncPending}
          pendingCount={pendingCount}
        />
      )}

      {activeTab === 'map' && (
        <MapScreen
          onSelectParcelToSurvey={(parcel) => {
            setSelectedParcel(parcel);
            handleStartNewSurvey(parcel);
          }}
          onOpenRealtimeScanner={(parcel) => {
            setSelectedParcel(parcel);
            setIsRealtimeScannerOpen(true);
          }}
        />
      )}

      {activeTab === 'surveys' && (
        <SurveysListScreen
          surveys={surveys}
          onSelectSurvey={handleSelectSurveyToOpen}
          onOpenCertificate={handleOpenCertificate}
        />
      )}

      {activeTab === 'drafts' && (
        <DraftsScreen
          draftSurveys={surveys.filter(s => s.status === 'DRAFT')}
          onContinueDraft={handleSelectSurveyToOpen}
        />
      )}

      {activeTab === 'pending' && (
        <PendingUploadsScreen
          surveys={surveys}
          onSelectSurvey={handleSelectSurveyToOpen}
          onRefreshSurveys={refreshSurveys}
        />
      )}

      {activeTab === 'history' && (
        <SurveyHistoryScreen
          surveys={surveys}
          onSelectSurvey={handleSelectSurveyToOpen}
          onOpenCertificate={handleOpenCertificate}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileScreen
          surveyor={CURRENT_SURVEYOR}
          onLogout={() => setIsLoggedIn(false)}
          onResetData={handleResetData}
        />
      )}

      {/* Real-time House 3D Scanner Modal (Direct feature flow) */}
      {isRealtimeScannerOpen && (
        <RealtimeHouse3DScanner
          initialParcel={selectedParcel}
          onClose={() => {
            setIsRealtimeScannerOpen(false);
            refreshSurveys();
          }}
          onCompleted={(newSurvey) => {
            refreshSurveys();
            handleOpenCertificate(newSurvey);
            setIsRealtimeScannerOpen(false);
          }}
        />
      )}
    </AndroidShell>
  );
}

export default App;
