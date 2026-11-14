import React, { useState } from 'react';
import { Camera, FileCode2, Printer, Ruler, X } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import type { CameraAnglePreset } from '../../types/studio';
import { exportDimensionsSpec, exportProjectJson } from '../../utils/storage';

const ANGLES: { id?: CameraAnglePreset; label: string }[] = [
  { id: undefined, label: 'Current View' },
  { id: 'isometric', label: 'Isometric 3/4' },
  { id: 'corner', label: 'Corner Interior' },
  { id: 'eye-level', label: 'Eye-Level Photo' },
  { id: 'top', label: 'Top Plan View' },
];

export const ExportModal: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const exportModalOpen = useStudioStore((s) => s.exportModalOpen);
  const setExportModalOpen = useStudioStore((s) => s.setExportModalOpen);
  const captureScreenshotFn = useStudioStore((s) => s.captureScreenshotFn);

  const [selectedAngle, setSelectedAngle] = useState<CameraAnglePreset | undefined>(
    undefined
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!exportModalOpen || !activeProject) return null;

  const generatePreview = (angle?: CameraAnglePreset) => {
    setSelectedAngle(angle);
    if (captureScreenshotFn) {
      const url = captureScreenshotFn(angle);
      setPreviewUrl(url);
    }
  };

  const downloadPng = () => {
    const dataUrl = previewUrl ?? captureScreenshotFn?.(selectedAngle);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const suffix = selectedAngle ?? 'view';
    a.download = `${activeProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suffix}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 no-print">
      <div className="w-full max-w-2xl rounded-xl bg-[#13161C] border border-white/12 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <h2 className="text-sm font-semibold text-[#F1F3F5]">
            Export & Share Studio Project
          </h2>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 text-[#8B949E] hover:text-[#F1F3F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* PNG Multi-angle screenshot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F1F3F5]">
                High-Resolution PNG Render
              </span>
              <span className="text-[11px] text-[#8B949E]">
                Choose camera angle to capture
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ANGLES.map((a) => (
                <button
                  key={a.label}
                  onClick={() => generatePreview(a.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedAngle === a.id && previewUrl
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] hover:bg-[#222732] text-[#E5E7EB] border border-white/8'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#0C0E12]">
                <img
                  src={previewUrl}
                  alt="3D Render Preview"
                  className="w-full h-56 object-contain"
                />
              </div>
            ) : (
              <div className="h-36 rounded-lg border border-dashed border-white/12 bg-[#0C0E12] flex flex-col items-center justify-center text-xs text-[#8B949E] gap-2">
                <Camera className="w-5 h-5 text-[#D9A05B]" />
                <span>Click any angle above to preview or click Download PNG directly</span>
              </div>
            )}

            <button
              onClick={downloadPng}
              className="w-full py-2.5 rounded-lg bg-[#D9A05B] hover:bg-[#E5B272] text-[#0C0E12] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Download PNG Screenshot
            </button>
          </div>

          {/* Architectural Exports */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/8">
            <button
              onClick={() => exportProjectJson(activeProject)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-xs font-medium text-[#E5E7EB]"
            >
              <FileCode2 className="w-4 h-4 text-[#D9A05B]" />
              Save JSON Config
            </button>
            <button
              onClick={() => exportDimensionsSpec(activeProject)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-xs font-medium text-[#E5E7EB]"
            >
              <Ruler className="w-4 h-4 text-[#D9A05B]" />
              Room Dimensions
            </button>
            <button
              onClick={() => {
                setExportModalOpen(false);
                setTimeout(() => window.print(), 120);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-xs font-medium text-[#E5E7EB]"
            >
              <Printer className="w-4 h-4 text-[#D9A05B]" />
              Print Room Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
