import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Magnet,
  Ruler,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { validateRoomFurniture } from '../../utils/geometryValidation';

export const BottomStatusBar: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const selectedFurnitureId = useStudioStore((s) => s.selectedFurnitureId);
  const showMeasurements = useStudioStore((s) => s.showMeasurements);
  const showGrid = useStudioStore((s) => s.showGrid);
  const gridSnap = useStudioStore((s) => s.gridSnap);
  const clampToRoom = useStudioStore((s) => s.clampToRoom);
  const layersOpen = useStudioStore((s) => s.layersOpen);

  const setShowMeasurements = useStudioStore((s) => s.setShowMeasurements);
  const setShowGrid = useStudioStore((s) => s.setShowGrid);
  const setGridSnap = useStudioStore((s) => s.setGridSnap);
  const setClampToRoom = useStudioStore((s) => s.setClampToRoom);
  const setLayersOpen = useStudioStore((s) => s.setLayersOpen);
  const selectFurniture = useStudioStore((s) => s.selectFurniture);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const removeFurniture = useStudioStore((s) => s.removeFurniture);

  const activeRoom = useMemo(() => {
    if (!activeProject) return null;
    return (
      activeProject.rooms.find((r) => r.id === activeProject.activeRoomId) ??
      activeProject.rooms[0]
    );
  }, [activeProject]);

  const conflicts = useMemo(() => {
    if (!activeRoom) return new Map();
    return validateRoomFurniture(activeRoom);
  }, [activeRoom]);

  if (!activeProject || !activeRoom) return null;

  const area = (activeRoom.width * activeRoom.length).toFixed(1);
  const conflictCount = conflicts.size;

  return (
    <footer className="relative h-9 shrink-0 bg-[var(--rc-surface)] border-t border-[var(--rc-border)] px-3 flex items-center justify-between gap-4 text-xs text-[var(--rc-muted)] select-none z-30 no-print">
      {/* Left: Measurements & Object Count */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            layersOpen
              ? 'bg-[#D9A05B] text-[#0C0E12]'
              : 'bg-[#1A1E26] hover:bg-[#222732] text-[#E5E7EB]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers ({activeRoom.furniture.length})
        </button>

        <span className="font-mono-num text-[#E5E7EB] whitespace-nowrap">
          {activeRoom.width.toFixed(1)}m × {activeRoom.length.toFixed(1)}m ×{' '}
          {activeRoom.height.toFixed(1)}m
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-mono-num whitespace-nowrap">{area} m²</span>
        <span aria-hidden="true" className="hidden sm:inline">
          ·
        </span>
        <span className="hidden sm:inline whitespace-nowrap">
          {activeRoom.openings.length} openings
        </span>
      </div>

      {/* Center: Spatial & Collision Validation */}
      <div className="hidden md:flex items-center gap-2">
        {conflictCount > 0 ? (
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{conflictCount} overlap / boundary alert</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#9CA3AF]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clearance valid</span>
          </div>
        )}
      </div>

      {/* Right: Snap, Clamp, Grid, Measurements */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() =>
            setGridSnap(gridSnap === 0 ? 0.1 : gridSnap === 0.1 ? 0.25 : 0)
          }
          className="px-2 py-1 rounded bg-[#1A1E26] hover:bg-[#222732] text-[11px] font-mono-num text-[#E5E7EB] whitespace-nowrap"
          title="Cycle Grid Snap Step"
        >
          Snap: {gridSnap === 0 ? 'Off' : `${gridSnap.toFixed(2)}m`}
        </button>

        <button
          onClick={() => setClampToRoom(!clampToRoom)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] whitespace-nowrap ${
            clampToRoom
              ? 'bg-[#222732] text-[#D9A05B]'
              : 'bg-[#1A1E26] text-[#9CA3AF]'
          }`}
          title="Keep furniture inside room walls"
        >
          <Magnet className="w-3 h-3" />
          Bounds
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap ${
            showGrid
              ? 'bg-[#222732] text-[#F1F3F5]'
              : 'bg-[#1A1E26] text-[#9CA3AF]'
          }`}
        >
          Grid
        </button>

        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] whitespace-nowrap ${
            showMeasurements
              ? 'bg-[#222732] text-[#D9A05B]'
              : 'bg-[#1A1E26] text-[#9CA3AF]'
          }`}
        >
          <Ruler className="w-3 h-3" />
          Dimensions
        </button>
      </div>

      {/* Layers Popover Drawer */}
      {layersOpen && (
        <div className="absolute bottom-10 left-3 w-80 max-h-72 rounded-lg bg-[#1A1E26] border border-white/12 shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
            <span className="text-xs font-semibold text-[#F1F3F5]">
              {activeRoom.name} Objects
            </span>
            <button
              onClick={() => setLayersOpen(false)}
              className="text-xs text-[#8B949E] hover:text-[#F1F3F5]"
            >
              Close
            </button>
          </div>
          <div className="overflow-y-auto divide-y divide-white/6">
            {activeRoom.furniture.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8B949E]">
                No furniture placed in this room yet.
              </div>
            ) : (
              activeRoom.furniture.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectFurniture(item.id)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer text-xs ${
                    selectedFurnitureId === item.id
                      ? 'bg-[#252B36] text-[#D9A05B]'
                      : 'text-[#E5E7EB] hover:bg-white/4'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-medium">{item.name}</span>
                    {conflicts.has(item.id) && (
                      <span className="ml-1.5 text-[10px] text-amber-400">
                        (Overlap)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFurniture(item.id, { visible: !item.visible });
                      }}
                      className="p-1 text-[#8B949E] hover:text-[#F1F3F5]"
                      title={item.visible ? 'Hide' : 'Show'}
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFurniture(item.id, { locked: !item.locked });
                      }}
                      className="p-1 text-[#8B949E] hover:text-[#F1F3F5]"
                      title={item.locked ? 'Unlock' : 'Lock'}
                    >
                      {item.locked ? <Lock className="w-3.5 h-3.5 text-[#D9A05B]" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFurniture(item.id);
                      }}
                      className="p-1 text-[#8B949E] hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
