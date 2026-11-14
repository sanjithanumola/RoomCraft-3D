import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Download,
  Eye,
  Footprints,
  Maximize2,
  Moon,
  Move,
  MousePointer2,
  Palette,
  Redo2,
  RotateCw,
  Save,
  Sun,
  Undo2,
  Box,
  Grid,
  Columns2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import type {
  CameraAnglePreset,
  CameraMode,
  DesignTheme,
  TransformMode,
  ViewportMode,
} from '../../types/studio';

export const TopToolbar: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const saveStatus = useStudioStore((s) => s.saveStatus);
  const past = useStudioStore((s) => s.past);
  const future = useStudioStore((s) => s.future);
  const transformMode = useStudioStore((s) => s.transformMode);
  const viewportMode = useStudioStore((s) => s.viewportMode);
  const cameraMode = useStudioStore((s) => s.cameraMode);

  const goToDashboard = useStudioStore((s) => s.goToDashboard);
  const renameProject = useStudioStore((s) => s.renameProject);
  const saveNow = useStudioStore((s) => s.saveNow);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const setTransformMode = useStudioStore((s) => s.setTransformMode);
  const setViewportMode = useStudioStore((s) => s.setViewportMode);
  const setCameraMode = useStudioStore((s) => s.setCameraMode);
  const triggerCameraPreset = useStudioStore((s) => s.triggerCameraPreset);
  const updateLighting = useStudioStore((s) => s.updateLighting);
  const setDesignTheme = useStudioStore((s) => s.setDesignTheme);
  const setExportModalOpen = useStudioStore((s) => s.setExportModalOpen);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  if (!activeProject) return null;

  const isDay = activeProject.lighting.mode === 'day';

  const commitTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft.trim() !== activeProject.name) {
      void renameProject(activeProject.id, titleDraft.trim());
    }
  };

  const transformModes: { id: TransformMode; label: string; icon: React.ReactNode }[] = [
    { id: 'drag', label: 'Drag', icon: <MousePointer2 className="w-3.5 h-3.5" /> },
    { id: 'translate', label: 'Move', icon: <Move className="w-3.5 h-3.5" /> },
    { id: 'rotate', label: 'Rotate', icon: <RotateCw className="w-3.5 h-3.5" /> },
    { id: 'scale', label: 'Resize', icon: <Maximize2 className="w-3.5 h-3.5" /> },
  ];

  const viewportModes: { id: ViewportMode; label: string; icon: React.ReactNode }[] = [
    { id: '3d', label: '3D', icon: <Box className="w-3.5 h-3.5" /> },
    { id: '2d', label: '2D Plan', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'split', label: 'Split', icon: <Columns2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-12 shrink-0 bg-[var(--rc-surface)] border-b border-[var(--rc-border)] px-3 flex items-center justify-between gap-3 select-none z-30 no-print">
      {/* Left: Back + Project Name + Undo/Redo */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => void goToDashboard()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--rc-elevated)] hover:opacity-90 border border-[var(--rc-border)] text-xs font-medium text-[var(--rc-text)] whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </button>

        <div className="h-4 w-px bg-white/10 shrink-0" />

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            className="bg-[var(--rc-bg)] border border-[var(--rc-accent)] rounded px-2 py-1 text-xs font-medium text-[var(--rc-text)] w-40 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setTitleDraft(activeProject.name);
              setEditingTitle(true);
            }}
            title="Click to rename project"
            className="text-xs font-semibold text-[var(--rc-text)] hover:text-[var(--rc-accent)] truncate max-w-[150px] text-left transition-colors"
          >
            {activeProject.name}
          </button>
        )}

        <div className="flex items-center gap-1 ml-1 shrink-0">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md bg-[var(--rc-elevated)] hover:opacity-90 text-[var(--rc-text)] disabled:opacity-35"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-md bg-[var(--rc-elevated)] hover:opacity-90 text-[var(--rc-text)] disabled:opacity-35"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Transform Tools & View Switcher */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-[var(--rc-bg)] p-0.5 rounded-lg border border-[var(--rc-border)]">
          {transformModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setTransformMode(m.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                transformMode === m.id
                  ? 'bg-[var(--rc-accent)] text-[#0C0E12]'
                  : 'text-[var(--rc-muted)] hover:text-[var(--rc-text)]'
              }`}
            >
              {m.icon}
              <span className="hidden xl:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center bg-[var(--rc-bg)] p-0.5 rounded-lg border border-[var(--rc-border)]">
          {viewportModes.map((vm) => (
            <button
              key={vm.id}
              onClick={() => setViewportMode(vm.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                viewportMode === vm.id
                  ? 'bg-[var(--rc-elevated)] text-[var(--rc-text)]'
                  : 'text-[var(--rc-muted)] hover:text-[var(--rc-text)]'
              }`}
            >
              {vm.icon}
              <span>{vm.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Camera, Lighting Mode, Theme, Save, Export */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Camera Mode & Angle Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setCameraMenuOpen(!cameraMenuOpen);
              setThemeMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-xs font-medium text-[#E5E7EB] whitespace-nowrap"
          >
            {cameraMode === 'walkthrough' ? (
              <Footprints className="w-3.5 h-3.5 text-[#D9A05B]" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-[#D9A05B]" />
            )}
            <span className="capitalize">{cameraMode}</span>
          </button>

          {cameraMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-[#1A1E26] border border-white/12 shadow-xl py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-medium text-[#8B949E]">
                Projection Mode
              </div>
              {(
                [
                  ['perspective', 'Perspective Orbit'],
                  ['orthographic', 'Orthographic CAD'],
                  ['walkthrough', 'First-Person Walk'],
                ] as [CameraMode, string][]
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCameraMode(mode);
                    setCameraMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/6 ${
                    cameraMode === mode ? 'text-[#D9A05B] font-medium' : 'text-[#E5E7EB]'
                  }`}
                >
                  {label}
                  {mode === 'walkthrough' && <Eye className="w-3.5 h-3.5" />}
                </button>
              ))}
              <div className="my-1 border-t border-white/8" />
              <div className="px-3 py-1 text-[11px] font-medium text-[#8B949E]">
                Camera Angles
              </div>
              {(
                [
                  ['isometric', 'Isometric 3/4'],
                  ['corner', 'Interior Corner'],
                  ['front', 'Front Elevation'],
                  ['top', 'Top Plan View'],
                  ['eye-level', 'Eye-Level Photo'],
                ] as [CameraAnglePreset, string][]
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  onClick={() => {
                    triggerCameraPreset(preset);
                    setCameraMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#E5E7EB] hover:bg-white/6"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Day / Night toggle */}
        <button
          onClick={() =>
            updateLighting(
              isDay
                ? { mode: 'night', sunIntensity: 0.25, ambientIntensity: 0.28, ceilingLightIntensity: 1.05 }
                : { mode: 'day', sunIntensity: 1.65, ambientIntensity: 0.45 },
              true
            )
          }
          title={isDay ? 'Switch to Night Lighting' : 'Switch to Daylight'}
          className="p-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-[#E5E7EB]"
        >
          {isDay ? <Sun className="w-3.5 h-3.5 text-[#D9A05B]" /> : <Moon className="w-3.5 h-3.5 text-[#5B8DEF]" />}
        </button>

        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeMenuOpen(!themeMenuOpen);
              setCameraMenuOpen(false);
            }}
            title="Studio Theme"
            className="p-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-[#E5E7EB]"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          {themeMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-[#1A1E26] border border-white/12 shadow-xl py-1 z-50">
              {(
                [
                  ['obsidian', 'Obsidian Dark'],
                  ['graphite', 'Graphite Blue'],
                  ['studio-light', 'Studio Slate'],
                ] as [DesignTheme, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setDesignTheme(id);
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/6 ${
                    activeProject.theme === id ? 'text-[#D9A05B] font-medium' : 'text-[#E5E7EB]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={() => void saveNow()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-xs font-medium text-[#E5E7EB] whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5 text-[#D9A05B]" />
          <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Save*' : 'Saved'}</span>
        </button>

        {/* Primary Export Action */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D9A05B] hover:bg-[#E5B272] text-[#0C0E12] text-xs font-semibold whitespace-nowrap transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
};
