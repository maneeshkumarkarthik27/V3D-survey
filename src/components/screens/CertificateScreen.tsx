import React, { useState } from 'react';
import { Survey } from '../../types/survey';
import {
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  Award,
  FileText,
  Sparkles,
  RefreshCw,
  Share2
} from 'lucide-react';
import { downloadCertificatePDF, downloadCertificateHTML } from '../../services/certificatePdfGenerator';

interface Props {
  survey: Survey;
  onBack: () => void;
}

export const CertificateScreen: React.FC<Props> = ({ survey, onBack }) => {
  const activeUnit = survey.units.find(u => u.id === survey.selectedUnitId) || survey.units.find(u => u.unitCode === 'U203');
  const activeFloor = survey.floors.find(f => f.id === survey.selectedFloorId) || survey.floors.find(f => f.floorCode === 'F02') || survey.floors[2] || survey.floors[0];

  const verification = survey.verification || {
    officialOfficerId: 'OFF-REV-TN-802',
    officialName: 'Thiru. Anandha Krishnan, IAS',
    officeDesignation: 'Joint Director of Land Records & 3D Spatial Registrar',
    decision: 'VERIFIED',
    decisionTimestamp: new Date().toISOString(),
    officialComments: 'Vertical volumetric bounds verified against base parcel boundary and municipal sanctioned plan.',
    certificateNumber: 'V3D-CERT-TN-2026-88092'
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccessMessage(null);
    try {
      await downloadCertificatePDF(survey);
      setDownloadSuccessMessage('Official Certificate PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccessMessage(null), 4500);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      // Fallback to HTML certificate download
      downloadCertificateHTML(survey);
      setDownloadSuccessMessage('Certificate Document generated and downloaded!');
      setTimeout(() => setDownloadSuccessMessage(null), 4500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHTML = () => {
    downloadCertificateHTML(survey);
    setDownloadSuccessMessage('Print-ready HTML Certificate downloaded!');
    setTimeout(() => setDownloadSuccessMessage(null), 4500);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // In iframes where window.print() might be restricted, fallback directly to PDF download
      handleDownloadPDF();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Surveys</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadHTML}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            title="Download Standalone HTML Certificate Document"
          >
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Download HTML</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instant Download Confirmation Notification */}
      {downloadSuccessMessage && (
        <div className="bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
          <span className="text-[11px] text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
            Saved to Downloads
          </span>
        </div>
      )}

      {/* Clean Document Certificate Canvas (Section 22) */}
      <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#172033] print:border-none print:shadow-none print:p-0">
        {/* Certificate Document Header */}
        <div className="text-center border-b border-[#E2E8F0] pb-5 space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#BFDBFE]">
            <ShieldCheck className="w-4 h-4" />
            <span>Department of Survey & Land Records • State Geospatial Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172033] tracking-tight mt-2">
            V3D PROPERTY REGISTRATION RECORD
          </h1>
          <p className="text-sm font-semibold text-[#64748B]">
            Prototype 3D Volumetric Spatial Registration Certificate
          </p>
          <div className="text-xs font-mono font-medium text-[#64748B] pt-0.5">
            Dossier Reference: <span className="font-bold text-[#172033]">{verification.certificateNumber}</span>
          </div>
        </div>

        {/* Candidate 3D Identifier Banner */}
        <div className="bg-[#F8FAFC] border-2 border-[#BFDBFE] rounded-xl p-4 text-center space-y-1">
          <span className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wider block">
            Candidate 3D Spatial Identifier (Volumetric ULPIN)
          </span>
          <div className="text-lg sm:text-2xl font-mono font-extrabold text-[#1D4ED8] tracking-wider break-all">
            {survey.candidate3DId || `V3D-${survey.baseUlpin.replace('DEMO-', '')}-B001-${activeFloor.floorCode || 'G'}-${activeUnit?.unitCode || 'U101'}`}
          </div>
          <p className="text-xs text-[#64748B]">
            Derived from Base 2D Land Parcel ULPIN: <strong className="text-[#172033]">{survey.baseUlpin}</strong>
          </p>
        </div>

        {/* Cadastral & Structural Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Survey Dossier ID</span>
            <p className="font-mono font-bold text-[#172033] text-sm mt-0.5">{survey.id}</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Building Block</span>
            <p className="font-bold text-[#172033] text-sm mt-0.5">{survey.building.name} ({survey.building.id || 'B001'})</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Target Level</span>
            <p className="font-bold text-[#172033] text-sm mt-0.5">{activeFloor.floorName}</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] uppercase font-semibold">Unit Extent</span>
            <p className="font-mono font-bold text-[#16A34A] text-sm mt-0.5">{activeUnit?.approxAreaSqFt || 1850} sq.ft</p>
          </div>
        </div>

        {/* 3D Volumetric Extent (Metric Coordinate Matrix) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Spatial Extent (Certified Metric Coordinate Grid)
          </div>
          <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs font-mono text-center">
            <div>
              <span className="text-[11px] text-[#64748B] block font-sans">X-Axis Range</span>
              <span className="text-[#172033] font-bold text-sm">
                {(activeUnit?.bounds?.xMin ?? 0).toFixed(2)} → {(activeUnit?.bounds?.xMax ?? 18).toFixed(2)}m
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-sans">Y-Axis Range</span>
              <span className="text-[#172033] font-bold text-sm">
                {(activeUnit?.bounds?.yMin ?? 0).toFixed(2)} → {(activeUnit?.bounds?.yMax ?? 14).toFixed(2)}m
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#16A34A] block font-sans font-bold">Z-Elevation Range</span>
              <span className="text-[#16A34A] font-bold text-sm">
                {(activeUnit?.bounds?.zMin ?? activeFloor.zMin).toFixed(2)} → {(activeUnit?.bounds?.zMax ?? activeFloor.zMax).toFixed(2)}m
              </span>
            </div>
          </div>
        </div>

        {/* Architectural Geometry & Facade Details */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-2">
          <span className="text-[11px] text-[#64748B] uppercase font-semibold block">
            Photogrammetric & Architectural Twin Properties
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[#64748B] block text-[10px]">Roof Style</span>
              <span className="font-semibold text-[#172033] capitalize">{survey.building.roofStyle || survey.building.roofType || 'Pitched Tile'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Total Height</span>
              <span className="font-semibold text-[#172033]">{survey.building.approxHeightMeters || 8.5} meters</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Levels Above Grade</span>
              <span className="font-semibold text-[#172033]">{survey.building.floorCount || survey.floors.length} Floors</span>
            </div>
          </div>
        </div>

        {/* Submitted Ownership Claim Information */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
          <span className="text-[11px] text-[#64748B] uppercase font-semibold block">
            Submitted Ownership Reference
          </span>
          <p className="text-[#172033] font-medium">
            Claimant: <strong>{survey.ownership.claimantName}</strong> ({survey.ownership.relationshipToProperty})
          </p>
          <p className="text-[11px] text-[#64748B] font-mono">
            Supporting Deed / Sanction: {survey.ownership.supportingRecordReference}
          </p>
        </div>

        {/* Official Verification Signatures & QR Code */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#F8FAFC] border border-[#CBD5E1] p-1.5 rounded-lg flex items-center justify-center shrink-0">
              <QrCode className="w-11 h-11 text-[#172033]" />
            </div>
            <div className="text-[11px] text-[#64748B] font-mono leading-tight">
              <span>Scan to verify candidate</span>
              <br />
              <span className="text-[#2563EB] font-semibold">spatial record online</span>
              <br />
              <span className="text-[#94A3B8]">Hash: 8f9b2...e14</span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-serif italic font-bold text-[#172033] text-base">
              {verification.officialName}
            </div>
            <p className="text-xs text-[#475569] font-medium">{verification.officeDesignation}</p>
            <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
              Verified: {new Date(verification.decisionTimestamp).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Footer (Section 22) */}
        <div className="text-[10px] text-[#64748B] text-center pt-3 border-t border-[#E2E8F0] leading-normal">
          PROTOTYPE / DEMONSTRATION NOTICE: This document is an academic prototype output generated under Smart India Hackathon problem context SIH26011. It demonstrates vertical spatial mapping and candidate 3D ULPIN generation and does not represent an official legal certificate of title.
        </div>
      </div>
    </div>
  );
};
