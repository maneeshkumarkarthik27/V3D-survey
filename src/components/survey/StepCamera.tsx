import React, { useState } from 'react';
import { Survey, PhotoEvidence, PhotoCategory } from '../../types/survey';
import { Camera, CheckCircle2, Image, Sun, Sparkles, Box, Check, RefreshCw } from 'lucide-react';
import { analyzePhotoQuality } from '../../services/aiAssistance';
import { analyzeHouseImage, applyAnalysisToSurvey, HouseAnalysisResult } from '../../services/houseImageAnalyzer';

interface Props {
  survey: Survey;
  onUpdateSurvey: (updated: Partial<Survey>) => void;
  onLaunchRealtimeScanner?: () => void;
}

const SAMPLE_FIELD_PHOTOS: Record<PhotoCategory, string> = {
  'Front View': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80',
  'Left View': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
  'Right View': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  'Rear View': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80',
  'Entrance': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80',
  'Address/Property Marker': 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1000&auto=format&fit=crop&q=80',
  'Floor/Unit Evidence': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
  'Interior/Structural': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80'
};

export const StepCamera: React.FC<Props> = ({ survey, onUpdateSurvey, onLaunchRealtimeScanner }) => {
  const photos = survey.photos;
  const exteriorPhotos = photos.filter(p => p.required);
  const interiorPhotos = photos.filter(p => !p.required);

  const exteriorCaptured = exteriorPhotos.filter(p => Boolean(p.uri)).length;
  const interiorCaptured = interiorPhotos.filter(p => Boolean(p.uri)).length;

  const [analyzingPhoto, setAnalyzingPhoto] = useState<boolean>(false);
  const [latestAnalysis, setLatestAnalysis] = useState<HouseAnalysisResult | null>(null);

  const handleCapturePhoto = async (photoId: string, customUri?: string) => {
    const quality = analyzePhotoQuality(photos.filter(p => p.uri).length);
    const target = photos.find(p => p.id === photoId);
    const uri = customUri || (target ? SAMPLE_FIELD_PHOTOS[target.category] : '');

    const updatedPhotos = photos.map(p => {
      if (p.id === photoId) {
        return {
          ...p,
          uri: uri,
          timestamp: new Date().toISOString(),
          sharpnessScore: quality.sharpnessScore,
          luxScore: quality.luxScore,
          isDuplicate: quality.duplicateSuspected
        };
      }
      return p;
    });

    // If this is Front View (or no facade image exists yet), automatically run 3D house reconstruction!
    if (uri && (target?.category === 'Front View' || !survey.building.facadeImageUrl)) {
      setAnalyzingPhoto(true);
      try {
        const analysis = await analyzeHouseImage(uri);
        setLatestAnalysis(analysis);
        const surveyUpdates = applyAnalysisToSurvey(survey, analysis, uri);
        onUpdateSurvey({
          photos: updatedPhotos,
          ...surveyUpdates
        });
      } catch (err) {
        console.error('Error in photo 3D reconstruction:', err);
        onUpdateSurvey({ photos: updatedPhotos });
      } finally {
        setAnalyzingPhoto(false);
      }
    } else {
      onUpdateSurvey({ photos: updatedPhotos });
    }
  };

  const handleCaptureAllDemo = async () => {
    setAnalyzingPhoto(true);
    const frontUri = SAMPLE_FIELD_PHOTOS['Front View'];
    const updatedPhotos = photos.map(p => {
      const quality = analyzePhotoQuality(5);
      return {
        ...p,
        uri: SAMPLE_FIELD_PHOTOS[p.category],
        timestamp: new Date().toISOString(),
        sharpnessScore: quality.sharpnessScore,
        luxScore: quality.luxScore,
        isDuplicate: false
      };
    });

    try {
      const analysis = await analyzeHouseImage(frontUri);
      setLatestAnalysis(analysis);
      const surveyUpdates = applyAnalysisToSurvey(survey, analysis, frontUri);
      onUpdateSurvey({
        photos: updatedPhotos,
        ...surveyUpdates
      });
    } catch {
      onUpdateSurvey({ photos: updatedPhotos });
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const handleFileUpload = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleCapturePhoto(photoId, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const frontPhoto = photos.find(p => p.category === 'Front View' && p.uri) || photos.find(p => p.uri);

  return (
    <div className="space-y-4">
      {/* Header & Demo Fill */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#172033]">Photographic Evidence & 3D Reconstruction</h2>
          <p className="text-xs text-[#64748B]">
            Upload or capture house photos; our AI converts your real house image directly into an accurate 3D model
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onLaunchRealtimeScanner && (
            <button
              onClick={onLaunchRealtimeScanner}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Real-Time 3D Scanner</span>
            </button>
          )}
          <button
            onClick={handleCaptureAllDemo}
            disabled={analyzingPhoto}
            className="flex items-center gap-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{analyzingPhoto ? 'Reconstructing 3D Model...' : 'Demo Capture All'}</span>
          </button>
        </div>
      </div>

      {/* Real-time 3D House Reconstruction Status Banner */}
      {(frontPhoto || survey.building.facadeImageUrl || analyzingPhoto) && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#86EFAC] bg-black shrink-0 relative">
                {(survey.building.facadeImageUrl || frontPhoto?.uri) ? (
                  <img
                    src={survey.building.facadeImageUrl || frontPhoto?.uri}
                    alt="House Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Box className="w-5 h-5 animate-pulse" />
                  </div>
                )}
                {analyzingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-bold text-xs text-[#15803D]">
                    {analyzingPhoto ? 'Extracting Architectural Features from Photo...' : '3D Model Digital Twin Synced to Real House Photo'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#166534]">
                  <span>
                    Stories: <strong>{survey.building.floorCount || survey.floors.length} Floors</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Roof: <strong className="capitalize">{survey.building.roofStyle || 'Pitched'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Roof Color:
                    <span
                      className="w-3 h-3 rounded-full border inline-block"
                      style={{ backgroundColor: survey.building.roofColor || '#B45309' }}
                    />
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Wall Tint:
                    <span
                      className="w-3 h-3 rounded-full border inline-block"
                      style={{ backgroundColor: survey.building.wallColor || '#F8FAFC' }}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right self-end sm:self-center">
              <span className="text-[11px] text-[#15803D] font-medium bg-[#DCFCE7] px-2.5 py-1 rounded-md border border-[#86EFAC]">
                Ready in Step 8 (3D Model) ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Checklist Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
          Capture Progress & Evidence Quality
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px]">Exterior</span>
            <span className="font-mono font-bold text-[#16A34A] text-sm mt-0.5 block">
              {exteriorCaptured} / {exteriorPhotos.length} {exteriorCaptured === exteriorPhotos.length ? '✓' : ''}
            </span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px]">Interior</span>
            <span className="font-mono font-bold text-[#2563EB] text-sm mt-0.5 block">
              {interiorCaptured} / {interiorPhotos.length}
            </span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[11px]">3D Twin Status</span>
            <span className="font-mono font-bold text-[#15803D] text-sm mt-0.5 block">
              {survey.building.facadeImageUrl ? 'Photo-Aligned ✓' : 'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const isCaptured = Boolean(photo.uri);

          return (
            <div
              key={photo.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#172033]">{photo.category}</span>
                  {photo.required ? (
                    <span className="text-[10px] font-semibold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.2 rounded border border-[#FDE68A]">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.2 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-1">{photo.label}</p>
              </div>

              {/* Photo Preview Container */}
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                {isCaptured ? (
                  <>
                    <img
                      src={photo.uri}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold bg-white/95 text-[#16A34A] px-1.5 py-0.5 rounded border border-[#E2E8F0] shadow-xs">
                        Sharp {photo.sharpnessScore || 92}%
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-white/95 text-[#475569] px-1.5 py-0.5 rounded border border-[#E2E8F0] shadow-xs flex items-center gap-0.5">
                        <Sun className="w-2.5 h-2.5 text-[#D97706]" />
                        {photo.luxScore || 85} Lux
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#94A3B8] gap-1">
                    <Camera className="w-6 h-6" />
                    <span className="text-[11px]">No photo captured</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCapturePhoto(photo.id)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isCaptured ? 'Retake' : 'Capture'}</span>
                </button>

                <label className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] cursor-pointer transition-colors" title="Upload Real House Photo">
                  <Image className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(photo.id, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
