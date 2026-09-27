import React, { useState } from 'react';
import {
  Compass,
  Search,
  Layers,
  MapPin,
  ArrowRight,
  Building2,
  Navigation,
  Check,
  Droplets,
  Train,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Maximize2,
  Minimize2,
  Info,
  Camera
} from 'lucide-react';
import { DEMO_PARCELS, DEMO_INFRASTRUCTURE } from '../../data/mockData';
import { Parcel } from '../../types/survey';

interface Props {
  onSelectParcelToSurvey: (parcel: Parcel) => void;
  onOpenRealtimeScanner?: (parcel: Parcel) => void;
}

export const MapScreen: React.FC<Props> = ({ onSelectParcelToSurvey, onOpenRealtimeScanner }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel>(DEMO_PARCELS[0]); // Default to TN-DEMO-000124
  const [activeLayers, setActiveLayers] = useState<{
    parcels: boolean;
    footprints: boolean;
    water: boolean;
    sewer: boolean;
    metro: boolean;
    cadastralGrid: boolean;
  }>({
    parcels: true,
    footprints: true,
    water: true,
    sewer: true,
    metro: true,
    cadastralGrid: true
  });
  const [gpsLocked, setGpsLocked] = useState(true);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSimulateGPS = () => {
    setGpsLocked(false);
    setTimeout(() => {
      setSelectedParcel(DEMO_PARCELS[0]);
      setGpsLocked(true);
    }, 250);
  };

  const filteredParcels = DEMO_PARCELS.filter(p =>
    p.baseUlpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col space-y-3 h-full">
      {/* TOP SEARCH & GNSS BAR (Desktop & Mobile, Section 7) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-3 sm:px-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Base ULPIN (e.g. TN-DEMO-000124) or survey number..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Mobile layers toggle button */}
          <button
            onClick={() => setMobileLayersOpen(!mobileLayersOpen)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              mobileLayersOpen ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#475569]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Layers</span>
          </button>

          {/* GPS Recenter */}
          <button
            onClick={handleSimulateGPS}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors shadow-xs ${
              gpsLocked
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B]'
            }`}
            title="Recenter GNSS Location"
          >
            <Navigation className={`w-3.5 h-3.5 ${!gpsLocked ? 'animate-spin' : ''}`} />
            <span>GPS Recenter</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE: DEDICATED LAYERS SIDEBAR + EXPANSIVE MAP CANVAS (Section 7) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-[560px] lg:min-h-[640px]">
        {/* DESKTOP LAYERS PANEL (Visible on lg screens, Drawer on mobile) */}
        <div
          className={`${
            mobileLayersOpen
              ? 'fixed inset-y-0 left-0 top-16 z-50 w-72 bg-white shadow-2xl p-4 flex flex-col justify-between overflow-y-auto'
              : 'hidden lg:flex lg:flex-col lg:w-60 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs shrink-0 justify-between'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Map Layers
                </h3>
              </div>
              {mobileLayersOpen && (
                <button
                  onClick={() => setMobileLayersOpen(false)}
                  className="p-1 rounded-md text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Layer Checkboxes */}
            <div className="space-y-1.5 text-xs text-[#172033]">
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.parcels}
                  onChange={() => toggleLayer('parcels')}
                  className="accent-[#2563EB] w-4 h-4 rounded cursor-pointer"
                />
                <span className="font-medium">2D Land Parcels</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.footprints}
                  onChange={() => toggleLayer('footprints')}
                  className="accent-[#2563EB] w-4 h-4 rounded cursor-pointer"
                />
                <span className="font-medium">Building Footprints</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.water}
                  onChange={() => toggleLayer('water')}
                  className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <span className="font-medium">Water Network</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.sewer}
                  onChange={() => toggleLayer('sewer')}
                  className="accent-[#16A34A] w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                  <span className="font-medium">Sewer Mains</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.metro}
                  onChange={() => toggleLayer('metro')}
                  className="accent-[#9333EA] w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" />
                  <span className="font-medium">Metro Line (-18.5m)</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activeLayers.cadastralGrid}
                  onChange={() => toggleLayer('cadastralGrid')}
                  className="accent-[#64748B] w-4 h-4 rounded cursor-pointer"
                />
                <span className="font-medium">Cadastral Grid</span>
              </label>
            </div>

            {/* Quick Map Legend */}
            <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                GIS Legend
              </span>
              <div className="space-y-1.5 text-[11px] text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#EFF6FF] border-2 border-[#2563EB]" />
                  <span>Selected Parcel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2563EB] border border-white ring-2 ring-blue-300" />
                  <span>GNSS RTK Fix</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 bg-[#3B82F6] rounded" />
                  <span>Structure Footprint</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#0284C7] rounded" />
                  <span>Water Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#16A34A] rounded" />
                  <span>Sewer Main</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#9333EA] rounded" />
                  <span>Metro Tunnel</span>
                </div>
              </div>
            </div>
          </div>

          {/* District Cadastre Tag */}
          <div className="border-t border-[#E2E8F0] pt-3 text-[11px] text-[#64748B] space-y-1">
            <div className="flex justify-between font-mono">
              <span>Projection:</span>
              <strong className="text-[#172033]">EPSG:4326</strong>
            </div>
            <div className="flex justify-between">
              <span>Datum:</span>
              <strong className="text-[#172033]">WGS84</strong>
            </div>
          </div>
        </div>

        {/* Mobile backdrop for layer drawer */}
        {mobileLayersOpen && (
          <div
            onClick={() => setMobileLayersOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* LARGE GIS MAP CANVAS & INSPECTOR (Takes majority of screen, Section 7) */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs relative flex flex-col justify-between">
          {/* Top Canvas Information Bar */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
            <div className="bg-white/95 backdrop-blur-sm border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#172033] shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Sector 04 • Chennai Central Cadastral Sheet</span>
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <div className="bg-white/95 backdrop-blur-sm border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg text-xs text-[#64748B] shadow-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-mono text-[11px]">N 13°05'06" • E 80°13'02"</span>
            </div>
          </div>

          {/* GIS SVG MAP CANVAS (Section 7) */}
          <div className="w-full flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] relative bg-[#F8FAFC] select-none">
            <svg
              className="w-full h-full select-none"
              viewBox="0 0 540 370"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Cadastral Grid Pattern */}
                <pattern id="gisGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Background Ground Plane */}
              <rect width="540" height="370" fill="#F8FAFC" />
              {activeLayers.cadastralGrid && (
                <rect width="540" height="370" fill="url(#gisGrid)" />
              )}

              {/* Streets & Avenues */}
              <g id="roads">
                {/* Primary Avenue */}
                <path d="M 0 180 Q 270 170 540 185" stroke="#CBD5E1" strokeWidth="28" fill="none" strokeLinecap="round" />
                <path d="M 0 180 Q 270 170 540 185" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6,6" fill="none" />
                <text x="24" y="176" fill="#475569" fontSize="8.5" fontWeight="bold">2ND AVENUE (ANNA NAGAR CENTRAL)</text>

                {/* Cross Sector Road */}
                <path d="M 245 0 L 265 370" stroke="#CBD5E1" strokeWidth="22" fill="none" />
                <text x="272" y="45" fill="#64748B" fontSize="8" transform="rotate(82 272 45)">AG SECTOR ROAD</text>
              </g>

              {/* Subterranean Utilities */}
              {activeLayers.water && (
                <g id="waterPipeline">
                  <path
                    d="M 10 196 Q 270 186 530 201"
                    stroke="#0284C7"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="4,2"
                    opacity="0.95"
                  />
                  <text x="420" y="208" fill="#0284C7" fontSize="7.5" fontWeight="bold">WATER MAIN (-1.2m)</text>
                </g>
              )}

              {activeLayers.sewer && (
                <g id="sewerPipeline">
                  <path
                    d="M 10 164 Q 270 154 530 169"
                    stroke="#16A34A"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="6,3"
                    opacity="0.95"
                  />
                  <text x="50" y="160" fill="#16A34A" fontSize="7.5" fontWeight="bold">GRAVITY SEWER (-2.8m)</text>
                </g>
              )}

              {activeLayers.metro && (
                <g id="metroTunnel">
                  <path
                    d="M 40 340 L 500 30"
                    stroke="#9333EA"
                    strokeWidth="4.5"
                    strokeDasharray="8,4"
                    fill="none"
                    opacity="0.85"
                  />
                  <text x="340" y="145" fill="#7E22CE" fontSize="8" fontWeight="bold" transform="rotate(-34 340 145)">
                    METRO PHASE-2 DEEP TUNNEL (-18.5m)
                  </text>
                </g>
              )}

              {/* 2D Cadastral Land Parcels (Light GIS Style) */}
              {activeLayers.parcels &&
                DEMO_PARCELS.map((parcel, idx) => {
                  const parcelCoords = [
                    { id: 'P-124', x: 290, y: 55, w: 130, h: 105 },
                    { id: 'P-119', x: 95, y: 45, w: 115, h: 110 },
                    { id: 'P-128', x: 295, y: 210, w: 150, h: 130 },
                    { id: 'P-130', x: 60, y: 210, w: 155, h: 135 }
                  ];
                  const pPos = parcelCoords.find(p => p.id === parcel.id) || {
                    x: 80 + idx * 90,
                    y: 80,
                    w: 90,
                    h: 80
                  };

                  const isSelected = selectedParcel.id === parcel.id;

                  return (
                    <g
                      key={parcel.id}
                      onClick={() => setSelectedParcel(parcel)}
                      className="cursor-pointer transition-transform"
                    >
                      {/* Parcel Lot Polygon */}
                      <rect
                        x={pPos.x}
                        y={pPos.y}
                        width={pPos.w}
                        height={pPos.h}
                        rx="4"
                        fill={isSelected ? '#EFF6FF' : '#FFFFFF'}
                        stroke={isSelected ? '#2563EB' : '#CBD5E1'}
                        strokeWidth={isSelected ? 3 : 1.2}
                        className="transition-colors hover:fill-blue-50/80"
                      />

                      {/* Building Footprint */}
                      {activeLayers.footprints && (
                        <rect
                          x={pPos.x + 18}
                          y={pPos.y + 18}
                          width={pPos.w - 36}
                          height={pPos.h - 36}
                          rx="2"
                          fill={isSelected ? '#3B82F6' : '#94A3B8'}
                          fillOpacity={isSelected ? 0.85 : 0.6}
                          stroke={isSelected ? '#1D4ED8' : '#64748B'}
                          strokeWidth="1.2"
                        />
                      )}

                      {/* Parcel Base ULPIN Tag */}
                      <text
                        x={pPos.x + 10}
                        y={pPos.y + pPos.h - 10}
                        fill={isSelected ? '#1D4ED8' : '#475569'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {parcel.baseUlpin}
                      </text>
                    </g>
                  );
                })}

              {/* Surveyor GNSS Pulse (Locked to P-124) */}
              <g transform="translate(355, 108)">
                <circle cx="0" cy="0" r="24" fill="#2563EB" fillOpacity="0.12">
                  <animate attributeName="r" values="16;28;16" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="6" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
              </g>
            </svg>
          </div>

          {/* DOCKED SELECTED PARCEL INSPECTOR PANEL (Section 7) */}
          <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Selected Cadastral Parcel
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    RTK GNSS Locked
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-mono text-[#172033]">
                    {selectedParcel.baseUlpin}
                  </h2>
                  <span className="text-xs text-[#64748B]">
                    • {selectedParcel.address}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] pt-0.5">
                  <span>Extent: <strong className="font-mono text-[#172033]">{selectedParcel.areaSqMeters} m²</strong></span>
                  <span>•</span>
                  <span>Survey No: <strong className="font-mono text-[#172033]">{selectedParcel.surveyNumber} ({selectedParcel.subDivision})</strong></span>
                  <span>•</span>
                  <span>Structure: <strong className="text-[#172033]">Building B-001 (G + 3 Floors)</strong></span>
                </div>
              </div>

              {/* Action Buttons to Launch Survey or Live Camera Scan for this parcel */}
              <div className="flex items-center gap-2.5 shrink-0">
                {onOpenRealtimeScanner && (
                  <button
                    onClick={() => onOpenRealtimeScanner(selectedParcel)}
                    className="py-3 px-4 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#2563EB]" />
                    <span className="hidden sm:inline">Live 3D Camera Scan</span>
                    <span className="sm:hidden">3D Scan</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectParcelToSurvey(selectedParcel)}
                  className="py-3 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Start Full Survey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
