import React, { useMemo, useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { validateRoomFurniture } from '../../utils/geometryValidation';

const PX_PER_METER = 64;

export const FloorPlan2D: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const selectedFurnitureId = useStudioStore((s) => s.selectedFurnitureId);
  const showMeasurements = useStudioStore((s) => s.showMeasurements);
  const showGrid = useStudioStore((s) => s.showGrid);
  const selectFurniture = useStudioStore((s) => s.selectFurniture);
  const switchRoom = useStudioStore((s) => s.switchRoom);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const addFurniture = useStudioStore((s) => s.addFurniture);
  const setContextMenu = useStudioStore((s) => s.setContextMenu);

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    roomId: string;
    startX: number;
    startY: number;
    origX: number;
    origZ: number;
  } | null>(null);

  const activeRoom = useMemo(() => {
    if (!activeProject) return null;
    return (
      activeProject.rooms.find((r) => r.id === activeProject.activeRoomId) ??
      activeProject.rooms[0]
    );
  }, [activeProject]);

  const bounds = useMemo(() => {
    if (!activeProject) return { minX: -4, maxX: 4, minZ: -4, maxZ: 4 };
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const r of activeProject.rooms) {
      minX = Math.min(minX, r.offsetX - r.width / 2);
      maxX = Math.max(maxX, r.offsetX + r.width / 2);
      minZ = Math.min(minZ, r.offsetZ - r.length / 2);
      maxZ = Math.max(maxZ, r.offsetZ + r.length / 2);
    }
    return {
      minX: minX - 1.2,
      maxX: maxX + 1.2,
      minZ: minZ - 1.2,
      maxZ: maxZ + 1.2,
    };
  }, [activeProject]);

  if (!activeProject || !activeRoom) return null;

  const vbX = bounds.minX * PX_PER_METER;
  const vbY = bounds.minZ * PX_PER_METER;
  const vbW = (bounds.maxX - bounds.minX) * PX_PER_METER;
  const vbH = (bounds.maxZ - bounds.minZ) * PX_PER_METER;

  const clientToWorld = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, z: 0 };
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / vbW, rect.height / vbH);
    const renderedW = vbW * scale;
    const renderedH = vbH * scale;
    const offsetX = rect.left + (rect.width - renderedW) / 2;
    const offsetY = rect.top + (rect.height - renderedH) / 2;
    const svgX = vbX + (clientX - offsetX) / scale;
    const svgY = vbY + (clientY - offsetY) / scale;
    return { x: svgX / PX_PER_METER, z: svgY / PX_PER_METER };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState) return;
    const cur = clientToWorld(e.clientX, e.clientY);
    const dx = cur.x - dragState.startX;
    const dz = cur.z - dragState.startY;
    updateFurniture(
      dragState.id,
      { position: [dragState.origX + dx, 0, dragState.origZ + dz] },
      { recordHistory: false, applySnapAndClamp: true }
    );
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const catalogId = e.dataTransfer.getData('application/roomcraft-furniture');
    if (!catalogId) return;
    const world = clientToWorld(e.clientX, e.clientY);
    addFurniture(catalogId, [world.x - activeRoom.offsetX, 0, world.z - activeRoom.offsetZ]);
  };

  return (
    <div
      className="relative w-full h-full bg-[#0E1117] flex items-center justify-center overflow-hidden select-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="absolute top-3 left-4 text-xs text-[#8B949E] font-mono-num pointer-events-none">
        2D CAD Floor Plan · 1 square = 0.50m
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => {
          selectFurniture(null);
          setContextMenu({ open: false, x: 0, y: 0, furnitureId: null });
        }}
      >
        <defs>
          <pattern
            id="cadGrid"
            width={PX_PER_METER * 0.5}
            height={PX_PER_METER * 0.5}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${PX_PER_METER * 0.5} 0 L 0 0 0 ${PX_PER_METER * 0.5}`}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {showGrid && (
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="url(#cadGrid)" />
        )}

        {activeProject.rooms.map((room) => {
          const isActive = room.id === activeRoom.id;
          const conflicts = validateRoomFurniture(room);
          const rx = (room.offsetX - room.width / 2) * PX_PER_METER;
          const rz = (room.offsetZ - room.length / 2) * PX_PER_METER;
          const rw = room.width * PX_PER_METER;
          const rl = room.length * PX_PER_METER;

          return (
            <g key={room.id}>
              {/* Floor Fill */}
              <rect
                x={rx}
                y={rz}
                width={rw}
                height={rl}
                fill={room.floorMaterial.color}
                fillOpacity={isActive ? 0.16 : 0.08}
                stroke={isActive ? '#D9A05B' : '#4B5563'}
                strokeWidth={7}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive) switchRoom(room.id);
                  selectFurniture(null);
                }}
              />

              {/* Room Label */}
              <text
                x={room.offsetX * PX_PER_METER}
                y={rz + 20}
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)"
                fontSize="11"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {room.name} ({(room.width * room.length).toFixed(1)} m²)
              </text>

              {/* Outer Dimensions */}
              {showMeasurements && (
                <>
                  <line
                    x1={rx}
                    y1={rz - 18}
                    x2={rx + rw}
                    y2={rz - 18}
                    stroke="#8B949E"
                    strokeWidth="1"
                  />
                  <text
                    x={rx + rw / 2}
                    y={rz - 24}
                    textAnchor="middle"
                    fill="#D9A05B"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {room.width.toFixed(2)} m
                  </text>
                  <line
                    x1={rx - 18}
                    y1={rz}
                    x2={rx - 18}
                    y2={rz + rl}
                    stroke="#8B949E"
                    strokeWidth="1"
                  />
                  <text
                    x={rx - 24}
                    y={rz + rl / 2}
                    textAnchor="middle"
                    fill="#D9A05B"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    transform={`rotate(-90, ${rx - 24}, ${rz + rl / 2})`}
                  >
                    {room.length.toFixed(2)} m
                  </text>
                </>
              )}

              {/* Doors & Windows */}
              {room.openings.map((op) => {
                const len = op.width * PX_PER_METER;
                let cx = room.offsetX * PX_PER_METER;
                let cy = room.offsetZ * PX_PER_METER;
                let rot = 0;

                if (op.wall === 'north') {
                  cx += op.offset * PX_PER_METER;
                  cy = rz;
                  rot = 0;
                } else if (op.wall === 'south') {
                  cx -= op.offset * PX_PER_METER;
                  cy = rz + rl;
                  rot = 180;
                } else if (op.wall === 'west') {
                  cx = rx;
                  cy -= op.offset * PX_PER_METER;
                  rot = -90;
                } else {
                  cx = rx + rw;
                  cy += op.offset * PX_PER_METER;
                  rot = 90;
                }

                return (
                  <g key={op.id} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
                    <rect
                      x={-len / 2}
                      y={-5}
                      width={len}
                      height={10}
                      fill="#0E1117"
                    />
                    {op.type === 'window' ? (
                      <line
                        x1={-len / 2}
                        y1={0}
                        x2={len / 2}
                        y2={0}
                        stroke="#7CC4FA"
                        strokeWidth={3}
                      />
                    ) : (
                      <g>
                        <line
                          x1={-len / 2}
                          y1={0}
                          x2={-len / 2}
                          y2={len}
                          stroke="#D9A05B"
                          strokeWidth={2.5}
                        />
                        <path
                          d={`M ${-len / 2} ${len} A ${len} ${len} 0 0 0 ${len / 2} 0`}
                          fill="none"
                          stroke="rgba(217,160,91,0.45)"
                          strokeWidth={1.2}
                          strokeDasharray="4 3"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Furniture Footprints */}
              {room.furniture
                .filter((f) => f.visible)
                .map((item) => {
                  const fw = item.baseSize[0] * item.scale[0] * PX_PER_METER;
                  const fd = item.baseSize[2] * item.scale[2] * PX_PER_METER;
                  const fx = (room.offsetX + item.position[0]) * PX_PER_METER;
                  const fz = (room.offsetZ + item.position[2]) * PX_PER_METER;
                  const deg = (-item.rotationY * 180) / Math.PI;
                  const isSel = selectedFurnitureId === item.id;
                  const hasConflict = conflicts.has(item.id);

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${fx}, ${fz}) rotate(${deg})`}
                      style={{ cursor: item.locked ? 'not-allowed' : 'grab' }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (!isActive) switchRoom(room.id);
                        selectFurniture(item.id);
                        if (e.button === 2) {
                          setContextMenu({
                            open: true,
                            x: e.clientX,
                            y: e.clientY,
                            furnitureId: item.id,
                          });
                          return;
                        }
                        if (item.locked || e.button !== 0) return;
                        pushHistory();
                        const world = clientToWorld(e.clientX, e.clientY);
                        setDragState({
                          id: item.id,
                          roomId: room.id,
                          startX: world.x,
                          startY: world.z,
                          origX: item.position[0],
                          origZ: item.position[2],
                        });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selectFurniture(item.id);
                        setContextMenu({
                          open: true,
                          x: e.clientX,
                          y: e.clientY,
                          furnitureId: item.id,
                        });
                      }}
                    >
                      <rect
                        x={-fw / 2}
                        y={-fd / 2}
                        width={fw}
                        height={fd}
                        rx={3}
                        fill={item.material.color}
                        fillOpacity={0.78}
                        stroke={
                          hasConflict
                            ? '#EF4444'
                            : isSel
                            ? '#D9A05B'
                            : 'rgba(255,255,255,0.45)'
                        }
                        strokeWidth={isSel || hasConflict ? 2.4 : 1.2}
                      />
                      {/* Front orientation tick */}
                      <line
                        x1={0}
                        y1={fd / 2 - 4}
                        x2={0}
                        y2={fd / 2}
                        stroke="#D9A05B"
                        strokeWidth={2}
                      />
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="DM Sans, sans-serif"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                      >
                        {item.name.split(' ').slice(0, 2).join(' ')}
                      </text>
                    </g>
                  );
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
