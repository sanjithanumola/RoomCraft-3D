import React, { useMemo, useState } from 'react';
import {
  Armchair,
  BedDouble,
  DoorOpen,
  LampFloor,
  Layers,
  Plus,
  Search,
  Sofa,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  Trees,
  UtensilsCrossed,
  BookOpen,
  PanelLeftClose,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  FURNITURE_CATALOG,
  MATERIAL_PRESETS,
} from '../../data/catalog';
import { useStudioStore } from '../../store/useStudioStore';
import type { FurnitureCategory, RoomType, WallSide } from '../../types/studio';

const CATEGORIES: FurnitureCategory[] = [
  'sofas',
  'beds',
  'chairs',
  'tables',
  'wardrobes',
  'cabinets',
  'desks',
  'lamps',
  'plants',
  'decorations',
  'kitchen',
];

const getCategoryIcon = (cat: FurnitureCategory) => {
  switch (cat) {
    case 'sofas':
      return <Sofa className="w-3.5 h-3.5" />;
    case 'beds':
      return <BedDouble className="w-3.5 h-3.5" />;
    case 'chairs':
      return <Armchair className="w-3.5 h-3.5" />;
    case 'lamps':
      return <LampFloor className="w-3.5 h-3.5" />;
    case 'plants':
      return <Trees className="w-3.5 h-3.5" />;
    case 'kitchen':
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    default:
      return <BookOpen className="w-3.5 h-3.5" />;
  }
};

export const LeftSidebar: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const leftTab = useStudioStore((s) => s.leftTab);
  const setLeftTab = useStudioStore((s) => s.setLeftTab);
  const setLeftSidebarOpen = useStudioStore((s) => s.setLeftSidebarOpen);
  const addFurniture = useStudioStore((s) => s.addFurniture);
  const switchRoom = useStudioStore((s) => s.switchRoom);
  const addConnectedRoom = useStudioStore((s) => s.addConnectedRoom);
  const removeRoom = useStudioStore((s) => s.removeRoom);
  const updateRoomDimensions = useStudioStore((s) => s.updateRoomDimensions);
  const updateRoomMaterials = useStudioStore((s) => s.updateRoomMaterials);
  const addOpening = useStudioStore((s) => s.addOpening);
  const updateOpening = useStudioStore((s) => s.updateOpening);
  const removeOpening = useStudioStore((s) => s.removeOpening);
  const selectedOpeningId = useStudioStore((s) => s.selectedOpeningId);
  const selectOpening = useStudioStore((s) => s.selectOpening);
  const updateLighting = useStudioStore((s) => s.updateLighting);
  const cutawayWalls = useStudioStore((s) => s.cutawayWalls);
  const setCutawayWalls = useStudioStore((s) => s.setCutawayWalls);
  const showCeiling = useStudioStore((s) => s.showCeiling);
  const setShowCeiling = useStudioStore((s) => s.setShowCeiling);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | FurnitureCategory>('all');
  const [newRoomType, setNewRoomType] = useState<RoomType>('bedroom');
  const [openingWall, setOpeningWall] = useState<WallSide>('north');

  const activeRoom = useMemo(() => {
    if (!activeProject) return null;
    return (
      activeProject.rooms.find((r) => r.id === activeProject.activeRoomId) ??
      activeProject.rooms[0]
    );
  }, [activeProject]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FURNITURE_CATALOG.filter((item) => {
      const catMatch = activeCategory === 'all' || item.category === activeCategory;
      const textMatch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [search, activeCategory]);

  if (!activeProject || !activeRoom) return null;

  const selectedOpening = activeRoom.openings.find((o) => o.id === selectedOpeningId);

  return (
    <aside className="w-[280px] shrink-0 h-full bg-[var(--rc-surface)] border-r border-[var(--rc-border)] flex flex-col select-none">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8">
        <div className="flex items-center gap-1 bg-[#0C0E12] p-0.5 rounded-lg flex-1 mr-2">
          <button
            onClick={() => setLeftTab('furniture')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              leftTab === 'furniture'
                ? 'bg-[#222731] text-[#F1F3F5]'
                : 'text-[#8B949E] hover:text-[#F1F3F5]'
            }`}
          >
            Furniture
          </button>
          <button
            onClick={() => setLeftTab('room')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              leftTab === 'room'
                ? 'bg-[#222731] text-[#F1F3F5]'
                : 'text-[#8B949E] hover:text-[#F1F3F5]'
            }`}
          >
            Room
          </button>
          <button
            onClick={() => setLeftTab('lighting')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              leftTab === 'lighting'
                ? 'bg-[#222731] text-[#F1F3F5]'
                : 'text-[#8B949E] hover:text-[#F1F3F5]'
            }`}
          >
            Lighting
          </button>
        </div>
        <button
          onClick={() => setLeftSidebarOpen(false)}
          title="Collapse Library"
          className="p-1.5 text-[#8B949E] hover:text-[#F1F3F5] rounded-md hover:bg-white/5"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {leftTab === 'furniture' && (
          <>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 3D furniture..."
                className="w-full bg-[#0C0E12] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F1F3F5] placeholder-[#6B7280] focus:outline-none focus:border-[#D9A05B]"
              />
            </div>

            {/* Category filter grid */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-[#D9A05B] text-[#0C0E12]'
                    : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#F1F3F5]'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#F1F3F5]'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#8B949E]">
              Click to add or drag any object directly into the 3D room.
            </p>

            {/* Furniture Cards */}
            <div className="space-y-2">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/roomcraft-furniture', item.id);
                  }}
                  onClick={() => addFurniture(item.id)}
                  className="group p-2.5 rounded-lg bg-[#1A1E26] hover:bg-[#222732] border border-white/6 hover:border-[#D9A05B]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#0C0E12] flex items-center justify-center text-[#D9A05B] shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#F1F3F5] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#8B949E] font-mono-num">
                          {item.defaultSize[0].toFixed(2)}×{item.defaultSize[2].toFixed(2)}×
                          {item.defaultSize[1].toFixed(2)}m
                        </div>
                      </div>
                    </div>
                    <span className="p-1 rounded bg-[#0C0E12] text-[#8B949E] group-hover:text-[#D9A05B] transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="py-8 text-center text-xs text-[#8B949E]">
                  No furniture matches "{search}".
                </div>
              )}
            </div>
          </>
        )}

        {leftTab === 'room' && (
          <div className="space-y-5">
            {/* Multi-Room Manager */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#D9A05B]" />
                  Rooms ({activeProject.rooms.length})
                </h3>
              </div>
              <div className="space-y-1.5">
                {activeProject.rooms.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs cursor-pointer ${
                      r.id === activeRoom.id
                        ? 'bg-[#222732] border-[#D9A05B]/50 text-[#F1F3F5]'
                        : 'bg-[#1A1E26] border-white/6 text-[#9CA3AF] hover:text-[#F1F3F5]'
                    }`}
                    onClick={() => switchRoom(r.id)}
                  >
                    <div className="truncate">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-[11px] text-[#8B949E] ml-1.5 font-mono-num">
                        {r.width.toFixed(1)}×{r.length.toFixed(1)}m
                      </span>
                    </div>
                    {activeProject.rooms.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRoom(r.id);
                        }}
                        className="p-1 text-[#8B949E] hover:text-red-400"
                        title="Delete room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="flex-1 bg-[#0C0E12] border border-white/10 rounded-md px-2 py-1.5 text-xs text-[#F1F3F5]"
                >
                  <option value="bedroom">Bedroom</option>
                  <option value="living">Living Room</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="office">Office</option>
                  <option value="custom">Custom Room</option>
                </select>
                <button
                  onClick={() => addConnectedRoom(newRoomType)}
                  className="px-2.5 py-1.5 bg-[#D9A05B] text-[#0C0E12] text-xs font-medium rounded-md hover:bg-[#E5B272] whitespace-nowrap"
                >
                  + Add Room
                </button>
              </div>
            </section>

            {/* Room Dimensions */}
            <section className="space-y-3 pt-3 border-t border-white/8">
              <h3 className="text-xs font-semibold text-[#F1F3F5]">Dimensions</h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Room Name</span>
                </div>
                <input
                  type="text"
                  value={activeRoom.name}
                  onChange={(e) =>
                    updateRoomDimensions({ name: e.target.value }, false)
                  }
                  className="w-full bg-[#0C0E12] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#F1F3F5]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Width (X)</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeRoom.width.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={2.5}
                  max={14}
                  step={0.1}
                  value={activeRoom.width}
                  onChange={(e) =>
                    updateRoomDimensions({ width: parseFloat(e.target.value) }, false)
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Length (Z)</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeRoom.length.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={2.5}
                  max={14}
                  step={0.1}
                  value={activeRoom.length}
                  onChange={(e) =>
                    updateRoomDimensions({ length: parseFloat(e.target.value) }, false)
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Ceiling Height (Y)</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeRoom.height.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={2.2}
                  max={5.0}
                  step={0.1}
                  value={activeRoom.height}
                  onChange={(e) =>
                    updateRoomDimensions({ height: parseFloat(e.target.value) }, false)
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#9CA3AF]">Cutaway Front Walls</span>
                <button
                  onClick={() => setCutawayWalls(!cutawayWalls)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    cutawayWalls
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] text-[#9CA3AF]'
                  }`}
                >
                  {cutawayWalls ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Show Ceiling</span>
                <button
                  onClick={() => setShowCeiling(!showCeiling)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    showCeiling
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] text-[#9CA3AF]'
                  }`}
                >
                  {showCeiling ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </section>

            {/* Doors & Windows */}
            <section className="space-y-3 pt-3 border-t border-white/8">
              <h3 className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-[#D9A05B]" />
                Doors & Windows
              </h3>
              <div className="flex items-center gap-1.5">
                <select
                  value={openingWall}
                  onChange={(e) => setOpeningWall(e.target.value as WallSide)}
                  className="bg-[#0C0E12] border border-white/10 rounded-md px-2 py-1.5 text-xs text-[#F1F3F5]"
                >
                  <option value="north">North Wall</option>
                  <option value="south">South Wall</option>
                  <option value="west">West Wall</option>
                  <option value="east">East Wall</option>
                </select>
                <button
                  onClick={() =>
                    addOpening({
                      type: 'door',
                      wall: openingWall,
                      offset: 0,
                      width: 0.95,
                      height: 2.15,
                      elevation: 0,
                      frameColor: '#5D3E28',
                    })
                  }
                  className="flex-1 py-1.5 bg-[#1A1E26] hover:bg-[#222732] border border-white/10 rounded-md text-xs text-[#F1F3F5]"
                >
                  + Door
                </button>
                <button
                  onClick={() =>
                    addOpening({
                      type: 'window',
                      wall: openingWall,
                      offset: 0,
                      width: 1.6,
                      height: 1.5,
                      elevation: 0.7,
                      frameColor: '#25282E',
                    })
                  }
                  className="flex-1 py-1.5 bg-[#1A1E26] hover:bg-[#222732] border border-white/10 rounded-md text-xs text-[#F1F3F5]"
                >
                  + Window
                </button>
              </div>

              <div className="space-y-1.5">
                {activeRoom.openings.map((op) => (
                  <div
                    key={op.id}
                    onClick={() => selectOpening(op.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs cursor-pointer ${
                      selectedOpeningId === op.id
                        ? 'bg-[#222732] border-[#D9A05B]/60 text-[#F1F3F5]'
                        : 'bg-[#1A1E26] border-white/6 text-[#9CA3AF]'
                    }`}
                  >
                    <span className="capitalize">
                      {op.type} · {op.wall}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOpening(op.id);
                      }}
                      className="text-[#8B949E] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedOpening && (
                <div className="p-2.5 rounded-lg bg-[#0C0E12] border border-white/10 space-y-2.5">
                  <div className="text-[11px] font-medium text-[#D9A05B] capitalize">
                    Editing {selectedOpening.type} ({selectedOpening.wall} wall)
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-[#9CA3AF]">
                      <span>Wall Offset</span>
                      <span className="font-mono-num">{selectedOpening.offset.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min={-2.5}
                      max={2.5}
                      step={0.1}
                      value={selectedOpening.offset}
                      onChange={(e) =>
                        updateOpening(selectedOpening.id, { offset: parseFloat(e.target.value) }, false)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-[#9CA3AF]">
                      <span>Width</span>
                      <span className="font-mono-num">{selectedOpening.width.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={3.8}
                      step={0.1}
                      value={selectedOpening.width}
                      onChange={(e) =>
                        updateOpening(selectedOpening.id, { width: parseFloat(e.target.value) }, false)
                      }
                      className="w-full"
                    />
                  </div>
                  {selectedOpening.type === 'window' && (
                    <div>
                      <div className="flex justify-between text-[11px] text-[#9CA3AF]">
                        <span>Sill Elevation</span>
                        <span className="font-mono-num">{selectedOpening.elevation.toFixed(2)}m</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1.4}
                        step={0.05}
                        value={selectedOpening.elevation}
                        onChange={(e) =>
                          updateOpening(selectedOpening.id, { elevation: parseFloat(e.target.value) }, false)
                        }
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Quick Surface Material Presets */}
            <section className="space-y-2 pt-3 border-t border-white/8">
              <h3 className="text-xs font-semibold text-[#F1F3F5]">Quick Floor Finishes</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {MATERIAL_PRESETS.filter((p) =>
                  ['wood', 'marble', 'concrete', 'tiles'].includes(p.config.type)
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      updateRoomMaterials({ floorMaterial: { ...preset.config } })
                    }
                    className="flex items-center gap-2 p-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/6 text-left"
                  >
                    <span
                      className="w-4 h-4 rounded-sm shrink-0 border border-white/15"
                      style={{ backgroundColor: preset.config.color }}
                    />
                    <span className="text-[11px] text-[#D1D5DB] truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {leftTab === 'lighting' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1 p-1 bg-[#0C0E12] rounded-lg">
              <button
                onClick={() =>
                  updateLighting({
                    mode: 'day',
                    sunIntensity: 1.65,
                    ambientIntensity: 0.45,
                  }, true)
                }
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeProject.lighting.mode === 'day'
                    ? 'bg-[#D9A05B] text-[#0C0E12]'
                    : 'text-[#8B949E] hover:text-[#F1F3F5]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Daylight
              </button>
              <button
                onClick={() =>
                  updateLighting({
                    mode: 'night',
                    sunIntensity: 0.25,
                    ambientIntensity: 0.28,
                    ceilingLightIntensity: 1.05,
                  }, true)
                }
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeProject.lighting.mode === 'night'
                    ? 'bg-[#5B8DEF] text-white'
                    : 'text-[#8B949E] hover:text-[#F1F3F5]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Night
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Sunlight Intensity</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeProject.lighting.sunIntensity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.05}
                  value={activeProject.lighting.sunIntensity}
                  onChange={(e) =>
                    updateLighting({ sunIntensity: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Sun Azimuth</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {Math.round(activeProject.lighting.sunAzimuth)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={2}
                  value={activeProject.lighting.sunAzimuth}
                  onChange={(e) =>
                    updateLighting({ sunAzimuth: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Sun Elevation</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {Math.round(activeProject.lighting.sunElevation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={1}
                  value={activeProject.lighting.sunElevation}
                  onChange={(e) =>
                    updateLighting({ sunElevation: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Ceiling Light</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeProject.lighting.ceilingLightIntensity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2.5}
                  step={0.05}
                  value={activeProject.lighting.ceilingLightIntensity}
                  onChange={(e) =>
                    updateLighting({ ceilingLightIntensity: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Ambient Fill</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeProject.lighting.ambientIntensity.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.4}
                  step={0.05}
                  value={activeProject.lighting.ambientIntensity}
                  onChange={(e) =>
                    updateLighting({ ambientIntensity: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/8">
                <span className="text-xs text-[#9CA3AF]">Ceiling Color Temp</span>
                <div className="flex items-center gap-1.5">
                  {['#FFF3DF', '#FFFFFF', '#D8E7FF', '#FFD39A'].map((col) => (
                    <button
                      key={col}
                      onClick={() => updateLighting({ ceilingLightColor: col })}
                      className={`w-5 h-5 rounded-full border ${
                        activeProject.lighting.ceilingLightColor === col
                          ? 'border-[#D9A05B] scale-110'
                          : 'border-white/20'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">Realistic Shadows</span>
                <button
                  onClick={() =>
                    updateLighting({
                      shadowsEnabled: !activeProject.lighting.shadowsEnabled,
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    activeProject.lighting.shadowsEnabled
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] text-[#9CA3AF]'
                  }`}
                >
                  {activeProject.lighting.shadowsEnabled ? 'Enabled' : 'Off'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9A05B]" />
                  Floor & Table Lamps
                </span>
                <button
                  onClick={() =>
                    updateLighting({
                      lampGlowEnabled: !activeProject.lighting.lampGlowEnabled,
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    activeProject.lighting.lampGlowEnabled
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#1A1E26] text-[#9CA3AF]'
                  }`}
                >
                  {activeProject.lighting.lampGlowEnabled ? 'Lit' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
