export type SurveyStatus = 
  | 'DRAFT'
  | 'READY'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED';

export type PropertyType = 
  | 'Residential'
  | 'Commercial'
  | 'Mixed Use'
  | 'Institutional'
  | 'Industrial'
  | 'Other';

export type BuildingUsage = 
  | 'House'
  | 'Apartment'
  | 'Office'
  | 'School'
  | 'Hospital'
  | 'Shopping Complex'
  | 'Warehouse'
  | 'Other';

export interface SpatialVolume {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number; // Height in meters above ground or negative for underground
  zMax: number;
}

export interface Unit {
  id: string;
  unitCode: string; // e.g. "U203"
  floorId: string;
  floorCode: string; // e.g. "F02"
  approxAreaSqFt: number;
  usage: string;
  bounds: SpatialVolume;
  candidate3DId?: string;
  status: 'Draft' | 'Captured' | 'Verified';
  notes?: string;
}

export interface Floor {
  id: string;
  floorNumber: number; // -1 for Basement, 0 for Ground, 1 for Floor 1, etc.
  floorCode: string; // e.g. "B01", "G", "F01", "F02", "F03"
  floorName: string;
  heightMeters: number; // e.g. 3.2m
  approxAreaSqFt: number;
  usage: string;
  unitCount: number;
  zMin: number; // Absolute elevation offset from ground 0.0m
  zMax: number;
  status: 'Pending' | 'Captured' | 'Verified';
  isBasement?: boolean;
}

export interface Building {
  id: string; // e.g. "B001"
  name: string;
  widthMeters: number;
  lengthMeters: number;
  approxHeightMeters: number;
  floorCount: number;
  basementCount: number;
  constructionType: 'RCC Framed' | 'Load Bearing' | 'Steel Frame' | 'Prefabricated' | 'Traditional';
  roofType: 'Flat RCC' | 'Sloped Tile' | 'Metal Sheet' | 'Terrace Garden';
  usage: BuildingUsage;
  footprintPolygon: Array<{ x: number; y: number }>;
  
  // Real-world Photo Reconstruction Properties
  facadeImageUrl?: string;
  roofStyle?: 'pitched' | 'hipped' | 'flat' | 'mansard' | 'shed';
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  hasBalconies?: boolean;
  hasPorch?: boolean;
  hasGarage?: boolean;
  hasChimney?: boolean;
  windowColumns?: number;
  doorPosition?: 'left' | 'center' | 'right';
  architecturalStyle?: string;
  detectedFeaturesSummary?: string[];
}

export type PhotoCategory = 
  | 'Front View'
  | 'Left View'
  | 'Right View'
  | 'Rear View'
  | 'Entrance'
  | 'Address/Property Marker'
  | 'Floor/Unit Evidence'
  | 'Interior/Structural';

export interface PhotoEvidence {
  id: string;
  category: PhotoCategory;
  label: string;
  required: boolean;
  uri?: string;
  timestamp?: string;
  sharpnessScore?: number; // 0-100
  luxScore?: number; // 0-100
  isDuplicate?: boolean;
  notes?: string;
}

export interface Blueprint {
  id: string;
  fileName: string;
  fileUrl: string;
  floorTarget: string;
  scaleRatio: string; // e.g. "1:100"
  floorHeightMeters: number;
  roomCount: number;
  uploadedAt: string;
  aiExtraction: {
    wallsDetected: number;
    doorsDetected: number;
    windowsDetected: number;
    estimatedRooms: number;
    confidencePercentage: number;
    extractedAt: string;
  };
}

export interface OwnershipSubmission {
  claimType: 'Sole Ownership' | 'Co-Ownership' | 'Apartment Association / Society' | 'Government / Public Lease' | 'Other';
  claimantName: string;
  relationshipToProperty: 'Owner / Title Holder' | 'Authorized Representative' | 'Tenant / Occupant' | 'Developer';
  supportingRecordReference: string; // e.g., "Patta / Sale Deed Reg No. 2024/0981"
  contactPhone: string;
  remarks: string;
  submittedAt: string;
  verificationStatus: 'Pending Official Verification' | 'Under Review' | 'Verified' | 'Rejected';
}

export interface ValidationItem {
  id: string;
  category: string;
  label: string;
  valid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
}

export interface SurveyValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  checks: ValidationItem[];
}

export interface VerificationRecord {
  officialOfficerId: string;
  officialName: string;
  officeDesignation: string;
  decision: 'VERIFIED' | 'CORRECTION_REQUIRED' | 'UNDER_REVIEW';
  decisionTimestamp: string;
  officialComments?: string;
  certificateNumber?: string;
}

export interface Parcel {
  id: string;
  baseUlpin: string; // e.g. "TN-DEMO-000124"
  district: string;
  taluk: string;
  village: string;
  surveyNumber: string;
  subDivision: string;
  landUse: string;
  areaSqMeters: number;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  address: string;
  boundary: Array<[number, number]>;
  existingFootprint: Array<{ x: number; y: number }>;
  defaultBuildingType: PropertyType;
}

export interface InfrastructureLine {
  type: 'water' | 'sewer' | 'drainage' | 'metro';
  label: string;
  depthMeters: number;
  coordinates: Array<[number, number]>;
  color: string;
}

export interface SurveyorProfile {
  id: string; // e.g. "SURV-001"
  name: string;
  badgeNumber: string;
  region: string;
  role: string;
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  draftsCount: number;
  accuracyRating: string;
}

export interface Survey {
  id: string; // e.g. "SUR-2026-000124"
  baseUlpin: string;
  parcelId: string;
  surveyorId: string;
  createdAt: string;
  updatedAt: string;
  status: SurveyStatus;
  currentStep: number;
  
  // Survey steps data
  propertyType: PropertyType;
  buildingUsage: BuildingUsage;
  buildingCount: number;
  
  building: Building;
  floors: Floor[];
  units: Unit[];
  photos: PhotoEvidence[];
  blueprint?: Blueprint;
  ownership: OwnershipSubmission;
  
  selectedFloorId?: string;
  selectedUnitId?: string;
  candidate3DId?: string;
  
  validation?: SurveyValidationResult;
  verification?: VerificationRecord;
  
  offlineQueue?: boolean;
}
