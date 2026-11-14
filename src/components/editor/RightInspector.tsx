import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Copy,
  Lightbulb,
  Lock,
  Magnet,
  PanelRightClose,
  RotateCw,
  Trash2,
  Unlock,
} from 'lucide-react';
import {
  MATERIAL_PRESETS,
  MATERIAL_TYPE_DEFAULTS,
} from '../../data/catalog';
import { useStudioStore } from '../../store/useStudioStore';
import type { MaterialType } from '../../types/studio';
import { validateRoomFurniture } from '../../utils/geometryValidation';

const MATERIAL_TYPES: { id: MaterialType; label: string }[] = [
  { id: 'wood', label: 'Wood' },
  { id: 'marble', label: 'Marble' },
  { id: 'concrete', label: 'Concrete' },
  { id: 'glass', label: 'Glass' },
  { id: 'metal', label: 'Metal' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'tiles', label: 'Tiles' },
  { id: 'paint', label: 'Paint' },
];

const CURATED_SWATCHES = [
  '#ECEAE4',
  '#CFC7BA',
  '#B88B58',
  '#6E4C32',
  '#6E7A71',
  '#4B645A',
  '#3F444E',
  '#242629',
  '#C59B49',
  '#8C583A',
];

export const RightInspector: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const selectedFurnitureId = useStudioStore((s) => s.selectedFurnitureId);
  const setRightSidebarOpen = useStudioStore((s) => s.setRightSidebarOpen);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const duplicateFurniture = useStudioStore((s) => s.duplicateFurniture);
  const removeFurniture = useStudioStore((s) => s.removeFurniture);
  const snapFurnitureToWall = useStudioStore((s) => s.snapFurnitureToWall);
  const rotateFurniture90 = useStudioStore((s) => s.rotateFurniture90);
  const updateRoomMaterials = useStudioStore((s) => s.updateRoomMaterials);

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

  const selected = activeRoom.furniture.find((f) => f.id === selectedFurnitureId);
  const issue = selected ? conflicts.get(selected.id) : undefined;

  return (
    <aside className="w-[292px] shrink-0 h-full bg-[var(--rc-surface)] border-l border-[var(--rc-border)] flex flex-col select-none">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/8">
        <span className="text-xs font-semibold text-[#F1F3F5]">
          {selected ? 'Object Properties' : 'Room Surfaces'}
        </span>
        <button
          onClick={() => setRightSidebarOpen(false)}
          title="Collapse Inspector"
          className="p-1.5 text-[#8B949E] hover:text-[#F1F3F5] rounded-md hover:bg-white/5"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        {selected ? (
          <>
            {/* Identity & Quick Actions */}
            <section className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F3F5]">{selected.name}</h3>
                  <p className="text-[11px] text-[#8B949E] font-mono-num">
                    {(selected.baseSize[0] * selected.scale[0]).toFixed(2)}m ×{' '}
                    {(selected.baseSize[2] * selected.scale[2]).toFixed(2)}m ×{' '}
                    {(selected.baseSize[1] * selected.scale[1]).toFixed(2)}m
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateFurniture(
                      selected.id,
                      { locked: !selected.locked },
                      { recordHistory: true }
                    )
                  }
                  className={`p-1.5 rounded-md border ${
                    selected.locked
                      ? 'bg-[#D9A05B]/15 border-[#D9A05B]/40 text-[#D9A05B]'
                      : 'bg-[#1A1E26] border-white/8 text-[#9CA3AF] hover:text-[#F1F3F5]'
                  }`}
                  title={selected.locked ? 'Unlock Object' : 'Lock Object'}
                >
                  {selected.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {issue && (
                <div className="p-2.5 rounded-lg bg-red-500/12 border border-red-500/35 flex items-start gap-2 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    {issue.outOfBounds && <div>Extends beyond room boundary.</div>}
                    {issue.overlappingIds.length > 0 && (
                      <div>Overlaps {issue.overlappingIds.length} nearby item(s).</div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => rotateFurniture90(selected.id)}
                  disabled={selected.locked}
                  className="flex flex-col items-center gap-1 py-2 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-[11px] text-[#D1D5DB] disabled:opacity-40"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#D9A05B]" />
                  90°
                </button>
                <button
                  onClick={() => snapFurnitureToWall(selected.id)}
                  disabled={selected.locked}
                  className="flex flex-col items-center gap-1 py-2 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-[11px] text-[#D1D5DB] disabled:opacity-40"
                >
                  <Magnet className="w-3.5 h-3.5 text-[#D9A05B]" />
                  Wall
                </button>
                <button
                  onClick={() => duplicateFurniture(selected.id)}
                  className="flex flex-col items-center gap-1 py-2 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/8 text-[11px] text-[#D1D5DB]"
                >
                  <Copy className="w-3.5 h-3.5 text-[#D9A05B]" />
                  Copy
                </button>
                <button
                  onClick={() => removeFurniture(selected.id)}
                  className="flex flex-col items-center gap-1 py-2 rounded-md bg-[#1A1E26] hover:bg-red-500/15 border border-white/8 text-[11px] text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  Delete
                </button>
              </div>
            </section>

            {/* Lamp Switch if applicable */}
            {selected.lampOn !== undefined && (
              <section className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1E26] border border-white/8">
                <span className="text-xs text-[#E5E7EB] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D9A05B]" />
                  Lamp Power
                </span>
                <button
                  onClick={() =>
                    updateFurniture(selected.id, { lampOn: !selected.lampOn })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    selected.lampOn
                      ? 'bg-[#D9A05B] text-[#0C0E12]'
                      : 'bg-[#0C0E12] text-[#8B949E]'
                  }`}
                >
                  {selected.lampOn ? 'On' : 'Off'}
                </button>
              </section>
            )}

            {/* Position & Rotation */}
            <section className="space-y-3 pt-3 border-t border-white/8">
              <h4 className="text-xs font-semibold text-[#F1F3F5]">Transform</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                  <label key={axis} className="space-y-1">
                    <span className="text-[11px] text-[#8B949E] block">{axis} (m)</span>
                    <input
                      type="number"
                      step={0.05}
                      disabled={selected.locked}
                      value={Number(selected.position[idx].toFixed(2))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (Number.isNaN(val)) return;
                        const pos: [number, number, number] = [...selected.position];
                        pos[idx] = val;
                        updateFurniture(
                          selected.id,
                          { position: pos },
                          { applySnapAndClamp: idx !== 1 }
                        );
                      }}
                      className="w-full bg-[#0C0E12] border border-white/10 rounded-md px-2 py-1 text-xs font-mono-num text-[#F1F3F5]"
                    />
                  </label>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Rotation (Y)</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {Math.round(((selected.rotationY * 180) / Math.PI) % 360)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  disabled={selected.locked}
                  value={Math.round((((selected.rotationY * 180) / Math.PI) % 360 + 360) % 360)}
                  onChange={(e) =>
                    updateFurniture(selected.id, {
                      rotationY: (parseFloat(e.target.value) * Math.PI) / 180,
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Uniform & Per-Axis Scale */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Uniform Scale</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {selected.scale[0].toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  disabled={selected.locked}
                  value={selected.scale[0]}
                  onChange={(e) => {
                    const s = parseFloat(e.target.value);
                    updateFurniture(
                      selected.id,
                      { scale: [s, s, s] },
                      { applySnapAndClamp: true }
                    );
                  }}
                  className="w-full"
                />
              </div>
            </section>

            {/* Material Editor */}
            <section className="space-y-3 pt-3 border-t border-white/8">
              <h4 className="text-xs font-semibold text-[#F1F3F5]">Material Editor</h4>
              <div className="grid grid-cols-4 gap-1">
                {MATERIAL_TYPES.map((mt) => (
                  <button
                    key={mt.id}
                    onClick={() => {
                      const defs = MATERIAL_TYPE_DEFAULTS[mt.id];
                      updateFurniture(
                        selected.id,
                        {
                          material: {
                            ...selected.material,
                            type: mt.id,
                            roughness: defs.roughness,
                            metalness: defs.metalness,
                          },
                        },
                        { recordHistory: true }
                      );
                    }}
                    className={`py-1.5 text-[11px] rounded-md font-medium transition-colors ${
                      selected.material.type === mt.id
                        ? 'bg-[#D9A05B] text-[#0C0E12]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#F1F3F5]'
                    }`}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>

              {/* Swatches + Color Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9CA3AF]">Primary Finish</span>
                  <input
                    type="color"
                    value={selected.material.color}
                    onChange={(e) =>
                      updateFurniture(selected.id, {
                        material: { ...selected.material, color: e.target.value },
                      })
                    }
                    className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CURATED_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      onClick={() =>
                        updateFurniture(
                          selected.id,
                          { material: { ...selected.material, color: hex } },
                          { recordHistory: true }
                        )
                      }
                      className={`w-5 h-5 rounded-md border ${
                        selected.material.color.toLowerCase() === hex.toLowerCase()
                          ? 'border-[#D9A05B] scale-110'
                          : 'border-white/15'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Accent Color */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Secondary / Trim Color</span>
                <input
                  type="color"
                  value={selected.secondaryColor || '#C59B49'}
                  onChange={(e) =>
                    updateFurniture(selected.id, { secondaryColor: e.target.value })
                  }
                  className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Roughness</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {selected.material.roughness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.04}
                  max={1}
                  step={0.02}
                  value={selected.material.roughness}
                  onChange={(e) =>
                    updateFurniture(selected.id, {
                      material: {
                        ...selected.material,
                        roughness: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Metalness</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {selected.material.metalness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={selected.material.metalness}
                  onChange={(e) =>
                    updateFurniture(selected.id, {
                      material: {
                        ...selected.material,
                        metalness: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#8B949E] block">Material Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {MATERIAL_PRESETS.slice(0, 8).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        updateFurniture(
                          selected.id,
                          { material: { ...preset.config } },
                          { recordHistory: true }
                        )
                      }
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#1A1E26] hover:bg-[#222732] border border-white/6 text-[11px] text-[#D1D5DB] text-left"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/15"
                        style={{ backgroundColor: preset.config.color }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Room Surface Materials when no furniture is selected */
          <div className="space-y-5">
            <div className="p-3 rounded-lg bg-[#1A1E26] border border-white/8 space-y-1">
              <div className="text-xs font-medium text-[#F1F3F5]">{activeRoom.name}</div>
              <div className="text-[11px] text-[#8B949E] font-mono-num">
                {activeRoom.width.toFixed(2)}m × {activeRoom.length.toFixed(2)}m ×{' '}
                {activeRoom.height.toFixed(2)}m ·{' '}
                {(activeRoom.width * activeRoom.length).toFixed(1)} m²
              </div>
              <div className="text-[11px] text-[#8B949E] pt-1">
                Select any 3D object in the room to edit its position, scale, or PBR material.
              </div>
            </div>

            {/* Floor Material */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#F1F3F5]">Floor Material</h4>
                <input
                  type="color"
                  value={activeRoom.floorMaterial.color}
                  onChange={(e) =>
                    updateRoomMaterials(
                      {
                        floorMaterial: {
                          ...activeRoom.floorMaterial,
                          color: e.target.value,
                        },
                      },
                      false
                    )
                  }
                  className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['wood', 'marble', 'concrete', 'tiles'] as MaterialType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const defs = MATERIAL_TYPE_DEFAULTS[t];
                      updateRoomMaterials({
                        floorMaterial: {
                          ...activeRoom.floorMaterial,
                          type: t,
                          roughness: defs.roughness,
                          metalness: defs.metalness,
                        },
                      });
                    }}
                    className={`py-1.5 text-[11px] capitalize rounded-md font-medium ${
                      activeRoom.floorMaterial.type === t
                        ? 'bg-[#D9A05B] text-[#0C0E12]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#F1F3F5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Floor Roughness</span>
                  <span className="font-mono-num text-[#D9A05B]">
                    {activeRoom.floorMaterial.roughness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.02}
                  value={activeRoom.floorMaterial.roughness}
                  onChange={(e) =>
                    updateRoomMaterials(
                      {
                        floorMaterial: {
                          ...activeRoom.floorMaterial,
                          roughness: parseFloat(e.target.value),
                        },
                      },
                      false
                    )
                  }
                  className="w-full"
                />
              </div>
            </section>

            {/* Wall Material */}
            <section className="space-y-2.5 pt-3 border-t border-white/8">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#F1F3F5]">Wall Material</h4>
                <input
                  type="color"
                  value={activeRoom.wallMaterial.color}
                  onChange={(e) =>
                    updateRoomMaterials(
                      {
                        wallMaterial: {
                          ...activeRoom.wallMaterial,
                          color: e.target.value,
                        },
                      },
                      false
                    )
                  }
                  className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['paint', 'concrete', 'wood', 'tiles'] as MaterialType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const defs = MATERIAL_TYPE_DEFAULTS[t];
                      updateRoomMaterials({
                        wallMaterial: {
                          ...activeRoom.wallMaterial,
                          type: t,
                          roughness: defs.roughness,
                          metalness: defs.metalness,
                        },
                      });
                    }}
                    className={`py-1.5 text-[11px] capitalize rounded-md font-medium ${
                      activeRoom.wallMaterial.type === t
                        ? 'bg-[#D9A05B] text-[#0C0E12]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#F1F3F5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  '#EAE8E2',
                  '#D6D1C7',
                  '#6E7A71',
                  '#4F5B66',
                  '#3B3F46',
                  '#8F7E6F',
                  '#23272D',
                  '#B8ACA0',
                ].map((col) => (
                  <button
                    key={col}
                    onClick={() =>
                      updateRoomMaterials({
                        wallMaterial: { ...activeRoom.wallMaterial, color: col },
                      })
                    }
                    className={`w-6 h-6 rounded-md border ${
                      activeRoom.wallMaterial.color.toLowerCase() === col.toLowerCase()
                        ? 'border-[#D9A05B] scale-110'
                        : 'border-white/15'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </section>

            {/* Ceiling & Baseboard Trim */}
            <section className="space-y-2.5 pt-3 border-t border-white/8">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Ceiling Color</span>
                <input
                  type="color"
                  value={activeRoom.ceilingColor}
                  onChange={(e) =>
                    updateRoomMaterials({ ceilingColor: e.target.value }, false)
                  }
                  className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Baseboard Trim</span>
                <input
                  type="color"
                  value={activeRoom.trimColor}
                  onChange={(e) =>
                    updateRoomMaterials({ trimColor: e.target.value }, false)
                  }
                  className="w-7 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
};
