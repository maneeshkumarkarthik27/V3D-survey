import { Parcel, SurveyorProfile, Survey, InfrastructureLine, Floor, Unit } from '../types/survey';

export const CURRENT_SURVEYOR: SurveyorProfile = {
  id: 'SURV-001',
  name: 'Karthik R.',
  badgeNumber: 'TN-REV-GEO-8201',
  region: 'Tamil Nadu (Chennai Central Zone)',
  role: 'Field Geospatial Surveyor Grade-I',
  assignedCount: 12,
  completedCount: 7,
  pendingCount: 5,
  draftsCount: 2,
  accuracyRating: '±2.4m High Precision'
};

export const DEMO_PARCELS: Parcel[] = [
  {
    id: 'P-124',
    baseUlpin: 'TN-DEMO-000124',
    district: 'Chennai',
    taluk: 'Egmore',
    village: 'Anna Nagar West',
    surveyNumber: '312/4B',
    subDivision: 'A1',
    landUse: 'Residential Urban Multi-Storey',
    areaSqMeters: 620.5,
    latitude: 13.0850,
    longitude: 80.2101,
    accuracyMeters: 4.2,
    address: 'Plot 42, 2nd Avenue, Block AG, Anna Nagar, Chennai 600040',
    boundary: [
      [13.0848, 80.2098],
      [13.0853, 80.2099],
      [13.0852, 80.2104],
      [13.0847, 80.2103]
    ],
    existingFootprint: [
      { x: 10, y: 10 },
      { x: 45, y: 10 },
      { x: 45, y: 35 },
      { x: 10, y: 35 }
    ],
    defaultBuildingType: 'Residential'
  },
  {
    id: 'P-119',
    baseUlpin: 'TN-DEMO-000119',
    district: 'Chennai',
    taluk: 'Mambalam',
    village: 'T. Nagar',
    surveyNumber: '118/2',
    subDivision: 'C',
    landUse: 'Mixed Commercial / Residential',
    areaSqMeters: 480.0,
    latitude: 13.0418,
    longitude: 80.2341,
    accuracyMeters: 3.8,
    address: '77 North Usman Road, T. Nagar, Chennai 600017',
    boundary: [
      [13.0416, 80.2339],
      [13.0420, 80.2340],
      [13.0419, 80.2344],
      [13.0415, 80.2343]
    ],
    existingFootprint: [
      { x: 12, y: 12 },
      { x: 38, y: 12 },
      { x: 38, y: 32 },
      { x: 12, y: 32 }
    ],
    defaultBuildingType: 'Mixed Use'
  },
  {
    id: 'P-128',
    baseUlpin: 'TN-DEMO-000128',
    district: 'Chengalpattu',
    taluk: 'Thiruporur',
    village: 'Sholinganallur',
    surveyNumber: '502/1',
    subDivision: 'Tech Park Zone',
    landUse: 'Commercial Office Complex',
    areaSqMeters: 1450.0,
    latitude: 12.9010,
    longitude: 80.2279,
    accuracyMeters: 3.1,
    address: 'Survey 502/1, OMR IT Highway Corridor, Chennai 600119',
    boundary: [
      [12.9006, 80.2274],
      [12.9015, 80.2276],
      [12.9013, 80.2284],
      [12.9004, 80.2282]
    ],
    existingFootprint: [
      { x: 15, y: 15 },
      { x: 55, y: 15 },
      { x: 55, y: 40 },
      { x: 15, y: 40 }
    ],
    defaultBuildingType: 'Commercial'
  },
  {
    id: 'P-130',
    baseUlpin: 'TN-DEMO-000130',
    district: 'Chennai',
    taluk: 'Velachery',
    village: 'Dhandeeswaram',
    surveyNumber: '215/3A',
    subDivision: '1',
    landUse: 'Institutional School Zone',
    areaSqMeters: 2100.0,
    latitude: 12.9815,
    longitude: 80.2180,
    accuracyMeters: 4.5,
    address: 'Near Gandhi Road, Velachery West, Chennai 600042',
    boundary: [
      [12.9810, 80.2175],
      [12.9820, 80.2177],
      [12.9818, 80.2186],
      [12.9808, 80.2184]
    ],
    existingFootprint: [
      { x: 20, y: 15 },
      { x: 60, y: 15 },
      { x: 60, y: 45 },
      { x: 20, y: 45 }
    ],
    defaultBuildingType: 'Institutional'
  },
  {
    id: 'P-135',
    baseUlpin: 'TN-DEMO-000135',
    district: 'Chennai',
    taluk: 'Mylapore',
    village: 'Adyar',
    surveyNumber: '44/1',
    subDivision: 'B',
    landUse: 'Residential Individual House',
    areaSqMeters: 310.0,
    latitude: 13.0067,
    longitude: 80.2570,
    accuracyMeters: 3.5,
    address: '14 LB Road, Adyar, Chennai 600020',
    boundary: [
      [13.0065, 80.2568],
      [13.0069, 80.2569],
      [13.0068, 80.2573],
      [13.0064, 80.2572]
    ],
    existingFootprint: [
      { x: 10, y: 10 },
      { x: 28, y: 10 },
      { x: 28, y: 24 },
      { x: 10, y: 24 }
    ],
    defaultBuildingType: 'Residential'
  },
  {
    id: 'P-140',
    baseUlpin: 'TN-DEMO-000140',
    district: 'Chennai',
    taluk: 'Guindy',
    village: 'Ekkattuthangal',
    surveyNumber: '89/6',
    subDivision: 'IND',
    landUse: 'Light Industrial / Logistics',
    areaSqMeters: 980.0,
    latitude: 13.0230,
    longitude: 80.2030,
    accuracyMeters: 4.0,
    address: 'Thiru-Vi-Ka Industrial Estate, Guindy, Chennai 600032',
    boundary: [
      [13.0227, 80.2026],
      [13.0234, 80.2028],
      [13.0232, 80.2035],
      [13.0225, 80.2033]
    ],
    existingFootprint: [
      { x: 15, y: 12 },
      { x: 50, y: 12 },
      { x: 50, y: 35 },
      { x: 15, y: 35 }
    ],
    defaultBuildingType: 'Industrial'
  }
];

export const DEMO_INFRASTRUCTURE: InfrastructureLine[] = [
  {
    type: 'water',
    label: 'Metro Water Supply Main (Dia 300mm)',
    depthMeters: -1.8,
    color: '#0284c7', // Sky blue
    coordinates: [
      [13.0846, 80.2095],
      [13.0849, 80.2105],
      [13.0851, 80.2115]
    ]
  },
  {
    type: 'sewer',
    label: 'Underground Sewer Trunk Line (Dia 450mm)',
    depthMeters: -2.8,
    color: '#16a34a', // Emerald green
    coordinates: [
      [13.0845, 80.2096],
      [13.0848, 80.2106],
      [13.0850, 80.2116]
    ]
  },
  {
    type: 'drainage',
    label: 'Storm Water RCC Box Drain (1.2m x 1.5m)',
    depthMeters: -1.2,
    color: '#ca8a04', // Amber/Yellow
    coordinates: [
      [13.0854, 80.2097],
      [13.0855, 80.2108],
      [13.0856, 80.2118]
    ]
  },
  {
    type: 'metro',
    label: 'Chennai Metro Phase-2 Underground Tunnel Line',
    depthMeters: -18.5,
    color: '#9333ea', // Purple
    coordinates: [
      [13.0840, 80.2090],
      [13.0852, 80.2103],
      [13.0865, 80.2115]
    ]
  }
];

// Helper to create standard floors for a G+3 residential building with 1 basement
export function createDefaultFloors(): Floor[] {
  return [
    {
      id: 'flr-b01',
      floorNumber: -1,
      floorCode: 'B01',
      floorName: 'Basement B01 (Parking & Utility)',
      heightMeters: 3.5,
      approxAreaSqFt: 2200,
      usage: 'Underground Parking & Services',
      unitCount: 0,
      zMin: -3.5,
      zMax: 0.0,
      status: 'Captured',
      isBasement: true
    },
    {
      id: 'flr-g00',
      floorNumber: 0,
      floorCode: 'G',
      floorName: 'Ground Floor (Entrance Lobby & Stilt)',
      heightMeters: 3.4,
      approxAreaSqFt: 2400,
      usage: 'Lobby & Common Facilities',
      unitCount: 2,
      zMin: 0.0,
      zMax: 3.4,
      status: 'Captured'
    },
    {
      id: 'flr-f01',
      floorNumber: 1,
      floorCode: 'F01',
      floorName: 'Floor 1 (Residential)',
      heightMeters: 3.2,
      approxAreaSqFt: 2400,
      usage: 'Residential Apartments',
      unitCount: 4,
      zMin: 3.4,
      zMax: 6.6,
      status: 'Captured'
    },
    {
      id: 'flr-f02',
      floorNumber: 2,
      floorCode: 'F02',
      floorName: 'Floor 2 (Residential)',
      heightMeters: 3.2,
      approxAreaSqFt: 2400,
      usage: 'Residential Apartments',
      unitCount: 4,
      zMin: 6.6,
      zMax: 9.8,
      status: 'Captured'
    },
    {
      id: 'flr-f03',
      floorNumber: 3,
      floorCode: 'F03',
      floorName: 'Floor 3 (Residential)',
      heightMeters: 3.2,
      approxAreaSqFt: 2400,
      usage: 'Residential Apartments',
      unitCount: 4,
      zMin: 9.8,
      zMax: 13.0,
      status: 'Captured'
    }
  ];
}

// Helper to create units for Floor 2 (e.g., U201, U202, U203, U204) and other floors
export function createDefaultUnits(): Unit[] {
  return [
    // Ground Floor
    {
      id: 'u-g01',
      unitCode: 'UG01',
      floorId: 'flr-g00',
      floorCode: 'G',
      approxAreaSqFt: 850,
      usage: 'Lobby & Office',
      bounds: { xMin: 0, xMax: 12, yMin: 0, yMax: 8, zMin: 0.0, zMax: 3.4 },
      status: 'Captured'
    },
    {
      id: 'u-g02',
      unitCode: 'UG02',
      floorId: 'flr-g00',
      floorCode: 'G',
      approxAreaSqFt: 750,
      usage: 'Care-taker Suite',
      bounds: { xMin: 12, xMax: 24, yMin: 0, yMax: 8, zMin: 0.0, zMax: 3.4 },
      status: 'Captured'
    },
    // Floor 1
    {
      id: 'u-101',
      unitCode: 'U101',
      floorId: 'flr-f01',
      floorCode: 'F01',
      approxAreaSqFt: 580,
      usage: '2BHK Apartment',
      bounds: { xMin: 0, xMax: 12, yMin: 0, yMax: 8, zMin: 3.4, zMax: 6.6 },
      status: 'Captured'
    },
    {
      id: 'u-102',
      unitCode: 'U102',
      floorId: 'flr-f01',
      floorCode: 'F01',
      approxAreaSqFt: 620,
      usage: '2BHK Apartment',
      bounds: { xMin: 12, xMax: 24, yMin: 0, yMax: 8, zMin: 3.4, zMax: 6.6 },
      status: 'Captured'
    },
    {
      id: 'u-103',
      unitCode: 'U103',
      floorId: 'flr-f01',
      floorCode: 'F01',
      approxAreaSqFt: 600,
      usage: '2BHK Apartment',
      bounds: { xMin: 0, xMax: 12, yMin: 8, yMax: 16, zMin: 3.4, zMax: 6.6 },
      status: 'Captured'
    },
    {
      id: 'u-104',
      unitCode: 'U104',
      floorId: 'flr-f01',
      floorCode: 'F01',
      approxAreaSqFt: 600,
      usage: '2BHK Apartment',
      bounds: { xMin: 12, xMax: 24, yMin: 8, yMax: 16, zMin: 3.4, zMax: 6.6 },
      status: 'Captured'
    },
    // Floor 2 (Includes hero unit U203!)
    {
      id: 'u-201',
      unitCode: 'U201',
      floorId: 'flr-f02',
      floorCode: 'F02',
      approxAreaSqFt: 580,
      usage: '2BHK Apartment',
      bounds: { xMin: 0, xMax: 12, yMin: 0, yMax: 8, zMin: 6.6, zMax: 9.8 },
      candidate3DId: 'V3D-TN-000124-B001-F02-U201',
      status: 'Captured'
    },
    {
      id: 'u-202',
      unitCode: 'U202',
      floorId: 'flr-f02',
      floorCode: 'F02',
      approxAreaSqFt: 620,
      usage: '2BHK Apartment',
      bounds: { xMin: 12, xMax: 24, yMin: 0, yMax: 8, zMin: 6.6, zMax: 9.8 },
      candidate3DId: 'V3D-TN-000124-B001-F02-U202',
      status: 'Captured'
    },
    {
      id: 'u-203',
      unitCode: 'U203',
      floorId: 'flr-f02',
      floorCode: 'F02',
      approxAreaSqFt: 600,
      usage: '3BHK Apartment - Corner Unit',
      bounds: { xMin: 0, xMax: 12, yMin: 8, yMax: 16, zMin: 6.6, zMax: 9.8 },
      candidate3DId: 'V3D-TN-000124-B001-F02-U203',
      status: 'Captured'
    },
    {
      id: 'u-204',
      unitCode: 'U204',
      floorId: 'flr-f02',
      floorCode: 'F02',
      approxAreaSqFt: 600,
      usage: '2BHK Apartment',
      bounds: { xMin: 12, xMax: 24, yMin: 8, yMax: 16, zMin: 6.6, zMax: 9.8 },
      candidate3DId: 'V3D-TN-000124-B001-F02-U204',
      status: 'Captured'
    },
    // Floor 3
    {
      id: 'u-301',
      unitCode: 'U301',
      floorId: 'flr-f03',
      floorCode: 'F03',
      approxAreaSqFt: 580,
      usage: 'Penthouse Unit A',
      bounds: { xMin: 0, xMax: 12, yMin: 0, yMax: 8, zMin: 9.8, zMax: 13.0 },
      status: 'Captured'
    },
    {
      id: 'u-302',
      unitCode: 'U302',
      floorId: 'flr-f03',
      floorCode: 'F03',
      approxAreaSqFt: 620,
      usage: 'Penthouse Unit B',
      bounds: { xMin: 12, xMax: 24, yMin: 0, yMax: 8, zMin: 9.8, zMax: 13.0 },
      status: 'Captured'
    }
  ];
}

// Initial surveys for dashboard and history demonstration
export const INITIAL_SURVEYS: Survey[] = [
  // 1. Primary demo survey (Ready / Submitted or under review)
  {
    id: 'SUR-2026-000124',
    baseUlpin: 'TN-DEMO-000124',
    parcelId: 'P-124',
    surveyorId: 'SURV-001',
    createdAt: '2026-09-26T10:15:00Z',
    updatedAt: '2026-09-26T14:40:00Z',
    status: 'SUBMITTED',
    currentStep: 10,
    propertyType: 'Residential',
    buildingUsage: 'Apartment',
    buildingCount: 1,
    building: {
      id: 'B001',
      name: 'Annamalai Enclave (Tower A)',
      widthMeters: 24.0,
      lengthMeters: 16.0,
      approxHeightMeters: 13.0,
      floorCount: 4,
      basementCount: 1,
      constructionType: 'RCC Framed',
      roofType: 'Flat RCC',
      usage: 'Apartment',
      footprintPolygon: [
        { x: 0, y: 0 },
        { x: 24, y: 0 },
        { x: 24, y: 16 },
        { x: 0, y: 16 }
      ]
    },
    floors: createDefaultFloors(),
    units: createDefaultUnits(),
    selectedFloorId: 'flr-f02',
    selectedUnitId: 'u-203',
    candidate3DId: 'V3D-TN-000124-B001-F02-U203',
    photos: [
      {
        id: 'p-1',
        category: 'Front View',
        label: 'Building Main Elevation (North)',
        required: true,
        uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:20:00Z',
        sharpnessScore: 94,
        luxScore: 88,
        isDuplicate: false
      },
      {
        id: 'p-2',
        category: 'Left View',
        label: 'East Side Setback & Driveway',
        required: true,
        uri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:22:00Z',
        sharpnessScore: 91,
        luxScore: 85,
        isDuplicate: false
      },
      {
        id: 'p-3',
        category: 'Right View',
        label: 'West Side Boundary Wall',
        required: true,
        uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:24:00Z',
        sharpnessScore: 89,
        luxScore: 82,
        isDuplicate: false
      },
      {
        id: 'p-4',
        category: 'Rear View',
        label: 'South Rear Yard & Drain Connect',
        required: true,
        uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:26:00Z',
        sharpnessScore: 92,
        luxScore: 80,
        isDuplicate: false
      },
      {
        id: 'p-5',
        category: 'Entrance',
        label: 'Main Gate & Stilt Ramp Entry',
        required: true,
        uri: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:28:00Z',
        sharpnessScore: 96,
        luxScore: 92,
        isDuplicate: false
      },
      {
        id: 'p-6',
        category: 'Address/Property Marker',
        label: 'Municipal Door Plate No. 42',
        required: true,
        uri: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:30:00Z',
        sharpnessScore: 98,
        luxScore: 89,
        isDuplicate: false
      },
      {
        id: 'p-7',
        category: 'Floor/Unit Evidence',
        label: 'Floor 2 Lift Lobby & Door U203',
        required: false,
        uri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-26T10:35:00Z',
        sharpnessScore: 93,
        luxScore: 78,
        isDuplicate: false
      }
    ],
    blueprint: {
      id: 'bp-124',
      fileName: 'approved_plan_cmda_2023_04.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60',
      floorTarget: 'Floor 2 Typical Layout',
      scaleRatio: '1:100',
      floorHeightMeters: 3.2,
      roomCount: 4,
      uploadedAt: '2026-09-26T10:45:00Z',
      aiExtraction: {
        wallsDetected: 18,
        doorsDetected: 7,
        windowsDetected: 9,
        estimatedRooms: 4,
        confidencePercentage: 92.4,
        extractedAt: '2026-09-26T10:45:30Z'
      }
    },
    ownership: {
      claimType: 'Apartment Association / Society',
      claimantName: 'Annamalai Owners Welfare Association (Rep. S. Ramanathan)',
      relationshipToProperty: 'Authorized Representative',
      supportingRecordReference: 'Patta TR/2021/8871 & CMDA Approval B/WD/2022/194',
      contactPhone: '+91 94440 12891',
      remarks: 'Survey conducted with Association Secretary present. Unit U203 designated for 3D candidate spatial mapping.',
      submittedAt: '2026-09-26T14:40:00Z',
      verificationStatus: 'Pending Official Verification'
    }
  },

  // 2. Draft survey (to demonstrate resuming drafts)
  {
    id: 'SUR-2026-000119',
    baseUlpin: 'TN-DEMO-000119',
    parcelId: 'P-119',
    surveyorId: 'SURV-001',
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-25T16:20:00Z',
    status: 'DRAFT',
    currentStep: 6,
    propertyType: 'Mixed Use',
    buildingUsage: 'Apartment',
    buildingCount: 1,
    building: {
      id: 'B001',
      name: 'North Usman Commercial Complex',
      widthMeters: 20.0,
      lengthMeters: 14.0,
      approxHeightMeters: 10.0,
      floorCount: 3,
      basementCount: 0,
      constructionType: 'RCC Framed',
      roofType: 'Flat RCC',
      usage: 'Shopping Complex',
      footprintPolygon: [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 14 },
        { x: 0, y: 14 }
      ]
    },
    floors: [
      {
        id: 'flr-g',
        floorNumber: 0,
        floorCode: 'G',
        floorName: 'Ground Floor Commercial Retail',
        heightMeters: 3.6,
        approxAreaSqFt: 1800,
        usage: 'Commercial Retail',
        unitCount: 3,
        zMin: 0.0,
        zMax: 3.6,
        status: 'Captured'
      },
      {
        id: 'flr-f1',
        floorNumber: 1,
        floorCode: 'F01',
        floorName: 'Floor 1 Offices',
        heightMeters: 3.2,
        approxAreaSqFt: 1800,
        usage: 'Office Suites',
        unitCount: 2,
        zMin: 3.6,
        zMax: 6.8,
        status: 'Captured'
      }
    ],
    units: [],
    photos: [
      {
        id: 'p-119-1',
        category: 'Front View',
        label: 'Front Facade North Usman Rd',
        required: true,
        uri: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=60',
        timestamp: '2026-09-25T11:15:00Z',
        sharpnessScore: 88,
        luxScore: 90,
        isDuplicate: false
      }
    ],
    ownership: {
      claimType: 'Co-Ownership',
      claimantName: 'G. Sundaram & Partners',
      relationshipToProperty: 'Owner / Title Holder',
      supportingRecordReference: 'Doc No. 4410/2018 SRO T.Nagar',
      contactPhone: '+91 98400 55122',
      remarks: 'Draft in progress. Upper floor units pending field check.',
      submittedAt: '2026-09-25T16:20:00Z',
      verificationStatus: 'Pending Official Verification'
    }
  },

  // 3. Verified survey (to demonstrate the prototype certificate)
  {
    id: 'SUR-2026-000108',
    baseUlpin: 'TN-DEMO-000128',
    parcelId: 'P-128',
    surveyorId: 'SURV-001',
    createdAt: '2026-09-20T09:30:00Z',
    updatedAt: '2026-09-22T17:00:00Z',
    status: 'VERIFIED',
    currentStep: 10,
    propertyType: 'Commercial',
    buildingUsage: 'Office',
    buildingCount: 1,
    building: {
      id: 'B001',
      name: 'Cyber Heights Tower',
      widthMeters: 32.0,
      lengthMeters: 22.0,
      approxHeightMeters: 19.5,
      floorCount: 5,
      basementCount: 1,
      constructionType: 'Steel Frame',
      roofType: 'Flat RCC',
      usage: 'Office',
      footprintPolygon: [
        { x: 0, y: 0 },
        { x: 32, y: 0 },
        { x: 32, y: 22 },
        { x: 0, y: 22 }
      ]
    },
    floors: createDefaultFloors(),
    units: createDefaultUnits(),
    selectedFloorId: 'flr-f02',
    selectedUnitId: 'u-203',
    candidate3DId: 'V3D-TN-000128-B001-F02-U203',
    photos: [],
    ownership: {
      claimType: 'Sole Ownership',
      claimantName: 'Kaveri Infotech Properties LLP',
      relationshipToProperty: 'Owner / Title Holder',
      supportingRecordReference: 'Lease Deed Reg 119/2019 SRO Tambaram',
      contactPhone: '+91 94441 99011',
      remarks: 'Verified against Master Plan 2026.',
      submittedAt: '2026-09-21T11:00:00Z',
      verificationStatus: 'Verified'
    },
    verification: {
      officialOfficerId: 'OFF-REV-TN-401',
      officialName: 'Dr. M. Senthil Nathan, IAS',
      officeDesignation: 'District Revenue Officer & Geospatial Registrar',
      decision: 'VERIFIED',
      decisionTimestamp: '2026-09-22T16:45:00Z',
      officialComments: 'Physical volumetric envelope corresponds accurately with CMDA registered FSI norms and 2D base parcel boundaries.',
      certificateNumber: 'V3D-CERT-TN-2026-88092'
    }
  },

  // 4. Survey requiring correction (to demonstrate the correction workflow!)
  {
    id: 'SUR-2026-000115',
    baseUlpin: 'TN-DEMO-000130',
    parcelId: 'P-130',
    surveyorId: 'SURV-001',
    createdAt: '2026-09-23T14:10:00Z',
    updatedAt: '2026-09-24T18:00:00Z',
    status: 'CORRECTION_REQUIRED',
    currentStep: 8,
    propertyType: 'Institutional',
    buildingUsage: 'School',
    buildingCount: 1,
    building: {
      id: 'B001',
      name: 'St. Thomas Vidya Mandir',
      widthMeters: 28.0,
      lengthMeters: 18.0,
      approxHeightMeters: 11.2,
      floorCount: 3,
      basementCount: 0,
      constructionType: 'RCC Framed',
      roofType: 'Sloped Tile',
      usage: 'School',
      footprintPolygon: [
        { x: 0, y: 0 },
        { x: 28, y: 0 },
        { x: 28, y: 18 },
        { x: 0, y: 18 }
      ]
    },
    floors: createDefaultFloors(),
    units: createDefaultUnits(),
    photos: [],
    ownership: {
      claimType: 'Government / Public Lease',
      claimantName: 'Educational Trust Directorate',
      relationshipToProperty: 'Authorized Representative',
      supportingRecordReference: 'Govt Order Ms. 102/Rev/2015',
      contactPhone: '+91 98840 33201',
      remarks: 'Height discrepancy detected by reviewing officer.',
      submittedAt: '2026-09-24T18:00:00Z',
      verificationStatus: 'Under Review'
    },
    verification: {
      officialOfficerId: 'OFF-REV-TN-319',
      officialName: 'S. Jayanthi',
      officeDesignation: 'Assistant Director of Survey & Land Records',
      decision: 'CORRECTION_REQUIRED',
      decisionTimestamp: '2026-09-25T09:15:00Z',
      officialComments: 'Building height does not match submitted survey. Please verify Floor 3 height and roof clearance.'
    }
  }
];
