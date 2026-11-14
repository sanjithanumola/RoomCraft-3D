import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  Copy,
  Download,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ROOM_TEMPLATES } from '../../data/catalog';
import { useStudioStore } from '../../store/useStudioStore';
import type { ProjectData, RoomType } from '../../types/studio';
import { exportProjectJson } from '../../utils/storage';

export const Dashboard: React.FC = () => {
  const projects = useStudioStore((s) => s.projects);
  const projectsLoaded = useStudioStore((s) => s.projectsLoaded);
  const openProject = useStudioStore((s) => s.openProject);
  const createNewCustomProject = useStudioStore((s) => s.createNewCustomProject);
  const createFromTemplate = useStudioStore((s) => s.createFromTemplate);
  const importProject = useStudioStore((s) => s.importProject);
  const renameProject = useStudioStore((s) => s.renameProject);
  const duplicateProject = useStudioStore((s) => s.duplicateProject);
  const deleteProject = useStudioStore((s) => s.deleteProject);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('Custom Interior Space');
  const [roomType, setRoomType] = useState<RoomType>('living');
  const [width, setWidth] = useState(5.6);
  const [length, setLength] = useState(4.8);
  const [height, setHeight] = useState(3.0);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNewCustomProject({
      name: roomName,
      roomType,
      width,
      length,
      height,
    });
    setNewModalOpen(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ProjectData;
        if (!parsed.rooms || !Array.isArray(parsed.rooms) || parsed.rooms.length === 0) {
          setImportError('Invalid RoomCraft JSON file.');
          return;
        }
        await importProject(parsed);
      } catch {
        setImportError('Unable to parse JSON project file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0C0E12] text-[#F1F3F5]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0C0E12]/90 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-[#F1F3F5] whitespace-nowrap shrink-0"
          >
            RoomCraft 3D
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9CA3AF]">
            <a
              href="#projects"
              className="hover:text-[#F1F3F5] transition-colors whitespace-nowrap shrink-0"
            >
              Projects
            </a>
            <a
              href="#templates"
              className="hover:text-[#F1F3F5] transition-colors whitespace-nowrap shrink-0"
            >
              Templates
            </a>
            <a
              href="#capabilities"
              className="hover:text-[#F1F3F5] transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
          </nav>

          <div className="shrink-0">
            <button
              onClick={() => setNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9A05B] hover:bg-[#E5B272] text-[#0C0E12] text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#D9A05B]">
              Real-Time 3D Interior Architecture Studio
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#F1F3F5] leading-[1.1] max-w-xl [text-wrap:balance]">
              Design rooms in 3D before you move a single wall.
            </h1>
            <p className="text-base text-[#9CA3AF] leading-relaxed max-w-xl">
              Craft custom rooms with exact dimensions, arrange 3D furniture with snap-to-wall precision, customize PBR wood, marble, and fabric finishes, and walk through your space in real-time lighting.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setNewModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D9A05B] hover:bg-[#E5B272] text-[#0C0E12] text-sm font-semibold transition-colors"
              >
                Create Custom Room
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#13161C] hover:bg-[#1A1E26] border border-white/10 text-sm font-medium text-[#E5E7EB] transition-colors"
              >
                <Upload className="w-4 h-4 text-[#D9A05B]" />
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
            {importError && (
              <p className="text-xs text-red-400">{importError}</p>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden border border-white/10 bg-[#13161C]">
              <img
                src="/src/assets/images/template_modern_living_1794663252777.jpg"
                alt="Contemporary 3D Living Room Render"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E12]/90 via-[#0C0E12]/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#F1F3F5]">
                    Contemporary Loft Lounge
                  </div>
                  <div className="text-xs text-[#D1D5DB] mt-0.5 font-mono-num">
                    6.4m × 5.2m × 3.2m · Ready-to-edit 3D template
                  </div>
                </div>
                <button
                  onClick={() => void createFromTemplate('tpl-modern-living')}
                  className="px-3.5 py-2 rounded-lg bg-[#F1F3F5] hover:bg-white text-[#0C0E12] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                >
                  Open in 3D
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Projects (IndexedDB) */}
        <section id="projects" className="space-y-5">
          <div className="flex items-end justify-between border-b border-white/8 pb-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#F1F3F5]">
                Recent Projects
              </h2>
              <p className="text-xs text-[#8B949E] mt-1">
                Saved locally in IndexedDB with automatic change persistence
              </p>
            </div>
            <span className="text-xs text-[#8B949E] font-mono-num">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {!projectsLoaded ? (
            <div className="py-12 text-center text-sm text-[#8B949E]">
              Loading studio workspace projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-[#13161C] p-10 text-center space-y-3">
              <Box className="w-7 h-7 text-[#D9A05B] mx-auto" />
              <div className="text-sm font-medium text-[#F1F3F5]">
                No saved projects yet
              </div>
              <p className="text-xs text-[#8B949E] max-w-md mx-auto">
                Start from an empty custom room or launch one of the curated architectural templates below.
              </p>
              <button
                onClick={() => setNewModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#D9A05B] text-[#0C0E12] text-xs font-semibold"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => {
                const room = proj.rooms[0];
                const totalFurniture = proj.rooms.reduce(
                  (acc, r) => acc + r.furniture.length,
                  0
                );
                const fallbackImg =
                  room?.type === 'bedroom'
                    ? '/src/assets/images/template_scandi_bedroom_1794663251000.jpg'
                    : room?.type === 'kitchen'
                    ? '/src/assets/images/template_minimal_kitchen_1794663252862.jpg'
                    : room?.type === 'office'
                    ? '/src/assets/images/template_exec_office_1794663253773.jpg'
                    : '/src/assets/images/template_modern_living_1794663252777.jpg';

                return (
                  <article
                    key={proj.id}
                    className="group rounded-xl bg-[#13161C] border border-white/8 hover:border-white/18 overflow-hidden flex flex-col transition-colors"
                  >
                    <div
                      onClick={() => openProject(proj.id)}
                      className="relative h-44 bg-[#0C0E12] cursor-pointer overflow-hidden"
                    >
                      <img
                        src={proj.thumbnailDataUrl || fallbackImg}
                        alt={proj.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] via-transparent to-transparent" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {renamingId === proj.id ? (
                          <input
                            autoFocus
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onBlur={() => {
                              void renameProject(proj.id, renameDraft);
                              setRenamingId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                void renameProject(proj.id, renameDraft);
                                setRenamingId(null);
                              }
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="w-full bg-[#0C0E12] border border-[#D9A05B] rounded px-2 py-1 text-sm font-semibold text-[#F1F3F5]"
                          />
                        ) : (
                          <h3
                            onClick={() => openProject(proj.id)}
                            className="text-base font-semibold text-[#F1F3F5] hover:text-[#D9A05B] cursor-pointer truncate transition-colors"
                          >
                            {proj.name}
                          </h3>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#8B949E] mt-1 font-mono-num">
                          <span className="capitalize">
                            {proj.rooms.length > 1
                              ? `${proj.rooms.length} rooms`
                              : room?.type}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {room ? `${room.width.toFixed(1)}×${room.length.toFixed(1)}m` : ''}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{totalFurniture} items</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/6">
                        <button
                          onClick={() => openProject(proj.id)}
                          className="text-xs font-semibold text-[#D9A05B] hover:text-[#E5B272]"
                        >
                          Open Studio →
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setRenamingId(proj.id);
                              setRenameDraft(proj.name);
                            }}
                            title="Rename"
                            className="p-1.5 rounded text-[#8B949E] hover:text-[#F1F3F5] hover:bg-white/6"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => void duplicateProject(proj.id)}
                            title="Duplicate"
                            className="p-1.5 rounded text-[#8B949E] hover:text-[#F1F3F5] hover:bg-white/6"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => exportProjectJson(proj)}
                            title="Export JSON"
                            className="p-1.5 rounded text-[#8B949E] hover:text-[#F1F3F5] hover:bg-white/6"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeleteId === proj.id ? (
                            <button
                              onClick={() => {
                                void deleteProject(proj.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-[11px] font-medium"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(proj.id)}
                              title="Delete"
                              className="p-1.5 rounded text-[#8B949E] hover:text-red-400 hover:bg-white/6"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Curated Room Templates */}
        <section id="templates" className="space-y-5">
          <div className="border-b border-white/8 pb-3">
            <h2 className="font-display text-xl font-semibold text-[#F1F3F5]">
              Room Templates
            </h2>
            <p className="text-xs text-[#8B949E] mt-1">
              Pre-furnished 3D architectural spaces ready for material and layout customization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROOM_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => void createFromTemplate(tpl.id)}
                className="group rounded-xl bg-[#13161C] border border-white/8 hover:border-[#D9A05B]/50 overflow-hidden cursor-pointer flex flex-col transition-colors"
              >
                <div className="h-44 bg-[#181C24] overflow-hidden relative">
                  {tpl.thumbnailUrl ? (
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    /* Clean CAD floorplan preview for Multi-Room Suite */
                    <div className="w-full h-full flex items-center justify-center p-6 bg-[#11141B]">
                      <svg viewBox="0 0 220 110" className="w-full h-full">
                        <rect x="10" y="12" width="105" height="86" fill="#1C212B" stroke="#D9A05B" strokeWidth="2" />
                        <rect x="115" y="12" width="95" height="86" fill="#181C24" stroke="#5B8DEF" strokeWidth="2" />
                        <rect x="26" y="28" width="42" height="18" rx="2" fill="#3F444E" />
                        <rect x="142" y="24" width="42" height="46" rx="2" fill="#CFC7BA" fillOpacity="0.45" />
                        <text x="62" y="85" textAnchor="middle" fill="#8B949E" fontSize="9">Living Room</text>
                        <text x="162" y="85" textAnchor="middle" fill="#8B949E" fontSize="9">Master Suite</text>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#F1F3F5] group-hover:text-[#D9A05B] transition-colors">
                      {tpl.name}
                    </h3>
                    <span className="text-[11px] font-mono-num text-[#8B949E]">
                      {tpl.dimensionsLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {tpl.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities Overview */}
        <section id="capabilities" className="pt-4 border-t border-white/8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[#F1F3F5]">
              Procedural 3D Furniture & PBR Finishes
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Over 30 multi-part 3D models across 11 categories with customizable wood, marble, concrete, glass, brushed metal, fabric, and tile shaders.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[#F1F3F5]">
              Perspective, Orthographic & Walkthrough
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Orbit freely, inspect true-scale 2D CAD floor plans side by side, or step inside your design at 1.65m eye height with WASD navigation.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[#F1F3F5]">
              Smart Snap, Collision & Export
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Detect overlapping furniture and room boundary violations in real time, then export multi-angle PNG renders, JSON backups, or dimension sheets.
            </p>
          </div>
        </section>
      </main>

      {/* Create New Custom Project Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-[#13161C] border border-white/12 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
              <h2 className="text-sm font-semibold text-[#F1F3F5]">
                Create New 3D Room
              </h2>
              <button
                onClick={() => setNewModalOpen(false)}
                className="p-1 text-[#8B949E] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-[#9CA3AF] block mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-[#0C0E12] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F1F3F5] focus:outline-none focus:border-[#D9A05B]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] block mb-1.5">
                  Room Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      ['bedroom', 'Bedroom'],
                      ['living', 'Living Room'],
                      ['kitchen', 'Kitchen'],
                      ['office', 'Office'],
                      ['custom', 'Custom'],
                    ] as [RoomType, string][]
                  ).map(([val, label]) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRoomType(val)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        roomType === val
                          ? 'bg-[#D9A05B] border-[#D9A05B] text-[#0C0E12]'
                          : 'bg-[#1A1E26] border-white/8 text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-[#9CA3AF] block">Width (m)</span>
                  <input
                    type="number"
                    min={2.5}
                    max={14}
                    step={0.1}
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 4)}
                    className="w-full bg-[#0C0E12] border border-white/10 rounded-lg px-2.5 py-2 text-sm font-mono-num text-[#F1F3F5]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-[#9CA3AF] block">Length (m)</span>
                  <input
                    type="number"
                    min={2.5}
                    max={14}
                    step={0.1}
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 4)}
                    className="w-full bg-[#0C0E12] border border-white/10 rounded-lg px-2.5 py-2 text-sm font-mono-num text-[#F1F3F5]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-[#9CA3AF] block">Height (m)</span>
                  <input
                    type="number"
                    min={2.2}
                    max={5}
                    step={0.1}
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 2.8)}
                    className="w-full bg-[#0C0E12] border border-white/10 rounded-lg px-2.5 py-2 text-sm font-mono-num text-[#F1F3F5]"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A1E26] text-xs font-medium text-[#D1D5DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#D9A05B] hover:bg-[#E5B272] text-[#0C0E12] text-xs font-semibold"
                >
                  Launch 3D Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
