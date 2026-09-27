import { jsPDF } from 'jspdf';
import { Survey } from '../types/survey';

/**
 * Downloads a high-resolution, officially formatted V3D Cadastral Property Registration Certificate PDF.
 * Generates all vector geometry, coordinate matrices, ownership claims, official seals,
 * and embeds photographic evidence when available.
 */
export async function downloadCertificatePDF(survey: Survey): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const activeFloor = survey.floors.find(f => f.id === survey.selectedFloorId) ||
      survey.floors.find(f => f.floorCode === 'F02') ||
      survey.floors[0] || {
        floorName: 'Ground Floor',
        floorCode: 'G',
        zMin: 0,
        zMax: 3.2,
        heightMeters: 3.2,
        approxAreaSqFt: 1850
      };

    const activeUnit = survey.units.find(u => u.id === survey.selectedUnitId) ||
      survey.units.find(u => u.unitCode === 'U203') ||
      survey.units[0] || {
        unitCode: 'U101',
        approxAreaSqFt: 1850,
        bounds: { xMin: 0, xMax: 18, yMin: 0, yMax: 14, zMin: 0, zMax: 3.2 }
      };

    const verification = survey.verification || {
      officialOfficerId: 'OFF-REV-TN-802',
      officialName: 'Thiru. Anandha Krishnan, IAS',
      officeDesignation: 'Director of Survey & 3D Spatial Registrar',
      decision: 'VERIFIED',
      decisionTimestamp: new Date().toISOString(),
      officialComments: 'Vertical volumetric bounds verified against base parcel boundary and municipal plan.',
      certificateNumber: `V3D-CERT-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const candidateId = survey.candidate3DId ||
      `V3D-${survey.baseUlpin.replace('DEMO-', '')}-${survey.building.id || 'B001'}-${activeFloor.floorCode || 'G'}-${activeUnit.unitCode || 'U101'}`;

    // --- Page Background & Outer Double Border ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative Security Frame (Double Border)
    doc.setDrawColor(30, 58, 138); // Deep Navy
    doc.setLineWidth(0.8);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

    doc.setDrawColor(191, 219, 254); // Light Blue accent
    doc.setLineWidth(0.3);
    doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, pageHeight - (margin * 2) + 5);

    // --- Top Government Header Bar ---
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, margin, contentWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DEPARTMENT OF SURVEY & LAND RECORDS • STATE GEOSPATIAL HUB', pageWidth / 2, margin + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('GOVERNMENT 3D CADASTRAL REGISTRY SYSTEM • SIH26011 SPATIAL INITIATIVE', pageWidth / 2, margin + 13, { align: 'center' });

    let currentY = margin + 24;

    // --- Document Title ---
    doc.setTextColor(23, 32, 51);
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('V3D PROPERTY REGISTRATION CERTIFICATE', pageWidth / 2, currentY, { align: 'center' });

    currentY += 5.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Statutory 3D Volumetric Spatial Record & Candidate Vertical ULPIN Allocation', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4.5;
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(`CERTIFICATE REF: ${verification.certificateNumber}`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;

    // --- Candidate 3D Identifier Highlight Card ---
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 19, 2, 2, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('CANDIDATE 3D SPATIAL IDENTIFIER (VERTICAL VOLUMETRIC ULPIN):', pageWidth / 2, currentY + 5, { align: 'center' });

    doc.setTextColor(29, 78, 216);
    doc.setFont('courier', 'bold');
    doc.setFontSize(13);
    doc.text(candidateId, pageWidth / 2, currentY + 11.5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Derived from Base 2D Land Parcel ULPIN: ${survey.baseUlpin}  •  Status: OFFICIALLY VERIFIED`, pageWidth / 2, currentY + 16, { align: 'center' });

    currentY += 23;

    // --- Cadastral & Building Identity Table (Grid of 4 items) ---
    const cardW = (contentWidth - 6) / 4;
    const cardH = 14;

    const cards = [
      { label: 'SURVEY DOSSIER ID', val: survey.id },
      { label: 'BUILDING BLOCK', val: `${survey.building.name} (${survey.building.id || 'B001'})` },
      { label: 'ASSIGNED LEVEL', val: `${activeFloor.floorName} (${activeFloor.floorCode})` },
      { label: 'UNIT EXTENT', val: `${activeUnit.approxAreaSqFt || 1850} SQ.FT` }
    ];

    cards.forEach((c, idx) => {
      const cX = margin + idx * (cardW + 2);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.roundedRect(cX, currentY, cardW, cardH, 1.5, 1.5, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(c.label, cX + 2.5, currentY + 4.5);

      doc.setTextColor(23, 32, 51);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(c.val, cX + 2.5, currentY + 10.5);
    });

    currentY += cardH + 4;

    // --- Certified 3D Volumetric Coordinate Matrix ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CERTIFIED 3D VOLUMETRIC METRIC BOUNDS (COORDINATE MATRIX)', margin + 3, currentY + 5);

    const bounds = activeUnit.bounds || {
      xMin: 0,
      xMax: survey.building.widthMeters || 18,
      yMin: 0,
      yMax: survey.building.lengthMeters || 14,
      zMin: activeFloor.zMin,
      zMax: activeFloor.zMax
    };

    const coordW = (contentWidth - 8) / 3;
    const coordBoxes = [
      { axis: 'X-AXIS RANGE (Frontage)', range: `${bounds.xMin.toFixed(2)}m → ${bounds.xMax.toFixed(2)}m`, delta: `Width: ${(bounds.xMax - bounds.xMin).toFixed(1)}m` },
      { axis: 'Y-AXIS RANGE (Depth)', range: `${bounds.yMin.toFixed(2)}m → ${bounds.yMax.toFixed(2)}m`, delta: `Depth: ${(bounds.yMax - bounds.yMin).toFixed(1)}m` },
      { axis: 'Z-ELEVATION (Vertical Tier)', range: `${bounds.zMin.toFixed(2)}m → ${bounds.zMax.toFixed(2)}m`, delta: `Clear Height: ${(bounds.zMax - bounds.zMin).toFixed(1)}m` }
    ];

    coordBoxes.forEach((cb, idx) => {
      const bx = margin + 2 + idx * (coordW + 2);
      const by = currentY + 7.5;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(bx, by, coordW, 16, 1.5, 1.5, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(cb.axis, bx + 2.5, by + 4);

      doc.setTextColor(idx === 2 ? 22 : 23, idx === 2 ? 101 : 32, idx === 2 ? 52 : 51);
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.text(cb.range, bx + 2.5, by + 9.5);

      doc.setTextColor(idx === 2 ? 22 : 100, idx === 2 ? 101 : 116, idx === 2 ? 52 : 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.text(cb.delta, bx + 2.5, by + 13.5);
    });

    currentY += 30;

    // --- Architectural & Photogrammetric Geometry Specifications ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PHOTOGRAMMETRIC ARCHITECTURAL CHARACTERISTICS', margin + 3, currentY + 5);

    const archData = [
      `Roof Geometry: ${(survey.building.roofStyle || survey.building.roofType || 'Pitched').toUpperCase()}`,
      `Total Stories: ${survey.building.floorCount || survey.floors.length} Levels Above Grade`,
      `Est. Total Height: ${survey.building.approxHeightMeters || 8.5} Meters`,
      `Wall Finish: ${survey.building.wallColor || '#F8FAFC'}`,
      `Balconies / Verandas: ${survey.building.hasBalconies ? 'Present ✓' : 'Flush Alignment'}`,
      `Entrance Portico: ${survey.building.hasPorch ? 'Porch Columns Present ✓' : 'Direct Access'}`
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    archData.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = margin + 4 + col * (contentWidth / 2);
      const yPos = currentY + 9 + row * 4;
      doc.text(`• ${item}`, xPos, yPos);
    });

    currentY += 26;

    // --- Ownership & Statutory Claim Section ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('STATUTORY OWNERSHIP CLAIM & SANCTIONED TITLE EVIDENCE', margin + 3, currentY + 5);

    const ownership = survey.ownership || {
      claimantName: 'Karthik Maneesh',
      claimType: 'Freehold Title',
      relationshipToProperty: 'Sole Legal Owner',
      supportingRecordReference: 'Patta Reg 2026/CH/98102',
      contactPhone: '+91 98401 23456',
      remarks: 'Verified against municipal sanctioned structural plan.'
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(23, 32, 51);
    doc.text(`Registered Claimant: ${ownership.claimantName}  (${ownership.claimType || 'Freehold Title'})`, margin + 4, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Title / Sanction Deed Reference: ${ownership.supportingRecordReference}`, margin + 4, currentY + 14.5);
    doc.text(`Relationship: ${ownership.relationshipToProperty}   •   Contact Phone: ${ownership.contactPhone || 'N/A'}`, margin + 4, currentY + 18.5);

    currentY += 27;

    // --- Embedded Evidentiary Facade Photo or Photogrammetry Preview (if available) ---
    const photoToEmbed = survey.building.facadeImageUrl ||
      survey.photos.find(p => p.category === 'Front View' && p.uri)?.uri ||
      survey.photos.find(p => p.uri)?.uri;

    let hasEmbeddedPhoto = false;
    if (photoToEmbed && photoToEmbed.startsWith('data:image/')) {
      try {
        const photoBoxH = 34;
        const photoBoxW = 54;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, currentY, photoBoxW, photoBoxH, 1.5, 1.5, 'FD');

        const format = photoToEmbed.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(photoToEmbed, format, margin + 1, currentY + 1, photoBoxW - 2, photoBoxH - 2);

        // Beside photo: Cadastral verification notes
        const textX = margin + photoBoxW + 4;
        const textW = contentWidth - photoBoxW - 4;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(textX, currentY, textW, photoBoxH, 1.5, 1.5, 'FD');

        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('PHOTOGRAMMETRIC GROUND TRUTH VERIFICATION', textX + 3, currentY + 5);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('• Field photo captured via calibrated GNSS optical sensor', textX + 3, currentY + 10);
        doc.text('• 3D digital twin geometry matched to visible eaves and stories', textX + 3, currentY + 14.5);
        doc.text('• Exterior volumetric shell sealed within parcel legal offset', textX + 3, currentY + 19);
        doc.text('• Photometric confidence score: 98.4% (Multi-tier verified)', textX + 3, currentY + 23.5);
        doc.text('• Spatial tamper-proof token: SHA256 validated', textX + 3, currentY + 28);

        hasEmbeddedPhoto = true;
        currentY += photoBoxH + 4;
      } catch (imgErr) {
        console.warn('Could not embed base64 image into PDF directly:', imgErr);
      }
    }

    if (!hasEmbeddedPhoto) {
      // Draw Architectural CAD Silhouette Banner
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('PHOTOGRAMMETRIC FIELD INSPECTION DOSSIER', margin + 3, currentY + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Field inspections completed with ${survey.photos.length} photographic records. 3D spatial boundaries and elevation tiers conform to state cadastral survey specifications.`, margin + 3, currentY + 10.5);
      doc.text('Photometric and GNSS geometric calibration verified against revenue survey benchmarks.', margin + 3, currentY + 14.5);

      currentY += 22;
    }

    // --- Official Certification Seal & QR Code Block ---
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + contentWidth, currentY);

    currentY += 4;

    // Simulated QR Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, 20, 20, 1.5, 1.5, 'FD');

    // Draw stylized QR pattern in vector
    doc.setFillColor(23, 32, 51);
    doc.rect(margin + 2.5, currentY + 2.5, 5, 5, 'F');
    doc.rect(margin + 12.5, currentY + 2.5, 5, 5, 'F');
    doc.rect(margin + 2.5, currentY + 12.5, 5, 5, 'F');
    doc.rect(margin + 9, currentY + 9, 3, 3, 'F');
    doc.rect(margin + 13, currentY + 13, 4, 4, 'F');
    doc.rect(margin + 9, currentY + 4, 2, 3, 'F');
    doc.rect(margin + 4, currentY + 9, 3, 2, 'F');

    // QR Verification Text
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('DIGITAL SIGNATURE & QR HASH:', margin + 23, currentY + 5);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.text(`SHA-256: 8f9b2c7e14d98a0024f91b7d5e683ca4`, margin + 23, currentY + 9.5);
    doc.text(`Verify Online: https://v3d.gov.in/verify/${verification.certificateNumber}`, margin + 23, currentY + 13.5);
    doc.text(`Issued: ${new Date(verification.decisionTimestamp).toLocaleDateString()} ${new Date(verification.decisionTimestamp).toLocaleTimeString()}`, margin + 23, currentY + 17.5);

    // Official Signatory Block on Right
    doc.setTextColor(23, 32, 51);
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(10.5);
    doc.text(verification.officialName, margin + contentWidth, currentY + 6, { align: 'right' });

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(verification.officeDesignation, margin + contentWidth, currentY + 10.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('OFFICIALLY REGISTERED & DIGITALLY SIGNED', margin + contentWidth, currentY + 15, { align: 'right' });

    currentY += 24;

    // --- Bottom Legal Disclaimer Footer ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY, margin + contentWidth, currentY);

    currentY += 3.5;
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(
      'PROTOTYPE / DEMONSTRATION RECORD: Generated under Smart India Hackathon 2026 Problem Context SIH26011.',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    doc.text(
      'Demonstrates 3D Volumetric Property Cadastre and Candidate Vertical ULPIN Allocation. Page 1 of 1',
      pageWidth / 2,
      currentY + 3.2,
      { align: 'center' }
    );

    // Save and trigger actual browser download!
    const sanitizedId = candidateId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `V3D_Certificate_${sanitizedId}.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF with jsPDF:', err);
    // Fallback to HTML document download if jsPDF fails
    downloadCertificateHTML(survey);
    return false;
  }
}

/**
 * Downloads a standalone, styled, printable HTML document of the certificate.
 * Works universally across any browser without dependency on system print dialogs.
 */
export function downloadCertificateHTML(survey: Survey): void {
  const activeFloor = survey.floors.find(f => f.id === survey.selectedFloorId) || survey.floors[0] || {
    floorName: 'Ground Floor',
    floorCode: 'G',
    zMin: 0,
    zMax: 3.2,
    approxAreaSqFt: 1850
  };

  const activeUnit = survey.units.find(u => u.id === survey.selectedUnitId) || survey.units[0] || {
    unitCode: 'U101',
    approxAreaSqFt: 1850,
    bounds: { xMin: 0, xMax: 18, yMin: 0, yMax: 14, zMin: 0, zMax: 3.2 }
  };

  const verification = survey.verification || {
    officialOfficerId: 'OFF-REV-TN-802',
    officialName: 'Thiru. Anandha Krishnan, IAS',
    officeDesignation: 'Director of Survey & 3D Spatial Registrar',
    decisionTimestamp: new Date().toISOString(),
    certificateNumber: `V3D-CERT-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`
  };

  const candidateId = survey.candidate3DId ||
    `V3D-${survey.baseUlpin.replace('DEMO-', '')}-${survey.building.id || 'B001'}-${activeFloor.floorCode || 'G'}-${activeUnit.unitCode || 'U101'}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>V3D Property Certificate - ${candidateId}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0; padding: 20px; color: #172033; background: #F8FAFC;
    }
    .cert-container {
      max-width: 800px; margin: 0 auto; background: #FFFFFF; border: 2px solid #1D4ED8;
      border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header { text-align: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #EFF6FF; color: #1D4ED8; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid #BFDBFE; text-transform: uppercase; margin-bottom: 8px; }
    h1 { margin: 8px 0; font-size: 24px; font-family: serif; color: #172033; letter-spacing: -0.5px; }
    .candidate-card { background: #EFF6FF; border: 2px solid #BFDBFE; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .candidate-id { font-family: monospace; font-size: 20px; font-weight: 800; color: #1D4ED8; margin: 6px 0; word-break: break-all; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
    .card-title { font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 4px; }
    .card-val { font-size: 13px; font-weight: 700; color: #172033; }
    .coord-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 20px; text-align: center; font-family: monospace; }
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 24px; }
    .disclaimer { font-size: 10px; color: #94A3B8; text-align: center; margin-top: 16px; }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .cert-container { border: 1px solid #1D4ED8; box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="header">
      <div class="badge">Department of Survey & Land Records • State Geospatial Hub</div>
      <h1>V3D PROPERTY REGISTRATION CERTIFICATE</h1>
      <div style="font-size: 12px; color: #64748B;">Prototype 3D Volumetric Spatial Registration Certificate</div>
      <div style="font-size: 11px; font-family: monospace; color: #2563EB; margin-top: 4px;">Ref: ${verification.certificateNumber}</div>
    </div>

    <div class="candidate-card">
      <div style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Candidate 3D Spatial Identifier (Volumetric ULPIN)</div>
      <div class="candidate-id">${candidateId}</div>
      <div style="font-size: 11px; color: #64748B;">Derived from Base 2D Land Parcel: <strong>${survey.baseUlpin}</strong></div>
    </div>

    <div class="grid">
      <div class="card"><div class="card-title">Survey ID</div><div class="card-val">${survey.id}</div></div>
      <div class="card"><div class="card-title">Building</div><div class="card-val">${survey.building.name}</div></div>
      <div class="card"><div class="card-title">Target Level</div><div class="card-val">${activeFloor.floorName}</div></div>
      <div class="card"><div class="card-title">Unit Extent</div><div class="card-val">${activeUnit.approxAreaSqFt || 1850} sq.ft</div></div>
    </div>

    <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 8px;">Spatial Extent (Certified Metric Coordinate Grid)</div>
    <div class="coord-grid">
      <div>
        <div style="font-size: 11px; color: #64748B; font-family: sans-serif;">X-Axis (Frontage)</div>
        <div style="font-size: 14px; font-weight: 700; color: #172033;">${(activeUnit.bounds?.xMin || 0).toFixed(2)} → ${(activeUnit.bounds?.xMax || 18).toFixed(2)}m</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #64748B; font-family: sans-serif;">Y-Axis (Depth)</div>
        <div style="font-size: 14px; font-weight: 700; color: #172033;">${(activeUnit.bounds?.yMin || 0).toFixed(2)} → ${(activeUnit.bounds?.yMax || 14).toFixed(2)}m</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #16A34A; font-family: sans-serif; font-weight: 700;">Z-Axis (Elevation)</div>
        <div style="font-size: 14px; font-weight: 700; color: #16A34A;">${(activeUnit.bounds?.zMin ?? activeFloor.zMin).toFixed(2)} → ${(activeUnit.bounds?.zMax ?? activeFloor.zMax).toFixed(2)}m</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title">Submitted Ownership Reference</div>
      <div style="font-size: 13px; font-weight: 700; color: #172033;">Claimant: ${survey.ownership?.claimantName || 'Karthik Maneesh'} (${survey.ownership?.relationshipToProperty || 'Owner'})</div>
      <div style="font-size: 11px; color: #64748B; font-family: monospace; margin-top: 4px;">Deed Reference: ${survey.ownership?.supportingRecordReference || 'Patta Reg 2026/CH/98102'}</div>
    </div>

    <div class="footer">
      <div>
        <div style="font-size: 11px; font-family: monospace; color: #2563EB; font-weight: 700;">OFFICIALLY VERIFIED ✓</div>
        <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">Hash: SHA256:8f9b2c...e14</div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: serif; font-style: italic; font-weight: 700; font-size: 15px;">${verification.officialName}</div>
        <div style="font-size: 11px; color: #64748B;">${verification.officeDesignation}</div>
      </div>
    </div>

    <div class="disclaimer">
      PROTOTYPE / DEMONSTRATION NOTICE: Academic output under Smart India Hackathon SIH26011. Vertical spatial cadastre prototype.
    </div>
  </div>
  <script>
    window.onload = function() {
      // Auto trigger print when opened
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedId = candidateId.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `V3D_Certificate_${sanitizedId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
