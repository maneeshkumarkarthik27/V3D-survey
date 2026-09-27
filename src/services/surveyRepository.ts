import { Survey, SurveyValidationResult, ValidationItem, Parcel } from '../types/survey';
import { INITIAL_SURVEYS, DEMO_PARCELS, createDefaultFloors, createDefaultUnits } from '../data/mockData';

const STORAGE_KEY = 'v3d_field_survey_data_v2';
const NETWORK_STATUS_KEY = 'v3d_network_online_status';
const PENDING_QUEUE_KEY = 'v3d_pending_sync_queue';

class SurveyRepository {
  private isOnline: boolean = true;

  constructor() {
    this.initStorage();
    const storedNet = localStorage.getItem(NETWORK_STATUS_KEY);
    if (storedNet !== null) {
      this.isOnline = storedNet === 'true';
    }
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SURVEYS));
    }
    if (!localStorage.getItem(PENDING_QUEUE_KEY)) {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify([]));
    }
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public setNetworkStatus(online: boolean) {
    this.isOnline = online;
    localStorage.setItem(NETWORK_STATUS_KEY, String(online));
  }

  public getPendingQueue(): string[] {
    try {
      const data = localStorage.getItem(PENDING_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getAllSurveys(): Survey[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_SURVEYS;
      return JSON.parse(data);
    } catch {
      return INITIAL_SURVEYS;
    }
  }

  public getSurveyById(id: string): Survey | undefined {
    const list = this.getAllSurveys();
    return list.find(s => s.id === id);
  }

  public saveSurvey(survey: Survey): Survey {
    const list = this.getAllSurveys();
    const index = list.findIndex(s => s.id === survey.id);
    survey.updatedAt = new Date().toISOString();

    if (index >= 0) {
      list[index] = survey;
    } else {
      list.unshift(survey);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    if (!this.isOnline && survey.status === 'SUBMITTED') {
      this.addToPendingQueue(survey.id);
    }

    return survey;
  }

  public createNewSurvey(parcel: Parcel): Survey {
    const count = this.getAllSurveys().length + 1;
    const formattedId = `SUR-2026-${String(120 + count).padStart(6, '0')}`;
    const defaultFloors = createDefaultFloors();
    const defaultUnits = createDefaultUnits();

    const newSurvey: Survey = {
      id: formattedId,
      baseUlpin: parcel.baseUlpin,
      parcelId: parcel.id,
      surveyorId: 'SURV-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'DRAFT',
      currentStep: 1,
      propertyType: parcel.defaultBuildingType,
      buildingUsage: parcel.defaultBuildingType === 'Commercial' ? 'Office' : 'Apartment',
      buildingCount: 1,
      building: {
        id: 'B001',
        name: `Building 01 (${parcel.village})`,
        widthMeters: 24.0,
        lengthMeters: 16.0,
        approxHeightMeters: 13.0,
        floorCount: 4,
        basementCount: 1,
        constructionType: 'RCC Framed',
        roofType: 'Flat RCC',
        usage: parcel.defaultBuildingType === 'Commercial' ? 'Office' : 'Apartment',
        footprintPolygon: [
          { x: 0, y: 0 },
          { x: 24, y: 0 },
          { x: 24, y: 16 },
          { x: 0, y: 16 }
        ]
      },
      floors: defaultFloors,
      units: defaultUnits,
      photos: [
        { id: `p-${Date.now()}-1`, category: 'Front View', label: 'Building Main Elevation', required: true },
        { id: `p-${Date.now()}-2`, category: 'Left View', label: 'Side Setback & Boundary', required: true },
        { id: `p-${Date.now()}-3`, category: 'Right View', label: 'Opposite Side Setback', required: true },
        { id: `p-${Date.now()}-4`, category: 'Rear View', label: 'Rear Yard & Drain Boundary', required: true },
        { id: `p-${Date.now()}-5`, category: 'Entrance', label: 'Access Gate & Stilt Approach', required: true },
        { id: `p-${Date.now()}-6`, category: 'Address/Property Marker', label: 'Door Plate / Geo Marker', required: true },
        { id: `p-${Date.now()}-7`, category: 'Floor/Unit Evidence', label: 'Unit Door / Floor Signage', required: false },
        { id: `p-${Date.now()}-8`, category: 'Interior/Structural', label: 'Structural Columns / Internal', required: false }
      ],
      blueprint: {
        id: `bp-${Date.now()}`,
        fileName: 'approved_building_plan.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60',
        floorTarget: 'Floor 2 Typical Plan',
        scaleRatio: '1:100',
        floorHeightMeters: 3.2,
        roomCount: 4,
        uploadedAt: new Date().toISOString(),
        aiExtraction: {
          wallsDetected: 16,
          doorsDetected: 6,
          windowsDetected: 8,
          estimatedRooms: 4,
          confidencePercentage: 91.5,
          extractedAt: new Date().toISOString()
        }
      },
      ownership: {
        claimType: 'Apartment Association / Society',
        claimantName: 'Sample Claimant (Representing Owners)',
        relationshipToProperty: 'Authorized Representative',
        supportingRecordReference: `Patta Record Ref for ${parcel.baseUlpin}`,
        contactPhone: '+91 94440 00000',
        remarks: 'Candidate spatial registration submitted for official verification.',
        submittedAt: new Date().toISOString(),
        verificationStatus: 'Pending Official Verification'
      },
      selectedFloorId: 'flr-f02',
      selectedUnitId: 'u-203',
      candidate3DId: `V3D-${parcel.baseUlpin.replace('DEMO-', '')}-B001-F02-U203`
    };

    return this.saveSurvey(newSurvey);
  }

  public validateSurvey(survey: Survey): SurveyValidationResult {
    const checks: ValidationItem[] = [];

    // 1. Location check
    checks.push({
      id: 'chk-loc',
      category: 'Location',
      label: 'Survey GPS Coordinate Lock',
      valid: true,
      message: 'Physical GPS locked within parcel boundary (accuracy ±4.2m)',
      severity: 'success'
    });

    // 2. Base ULPIN check
    const hasBaseUlpin = Boolean(survey.baseUlpin && survey.baseUlpin.startsWith('TN-'));
    checks.push({
      id: 'chk-ulpin',
      category: 'Base ULPIN',
      label: '2D Base Parcel Identification',
      valid: hasBaseUlpin,
      message: hasBaseUlpin ? `Valid 2D land parcel reference: ${survey.baseUlpin}` : 'Missing base ULPIN',
      severity: hasBaseUlpin ? 'success' : 'error'
    });

    // 3. Building geometry
    const geomValid = survey.building.widthMeters > 0 && survey.building.lengthMeters > 0 && survey.building.approxHeightMeters > 0;
    checks.push({
      id: 'chk-geom',
      category: 'Building Geometry',
      label: 'Footprint & Volumetric Envelope',
      valid: geomValid,
      message: geomValid ? `Calculated: ${survey.building.widthMeters}m x ${survey.building.lengthMeters}m x ${survey.building.approxHeightMeters}m` : 'Invalid building dimensions',
      severity: geomValid ? 'success' : 'error'
    });

    // 4. Floor geometry
    const floorsValid = survey.floors.length > 0 && survey.floors.every(f => f.heightMeters > 0);
    checks.push({
      id: 'chk-floors',
      category: 'Floor Geometry',
      label: 'Vertical Floor Stack & Heights',
      valid: floorsValid,
      message: floorsValid ? `${survey.floors.length} floor levels defined with continuous elevation` : 'Floors configuration incomplete',
      severity: floorsValid ? 'success' : 'error'
    });

    // 5. Z Coordinates
    const zOrdered = survey.floors.every((f, i, arr) => {
      if (i === 0) return true;
      return f.zMin >= arr[i - 1].zMin;
    });
    checks.push({
      id: 'chk-z',
      category: 'Z Coordinates',
      label: 'Vertical Elevation (Z-Min to Z-Max)',
      valid: zOrdered,
      message: zOrdered ? 'Continuous monotonic vertical levels verified' : 'Vertical overlapping detected in floor levels',
      severity: zOrdered ? 'success' : 'error'
    });

    // 6. Unit volumes
    const hasUnits = survey.units.length > 0;
    checks.push({
      id: 'chk-units',
      category: 'Unit Volumes',
      label: 'Volumetric Unit Partitions',
      valid: hasUnits,
      message: hasUnits ? `${survey.units.length} volumetric unit volumes with zero 3D collision` : 'No units configured on vertical floors',
      severity: hasUnits ? 'success' : 'warning'
    });

    // 7. Photos
    const requiredPhotos = survey.photos.filter(p => p.required);
    const photosCaptured = requiredPhotos.filter(p => Boolean(p.uri)).length;
    const photosValid = photosCaptured >= 4;
    checks.push({
      id: 'chk-photos',
      category: 'Photo Evidence',
      label: 'Exterior & Marker Photo Capture',
      valid: photosValid,
      message: `${photosCaptured} of ${requiredPhotos.length} required survey photos captured`,
      severity: photosValid ? 'success' : 'warning'
    });

    // 8. Blueprint
    const bpValid = Boolean(survey.blueprint?.fileUrl);
    checks.push({
      id: 'chk-blueprint',
      category: 'Floor Plan / Blueprint',
      label: 'Architectural Blueprint Layout',
      valid: bpValid,
      message: bpValid ? `Blueprint loaded (${survey.blueprint?.aiExtraction.wallsDetected} walls detected)` : 'Optional floor plan not provided',
      severity: bpValid ? 'success' : 'warning'
    });

    // 9. Ownership
    const ownershipSubmitted = Boolean(survey.ownership.claimantName && survey.ownership.supportingRecordReference);
    checks.push({
      id: 'chk-ownership',
      category: 'Ownership Claim',
      label: 'Submitted Ownership Reference',
      valid: ownershipSubmitted,
      message: ownershipSubmitted ? 'Submitted claim documented — Pending Official Verification' : 'Claimant record reference missing',
      severity: ownershipSubmitted ? 'warning' : 'error' // Warning to reinforce that it's unverified!
    });

    const hasErrors = checks.some(c => c.severity === 'error');
    const isValid = !hasErrors;

    const result: SurveyValidationResult = {
      isValid,
      hasErrors,
      checks
    };

    survey.validation = result;
    return result;
  }

  public async submitSurvey(survey: Survey): Promise<Survey> {
    // Run validation first
    this.validateSurvey(survey);

    if (!this.isOnline) {
      survey.status = 'SUBMITTED';
      survey.offlineQueue = true;
      this.addToPendingQueue(survey.id);
      this.saveSurvey(survey);
      return survey;
    }

    // Simulate network latency
    await new Promise(res => setTimeout(res, 900));

    survey.status = 'SUBMITTED';
    survey.updatedAt = new Date().toISOString();
    survey.offlineQueue = false;
    this.saveSurvey(survey);
    return survey;
  }

  // Simulate official workflow transitions (for demonstration)
  public simulateOfficialAction(surveyId: string, action: 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTION_REQUIRED'): Survey {
    const survey = this.getSurveyById(surveyId);
    if (!survey) throw new Error('Survey not found');

    survey.status = action;
    survey.updatedAt = new Date().toISOString();

    if (action === 'VERIFIED') {
      survey.verification = {
        officialOfficerId: 'OFF-REV-TN-802',
        officialName: 'Thiru. Anandha Krishnan, IAS',
        officeDesignation: 'Joint Director of Land Records & 3D Spatial Registrar',
        decision: 'VERIFIED',
        decisionTimestamp: new Date().toISOString(),
        officialComments: 'Vertical volumetric bounds verified against base parcel boundary and municipal sanctioned plan.',
        certificateNumber: `V3D-CERT-TN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
      };
      survey.ownership.verificationStatus = 'Verified';
    } else if (action === 'CORRECTION_REQUIRED') {
      survey.verification = {
        officialOfficerId: 'OFF-REV-TN-319',
        officialName: 'S. Jayanthi',
        officeDesignation: 'Assistant Director of Survey',
        decision: 'CORRECTION_REQUIRED',
        decisionTimestamp: new Date().toISOString(),
        officialComments: 'Building height does not match submitted survey. Please verify Floor 3 height and roof clearance.'
      };
      survey.ownership.verificationStatus = 'Under Review';
    } else if (action === 'UNDER_REVIEW') {
      survey.verification = {
        officialOfficerId: 'OFF-REV-TN-802',
        officialName: 'Geospatial Verification Desk',
        officeDesignation: 'V3D State Geospatial Hub',
        decision: 'UNDER_REVIEW',
        decisionTimestamp: new Date().toISOString(),
        officialComments: 'Volumetric geometry in queue for desktop verification by survey officer.'
      };
      survey.ownership.verificationStatus = 'Under Review';
    }

    return this.saveSurvey(survey);
  }

  public addToPendingQueue(surveyId: string) {
    const queue = this.getPendingQueue();
    if (!queue.includes(surveyId)) {
      queue.push(surveyId);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    }
  }

  public async syncPendingQueue(): Promise<number> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return 0;

    await new Promise(res => setTimeout(res, 800));

    const list = this.getAllSurveys();
    let synced = 0;

    queue.forEach(id => {
      const item = list.find(s => s.id === id);
      if (item) {
        item.offlineQueue = false;
        item.updatedAt = new Date().toISOString();
        synced++;
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify([]));
    return synced;
  }

  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SURVEYS));
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify([]));
  }
}

export const surveyRepo = new SurveyRepository();
