import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Box,
  User,
  Phone,
  FileText,
  Sliders,
  ChevronLeft,
  X,
  AlertCircle,
  Eye,
  Award,
  Upload,
  Compass,
  Check,
  Palette,
  Home,
  SlidersHorizontal,
  Plus,
  Minus,
  Download
} from 'lucide-react';
import { Survey, Building, Floor, Unit, Parcel, OwnershipSubmission } from '../../types/survey';
import { DEMO_PARCELS } from '../../data/mockData';
import { Building3DViewer } from '../three/Building3DViewer';
import { surveyRepo } from '../../services/surveyRepository';
import { analyzeHouseImage, HouseAnalysisResult } from '../../services/houseImageAnalyzer';
import { downloadCertificatePDF } from '../../services/certificatePdfGenerator';
import confetti from 'canvas-confetti';

interface Props {
  onClose: () => void;
  onCompleted?: (survey: Survey) => void;
  initialParcel?: Parcel;
}

type ScanStage = 'capture' | 'converting' | 'model_view' | 'ownership' | 'result';

const SAMPLE_HOUSES = [
  {
    id: 'sample-villa',
    title: 'Gabled Residential Villa (G + 1)',
    desc: 'Two-story suburban house with pitched gabled terracotta roof',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80',
    floors: 2,
    height: 7.5,
    roofType: 'pitched' as const,
    roofColor: '#B45309',
    wallColor: '#F8FAFC',
    usage: 'House' as const
  },
  {
    id: 'sample-apartment',
    title: 'Flat-Roof Apartment Block (G + 3)',
    desc: 'Four-story apartment building with rooftop terrace and balconies',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
    floors: 4,
    height: 13.5,
    roofType: 'flat' as const,
    roofColor: '#64748B',
    wallColor: '#E2E8F0',
    usage: 'Apartment' as const
  },
  {
    id: 'sample-cottage',
    title: 'Single-Story Cottage (Ground Floor)',
    desc: 'Single level family home with prominent sloped hip roof & porch',
    url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1000&auto=format&fit=crop&q=80',
    floors: 1,
    height: 5.2,
    roofType: 'hipped' as const,
    roofColor: '#78350F',
    wallColor: '#FEF3C7',
    usage: 'House' as const
  }
];

export const RealtimeHouse3DScanner: React.FC<Props> = ({
  onClose,
  onCompleted,
  initialParcel = DEMO_PARCELS[0]
}) => {
  const [stage, setStage] = useState<ScanStage>('capture');
  const [selectedParcel, setSelectedParcel] = useState<Parcel>(initialParcel);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // AI Reconstruction Analysis State
  const [conversionStep, setConversionStep] = useState<number>(0);
  const [conversionLogs, setConversionLogs] = useState<string[]>([]);
  const [houseAnalysis, setHouseAnalysis] = useState<HouseAnalysisResult | null>(null);

  // Dynamic Architectural Parameters (Derived from Photo + Editable by user)
  const [detectedRoofType, setDetectedRoofType] = useState<'pitched' | 'hipped' | 'flat' | 'mansard' | 'shed'>('pitched');
  const [detectedRoofColor, setDetectedRoofColor] = useState<string>('#B45309');
  const [detectedWallColor, setDetectedWallColor] = useState<string>('#F1F5F9');
  const [hasBalconies, setHasBalconies] = useState<boolean>(true);
  const [hasPorch, setHasPorch] = useState<boolean>(true);
  const [userFloors, setUserFloors] = useState<number>(2);

  // Generated 3D Building & Spatial Entities
  const [generatedBuilding, setGeneratedBuilding] = useState<Building>({
    id: 'B001',
    name: 'Detected Residence',
    widthMeters: 20.0,
    lengthMeters: 14.0,
    approxHeightMeters: 7.5,
    floorCount: 2,
    basementCount: 0,
    constructionType: 'RCC Framed',
    roofType: 'Flat RCC',
    usage: 'House',
    footprintPolygon: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 14 },
      { x: 0, y: 14 }
    ]
  });

  const [generatedFloors, setGeneratedFloors] = useState<Floor[]>([]);
  const [generatedUnits, setGeneratedUnits] = useState<Unit[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Ownership Details State
  const [claimantName, setClaimantName] = useState<string>('K. Ramanathan');
  const [claimType, setClaimType] = useState<OwnershipSubmission['claimType']>('Sole Ownership');
  const [relationship, setRelationship] = useState<OwnershipSubmission['relationshipToProperty']>('Owner / Title Holder');
  const [deedReference, setDeedReference] = useState<string>('Patta / Title Deed Reg No. 2026/CH/98102');
  const [contactPhone, setContactPhone] = useState<string>('+91 98401 82910');
  const [undividedShare, setUndividedShare] = useState<string>('1,850 sq.ft (172.0 m²)');
  const [statutoryRemarks, setStatutoryRemarks] = useState<string>(
    'Synthesized from real-time field house photography matching facade geometry.'
  );

  // Final Dossier State
  const [finalSurvey, setFinalSurvey] = useState<Survey | null>(null);

  // Start Real-Time WebRTC Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser/environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Real camera not available or permission denied:', err.message);
      setCameraError('Live camera feed standby. You can upload any house photo or choose from realistic field samples.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Snap Picture from Real-Time Video
  const handleSnapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        processHousePhoto(dataUrl);
      }
    }
  };

  // Use Preset Sample House Photo
  const handleUsePreset = (preset: typeof SAMPLE_HOUSES[0]) => {
    setCapturedImage(preset.url);
    stopCamera();
    processHousePhoto(preset.url, preset);
  };

  // Upload Photo File
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          setCapturedImage(imgUrl);
          stopCamera();
          processHousePhoto(imgUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to re-synthesize floors and units when user tweaks parameters
  const rebuildFloorsAndUnits = (
    numFloors: number,
    approxHeight: number,
    usage: 'House' | 'Apartment' | 'Office',
    widthM: number,
    lengthM: number
  ) => {
    const floorH = parseFloat((approxHeight / numFloors).toFixed(2));
    const newFloors: Floor[] = [];
    const newUnits: Unit[] = [];

    for (let i = 0; i < numFloors; i++) {
      const floorCode = i === 0 ? 'G' : `F0${i}`;
      const floorName = i === 0 ? 'Ground Floor' : `Floor ${i}`;
      const zMin = parseFloat((i * floorH).toFixed(1));
      const zMax = parseFloat(((i + 1) * floorH).toFixed(1));
      const floorId = `fl-${Date.now()}-${i}`;

      newFloors.push({
        id: floorId,
        floorNumber: i,
        floorCode: floorCode,
        floorName: floorName,
        heightMeters: floorH,
        approxAreaSqFt: Math.round(widthM * lengthM * 10.764),
        usage: usage,
        unitCount: numFloors > 2 ? 2 : 1,
        zMin,
        zMax,
        status: 'Captured',
        isBasement: false
      });

      // Units
      const unitsOnThisFloor = numFloors > 2 ? 2 : 1;
      for (let u = 1; u <= unitsOnThisFloor; u++) {
        const unitCode = numFloors > 2 ? `U${i + 1}0${u}` : numFloors === 1 ? 'UNIT-01' : `FL-${floorCode}`;
        const unitId = `un-${Date.now()}-${i}-${u}`;
        newUnits.push({
          id: unitId,
          unitCode,
          floorId,
          floorCode,
          approxAreaSqFt: Math.round((widthM * lengthM * 10.764) / unitsOnThisFloor),
          usage: usage === 'Office' ? 'Office Suite' : 'Residential Unit',
          bounds: {
            xMin: u === 1 ? 0.0 : widthM / 2,
            xMax: u === 1 ? (unitsOnThisFloor > 1 ? widthM / 2 : widthM) : widthM,
            yMin: 0.0,
            yMax: lengthM,
            zMin,
            zMax
          },
          candidate3DId: `V3D-${selectedParcel.baseUlpin.replace('DEMO-', '')}-B001-${floorCode}-${unitCode}`,
          status: 'Captured',
          notes: 'Synthesized from photo facade inspection'
        });
      }
    }

    setGeneratedFloors(newFloors);
    setGeneratedUnits(newUnits);
    setSelectedFloorId(newFloors[0]?.id || '');
    setSelectedUnitId(newUnits[0]?.id || '');
  };

  // Convert Captured House Picture into 3D Model with real photo analysis
  const processHousePhoto = async (imageUrl: string, overridePreset?: typeof SAMPLE_HOUSES[0]) => {
    setStage('converting');
    setConversionStep(1);
    setConversionLogs(['Analyzing real-time house photo pixel matrix...']);

    // Perform deep image analysis
    const analysis = await analyzeHouseImage(imageUrl);
    setHouseAnalysis(analysis);

    const targetFloors = overridePreset ? overridePreset.floors : analysis.detectedFloors;
    const targetHeight = overridePreset ? overridePreset.height : analysis.approxHeightMeters;
    const targetRoofType = overridePreset ? overridePreset.roofType : analysis.roofType;
    const targetRoofColor = overridePreset ? overridePreset.roofColor : analysis.roofColor;
    const targetWallColor = overridePreset ? overridePreset.wallColor : analysis.wallColor;
    const targetUsage = overridePreset ? overridePreset.usage : analysis.buildingUsage;
    const targetWidth = analysis.widthMeters;
    const targetLength = analysis.lengthMeters;

    setUserFloors(targetFloors);
    setDetectedRoofType(targetRoofType);
    setDetectedRoofColor(targetRoofColor);
    setDetectedWallColor(targetWallColor);
    setHasBalconies(analysis.hasBalconies);
    setHasPorch(analysis.hasPorch);

    const steps = [
      `Pixel sampling: Dominant facade color extracted (${analysis.dominantColors.primaryWall})`,
      `Roof geometry detected: ${targetRoofType.toUpperCase()} profile with ${targetRoofColor} material`,
      `Story segmentation: Recognized ${targetFloors} vertical above-ground floor levels`,
      `Calculating 3D envelope: ${targetWidth}m frontage × ${targetLength}m depth × ${targetHeight}m height`,
      `Building 3D unit coordinate partitions aligned with base parcel ${selectedParcel.baseUlpin}`,
      'Mapping photo texture onto Three.js 3D building facade...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setConversionStep(current + 1);
        setConversionLogs(prev => [...prev, steps[current]]);
      } else {
        clearInterval(interval);

        const newBuilding: Building = {
          id: 'B001',
          name: `${targetUsage} Block (${selectedParcel.village})`,
          widthMeters: targetWidth,
          lengthMeters: targetLength,
          approxHeightMeters: targetHeight,
          floorCount: targetFloors,
          basementCount: 0,
          constructionType: 'RCC Framed',
          roofType: targetRoofType === 'pitched' ? 'Sloped Tile' : 'Flat RCC',
          usage: targetUsage,
          footprintPolygon: [
            { x: 0, y: 0 },
            { x: targetWidth, y: 0 },
            { x: targetWidth, y: targetLength },
            { x: 0, y: targetLength }
          ],
          facadeImageUrl: imageUrl,
          roofStyle: targetRoofType,
          roofColor: targetRoofColor,
          wallColor: targetWallColor,
          hasBalconies: analysis.hasBalconies,
          hasPorch: analysis.hasPorch,
          hasGarage: analysis.hasGarage,
          hasChimney: analysis.hasChimney,
          windowColumns: analysis.windowColumns,
          doorPosition: analysis.doorPosition || 'center',
          architecturalStyle: analysis.architecturalStyle,
          detectedFeaturesSummary: analysis.detectedFeaturesSummary
        };

        setGeneratedBuilding(newBuilding);
        rebuildFloorsAndUnits(targetFloors, targetHeight, targetUsage, targetWidth, targetLength);
        setStage('model_view');
      }
    }, 400);
  };

  // Fine-tuning adjustments by user
  const handleFloorsChange = (delta: number) => {
    const next = Math.max(1, Math.min(6, userFloors + delta));
    setUserFloors(next);
    const newHeight = parseFloat((next * 3.2).toFixed(1));
    setGeneratedBuilding(prev => ({
      ...prev,
      floorCount: next,
      approxHeightMeters: newHeight
    }));
    const validUsage = generatedBuilding.usage === 'Apartment' || generatedBuilding.usage === 'Office' ? generatedBuilding.usage : 'House';
    rebuildFloorsAndUnits(next, newHeight, validUsage, generatedBuilding.widthMeters, generatedBuilding.lengthMeters);
  };

  const handleRoofTypeChange = (type: 'pitched' | 'hipped' | 'flat' | 'shed') => {
    setDetectedRoofType(type);
  };

  const handleWallColorChange = (hex: string) => {
    setDetectedWallColor(hex);
  };

  const handleRoofColorChange = (hex: string) => {
    setDetectedRoofColor(hex);
  };

  // Stage 3: Assign Ownership
  const handleAssignOwnership = () => {
    setStage('ownership');
  };

  // Submit and Generate Final 3D Dossier
  const handleCompleteRegistration = () => {
    const activeFloor = generatedFloors.find(f => f.id === selectedFloorId) || generatedFloors[0];
    const activeUnit = generatedUnits.find(u => u.id === selectedUnitId) || generatedUnits[0];

    const candidate3DId =
      activeUnit?.candidate3DId ||
      `V3D-${selectedParcel.baseUlpin.replace('DEMO-', '')}-B001-${activeFloor.floorCode}-${activeUnit?.unitCode || 'U101'}`;

    const newSurvey: Survey = {
      id: `SUR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      baseUlpin: selectedParcel.baseUlpin,
      parcelId: selectedParcel.id,
      surveyorId: 'SURV-001',
      status: 'VERIFIED',
      currentStep: 11,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offlineQueue: false,
      propertyType: generatedBuilding.usage === 'Office' ? 'Commercial' : 'Residential',
      buildingUsage: generatedBuilding.usage,
      buildingCount: 1,
      building: {
        ...generatedBuilding,
        facadeImageUrl: capturedImage || undefined,
        roofStyle: detectedRoofType,
        roofColor: detectedRoofColor,
        wallColor: detectedWallColor,
        hasBalconies,
        hasPorch,
        hasGarage: houseAnalysis?.hasGarage || false,
        hasChimney: houseAnalysis?.hasChimney || (detectedRoofType === 'pitched'),
        windowColumns: houseAnalysis?.windowColumns || 2,
        doorPosition: houseAnalysis?.doorPosition || 'center',
        architecturalStyle: houseAnalysis?.architecturalStyle || 'Modern Residential Villa',
        detectedFeaturesSummary: houseAnalysis?.detectedFeaturesSummary
      },
      floors: generatedFloors,
      units: generatedUnits,
      selectedFloorId: activeFloor.id,
      selectedUnitId: activeUnit.id,
      candidate3DId: candidate3DId,
      photos: [
        {
          id: `photo-${Date.now()}`,
          category: 'Front View',
          label: 'Real-Time Field House Facade Photo',
          required: true,
          uri: capturedImage || '',
          timestamp: new Date().toISOString(),
          sharpnessScore: 94,
          luxScore: 88,
          isDuplicate: false,
          notes: 'Captured via V3D Real-Time Photogrammetric Scanner'
        }
      ],
      blueprint: {
        id: `bp-${Date.now()}`,
        fileName: 'realtime_photogrammetry_mesh.obj',
        fileUrl: capturedImage || '',
        floorTarget: activeFloor.floorName,
        scaleRatio: '1:100',
        floorHeightMeters: activeFloor.heightMeters,
        roomCount: 4,
        uploadedAt: new Date().toISOString(),
        aiExtraction: {
          wallsDetected: 18,
          doorsDetected: 6,
          windowsDetected: 10,
          estimatedRooms: 4,
          confidencePercentage: 96.4,
          extractedAt: new Date().toISOString()
        }
      },
      ownership: {
        claimType: claimType,
        claimantName: claimantName,
        relationshipToProperty: relationship,
        supportingRecordReference: deedReference,
        contactPhone: contactPhone,
        remarks: `${statutoryRemarks} Assigned Unit: ${activeUnit?.unitCode} (${undividedShare})`,
        submittedAt: new Date().toISOString(),
        verificationStatus: 'Verified'
      },
      verification: {
        officialOfficerId: 'OFF-REV-TN-802',
        officialName: 'Thiru. Anandha Krishnan, IAS',
        officeDesignation: 'Director of Survey & 3D Spatial Registrar',
        decision: 'VERIFIED',
        decisionTimestamp: new Date().toISOString(),
        officialComments: 'Real-time 3D spatial boundary synthesized from photo facade and authenticated against cadastral base parcel.',
        certificateNumber: `V3D-CERT-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`
      }
    };

    surveyRepo.saveSurvey(newSurvey);
    setFinalSurvey(newSurvey);
    setStage('result');

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (onCompleted) {
      onCompleted(newSurvey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F9FC] text-[#172033] flex flex-col overflow-y-auto font-sans antialiased">
      {/* Top Header */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Scanner</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#172033]">Real-Time House 3D Scanner</span>
              <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md hidden sm:inline">
                Photo → 3D Mesh AI
              </span>
            </div>
            <p className="text-xs text-[#64748B] hidden sm:block">
              Base Parcel: <strong className="font-mono text-[#172033]">{selectedParcel.baseUlpin}</strong> ({selectedParcel.address})
            </p>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                stage === 'capture'
                  ? 'bg-[#2563EB] animate-pulse'
                  : stage === 'converting'
                  ? 'bg-[#D97706] animate-spin'
                  : 'bg-[#16A34A]'
              }`}
            />
            <span className="font-semibold text-[#172033]">
              {stage === 'capture' && 'Step 1: Real-Time Photo'}
              {stage === 'converting' && 'Step 2: Analyzing Facade...'}
              {stage === 'model_view' && 'Step 2: 3D House Model'}
              {stage === 'ownership' && 'Step 3: Assign Ownership'}
              {stage === 'result' && 'Step 4: 3D Certificate'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* STAGE 1: REAL-TIME PICTURE OF HOUSE */}
        {/* ========================================================================= */}
        {stage === 'capture' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
                  Take Real-Time Picture of House or Upload Photo
                </h1>
                <p className="text-sm text-[#64748B] mt-1">
                  The AI analyzes the house photo (floor count, roof style, wall colors, aspect ratio) and constructs a matching 3D digital twin.
                </p>
              </div>

              {/* Base Parcel Selector */}
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                <span className="text-[#64748B]">Parcel:</span>
                <select
                  value={selectedParcel.id}
                  onChange={(e) => {
                    const p = DEMO_PARCELS.find(dp => dp.id === e.target.value);
                    if (p) setSelectedParcel(p);
                  }}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 font-mono font-bold text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  {DEMO_PARCELS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.baseUlpin} ({p.address.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Camera Viewfinder or Fallback Card */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />

                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* AR HUD Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-white/90 text-xs font-mono drop-shadow">
                      <div className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>GNSS RTK: 13.0850° N, 80.2101° E (±4.2m)</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20">
                        <span>PITCH: 90° • LEVEL FIX</span>
                      </div>
                    </div>

                    <div className="self-center w-3/4 sm:w-2/3 h-3/4 border-2 border-dashed border-blue-400/80 rounded-lg relative flex items-center justify-center">
                      <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
                        HOUSE BOUNDARY FRAME
                      </div>
                      <div className="w-8 h-0.5 bg-cyan-400/60" />
                      <div className="h-8 w-0.5 bg-cyan-400/60 absolute" />
                      <div className="absolute bottom-2 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                        Position front facade within box
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-white/80 text-[11px] font-mono drop-shadow">
                      <span>FPS: 30 • 720p HD</span>
                      <span>AI Feature Extraction: Ready</span>
                    </div>
                  </div>
                )}

                {/* Standby Card */}
                {!cameraActive && (
                  <div className="p-8 text-center text-slate-300 space-y-3 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-base">Live Camera Ready</h3>
                    <p className="text-xs text-slate-400">
                      {cameraError || 'Allow camera permissions to capture live house photos, or upload any house photo from your device below.'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Activate Device Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Shutter & File Upload Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-xs font-bold text-[#1D4ED8] cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-4 h-4 text-[#2563EB]" />
                    <span>Upload House Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {cameraActive && (
                  <button
                    onClick={handleSnapPhoto}
                    className="py-3 px-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                    <span>Take Picture of House</span>
                  </button>
                )}
              </div>
            </div>

            {/* Instant Sample Presets for Testing Different House Types */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Or Try Preset Real Houses (Simulate Different Architecture)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Click any sample to observe how different roof styles, floors, and colors produce distinct 3D models:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {SAMPLE_HOUSES.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleUsePreset(preset)}
                    className="group border border-[#E2E8F0] hover:border-[#2563EB] bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded-xl p-3 cursor-pointer transition-all space-y-2 shadow-xs"
                  >
                    <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                        {preset.floors} Floors • {preset.roofType} roof
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-[#172033] group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                        <span>{preset.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{preset.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: 3D MODEL SYNTHESIS IN PROGRESS */}
        {/* ========================================================================= */}
        {stage === 'converting' && (
          <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#172033]">
                Extracting Architecture & Building 3D Model
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                Analyzing roof slope, floor elevations, facade materials, and projecting photo texture onto 3D mesh.
              </p>
            </div>

            <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                style={{ width: `${(conversionStep / 6) * 100}%` }}
              />
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 text-left font-mono text-xs text-[#475569] space-y-1.5 shadow-xs max-h-56 overflow-y-auto">
              {conversionLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: INTERACTIVE 3D MODEL VIEW WITH REAL PHOTO FACADE & ARCHITECTURE CONTROLS */}
        {/* ========================================================================= */}
        {stage === 'model_view' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#2563EB]" />
                  <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
                    3D Digital Twin Matching Uploaded House
                  </h1>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  The 3D model reflects your house's real roof profile, floor stack, and facade photo texture. Fine-tune parameters below if needed.
                </p>
              </div>

              <button
                onClick={handleAssignOwnership}
                className="py-3 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
              >
                <span>Proceed to Assign Ownership Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Split View: Photo + Fine-Tuning Controls (Left) and Interactive 3D Model (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Source Photo & Architectural Fine-Tuning */}
              <div className="lg:col-span-5 space-y-4">
                {/* Source Photo Preview */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Source House Photo
                    </span>
                    <button
                      onClick={() => setStage('capture')}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="aspect-16/10 rounded-lg overflow-hidden bg-slate-100 border border-[#E2E8F0] relative">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured House" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#94A3B8]">
                        Photo snapshot
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      {userFloors} Floors • {detectedRoofType.toUpperCase()} Roof
                    </span>
                  </div>
                </div>

                {/* Detected Architecture & Fine-Tuning Controls */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#172033] uppercase tracking-wider">
                      <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                      <span>Detected Architecture (Live Fine-Tuning)</span>
                    </div>
                  </div>

                  {/* 1. Floor Count Stepper */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B] font-semibold">Story / Floor Count:</span>
                      <strong className="text-[#172033] font-mono">{userFloors} Floors ({generatedBuilding.approxHeightMeters}m H)</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFloorsChange(-1)}
                        disabled={userFloors <= 1}
                        className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 text-[#172033]"
                        title="Decrease floors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] py-1.5 px-3 rounded-lg text-center font-bold text-xs text-[#172033]">
                        {userFloors === 1 ? '1 Story (Ground Level)' : `${userFloors} Stories (G + ${userFloors - 1})`}
                      </div>
                      <button
                        onClick={() => handleFloorsChange(1)}
                        disabled={userFloors >= 6}
                        className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 text-[#172033]"
                        title="Increase floors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Roof Style Selector */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#64748B] font-semibold block">Roof Profile:</span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleRoofTypeChange('pitched')}
                        className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition-colors ${
                          detectedRoofType === 'pitched'
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        Pitched / Gable
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoofTypeChange('hipped')}
                        className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition-colors ${
                          detectedRoofType === 'hipped'
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        Hipped 4-Sided
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoofTypeChange('flat')}
                        className={`py-2 px-2.5 rounded-lg border text-center font-semibold transition-colors ${
                          detectedRoofType === 'flat'
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        Flat Terrace
                      </button>
                    </div>
                  </div>

                  {/* 3. Roof Color Swatches */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#64748B] font-semibold block">Roof Color:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#B45309', label: 'Terracotta' },
                        { color: '#334155', label: 'Charcoal' },
                        { color: '#78350F', label: 'Brown Tile' },
                        { color: '#1E3A8A', label: 'Blue Sheet' },
                        { color: '#94A3B8', label: 'Concrete' }
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => handleRoofColorChange(swatch.color)}
                          style={{ backgroundColor: swatch.color }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            detectedRoofColor === swatch.color ? 'border-[#2563EB] scale-110 shadow-xs' : 'border-white'
                          }`}
                          title={swatch.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 4. Wall Color Swatches */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#64748B] font-semibold block">Wall Facade Color:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#F8FAFC', label: 'Off-White' },
                        { color: '#E2E8F0', label: 'Modern Grey' },
                        { color: '#FEF3C7', label: 'Warm Cream' },
                        { color: '#C2410C', label: 'Brick Red' },
                        { color: '#D4D4D8', label: 'Stucco' }
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => handleWallColorChange(swatch.color)}
                          style={{ backgroundColor: swatch.color }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            detectedWallColor === swatch.color ? 'border-[#2563EB] scale-110 shadow-xs' : 'border-slate-300'
                          }`}
                          title={swatch.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 5. Toggles for Balconies & Porch */}
                  <div className="pt-1 flex items-center justify-between text-xs text-[#475569]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasBalconies}
                        onChange={(e) => setHasBalconies(e.target.checked)}
                        className="accent-[#2563EB] w-4 h-4 rounded"
                      />
                      <span>Balconies</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPorch}
                        onChange={(e) => setHasPorch(e.target.checked)}
                        className="accent-[#2563EB] w-4 h-4 rounded"
                      />
                      <span>Entrance Porch</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Three.js Interactive 3D Model */}
              <div className="lg:col-span-7 space-y-4">
                <Building3DViewer
                  building={generatedBuilding}
                  floors={generatedFloors}
                  units={generatedUnits}
                  selectedFloorId={selectedFloorId}
                  selectedUnitId={selectedUnitId}
                  onSelectFloor={setSelectedFloorId}
                  onSelectUnit={setSelectedUnitId}
                  facadeImageUrl={capturedImage || undefined}
                  roofType={detectedRoofType}
                  roofColor={detectedRoofColor}
                  wallColor={detectedWallColor}
                  hasBalconies={hasBalconies}
                  hasPorch={hasPorch}
                  className="shadow-xs"
                />

                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#172033]">3D House Digital Twin Verified</span>
                    <p className="text-[#64748B]">
                      The 3D model is ready for spatial registration. Click below to assign the legal title owner.
                    </p>
                  </div>
                  <button
                    onClick={handleAssignOwnership}
                    className="py-2.5 px-5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <span>Assign Ownership Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: ASSIGN OWNERSHIP DETAILS */}
        {/* ========================================================================= */}
        {stage === 'ownership' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#2563EB]" />
                  <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
                    Assign Property Ownership Details
                  </h1>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  Bind the verified 3D spatial twin with statutory claimant credentials and document title deed.
                </p>
              </div>

              <button
                onClick={() => setStage('model_view')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#172033] self-start sm:self-auto cursor-pointer"
              >
                ← Back to 3D View
              </button>
            </div>

            {/* Ownership Form Card */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 sm:p-7 shadow-xs space-y-5">
              {/* Target Allocated Unit in 3D Model */}
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                  Allocate Designated 3D Unit / Entire House <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value);
                    const un = generatedUnits.find(u => u.id === e.target.value);
                    if (un) setSelectedFloorId(un.floorId);
                  }}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#2563EB]"
                >
                  {generatedUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitCode} ({unit.floorCode} • {unit.approxAreaSqFt} sq.ft • {unit.usage})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Selected unit will be bounded with this title holder's candidate 3D spatial identifier.
                </p>
              </div>

              {/* Owner / Claimant Name */}
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                  Full Name of Owner / Claimant / Society <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. Dr. K. Ramanathan & R. Sangeetha"
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg pl-9 pr-3.5 py-2.5 text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Claim Nature & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Ownership Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Sole Ownership">Sole Ownership (Individual Title)</option>
                    <option value="Apartment Association / Society">Apartment Association / Society</option>
                    <option value="Co-Ownership">Co-Ownership / Joint Tenancy</option>
                    <option value="Government / Public Lease">Government / Public Lease</option>
                    <option value="Other">Other Statutory Entity</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Relationship to Property <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Owner / Title Holder">Owner / Title Holder</option>
                    <option value="Authorized Representative">Authorized Representative</option>
                    <option value="Tenant / Occupant">Tenant / Occupant</option>
                    <option value="Developer">Developer / Builder</option>
                  </select>
                </div>
              </div>

              {/* Title Deed Reference & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Title Deed / Patta Reference <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={deedReference}
                      onChange={(e) => setDeedReference(e.target.value)}
                      placeholder="e.g. Patta Reg 2026/CH/98102"
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98401 23456"
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              {/* Undivided Share & Statutory Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Undivided Land Share (UDS) / Extent
                  </label>
                  <input
                    type="text"
                    value={undividedShare}
                    onChange={(e) => setUndividedShare(e.target.value)}
                    placeholder="e.g. 1,850 sq.ft (172 m²)"
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                    Surveyor Field Endorsement
                  </label>
                  <input
                    type="text"
                    value={statutoryRemarks}
                    onChange={(e) => setStatutoryRemarks(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Complete Registration Action Button */}
              <div className="border-t border-[#E2E8F0] pt-4">
                <button
                  onClick={handleCompleteRegistration}
                  className="w-full py-3.5 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Generate Candidate 3D Spatial ID & Finalize Registration</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: RESULT & CERTIFICATE DOSSIER */}
        {/* ========================================================================= */}
        {stage === 'result' && finalSurvey && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-[#172033]">
                3D Property Registered Successfully!
              </h1>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Real-time house photogrammetry, 3D parametric geometry matching the photo, and statutory ownership details have been registered into the V3D Cadastral Repository.
              </p>
            </div>

            {/* Candidate 3D ID Showcase */}
            <div className="bg-[#FFFFFF] border-2 border-[#BFDBFE] rounded-xl p-5 text-center space-y-2 shadow-xs">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Issued Candidate 3D Spatial Identifier
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#1D4ED8] tracking-wider break-all">
                {finalSurvey.candidate3DId}
              </div>
              <p className="text-xs text-[#64748B]">
                Registered Owner: <strong className="text-[#172033]">{finalSurvey.ownership.claimantName}</strong> ({finalSurvey.ownership.claimType})
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
              <div>
                <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Survey Dossier ID</span>
                <span className="font-mono font-bold text-[#2563EB] text-sm mt-0.5 block">{finalSurvey.id}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Base 2D ULPIN</span>
                <span className="font-mono font-bold text-[#172033] text-sm mt-0.5 block">{finalSurvey.baseUlpin}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px] uppercase font-semibold">3D Levels</span>
                <span className="font-bold text-[#172033] text-sm mt-0.5 block">{finalSurvey.floors.length} Floors</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px] uppercase font-semibold">Verification</span>
                <span className="font-bold text-[#16A34A] text-sm mt-0.5 block">VERIFIED ✓</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={async () => {
                  if (finalSurvey) {
                    await downloadCertificatePDF(finalSurvey);
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate PDF</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setStage('capture');
                  setCapturedImage(null);
                  startCamera();
                }}
                className="w-full sm:w-auto py-3 px-5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#2563EB]" />
                <span>Scan Another House</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
