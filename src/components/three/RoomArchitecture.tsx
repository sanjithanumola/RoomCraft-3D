import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { RoomData, WallOpening, WallSide } from '../../types/studio';
import { getProceduralTexture } from '../../utils/proceduralTextures';

interface RoomArchitectureProps {
  room: RoomData;
  isActiveRoom: boolean;
  cutawayWalls: boolean;
  showCeiling: boolean;
  showGrid: boolean;
  selectedOpeningId: string | null;
  onSelectOpening: (id: string) => void;
  onFloorPointerDown: (e: any) => void;
  cameraAzimuth?: number;
}

const WALL_THICKNESS = 0.14;

interface WallSegment {
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeWallSegments(
  wallLength: number,
  wallHeight: number,
  openings: WallOpening[]
): WallSegment[] {
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  const segments: WallSegment[] = [];
  let cursor = -wallLength / 2;

  for (const op of sorted) {
    const opLeft = Math.max(-wallLength / 2, op.offset - op.width / 2);
    const opRight = Math.min(wallLength / 2, op.offset + op.width / 2);
    const actualW = opRight - opLeft;
    if (actualW <= 0.05) continue;

    // Solid column before opening
    if (opLeft > cursor + 0.01) {
      const segW = opLeft - cursor;
      segments.push({
        x: cursor + segW / 2,
        y: wallHeight / 2,
        w: segW,
        h: wallHeight,
      });
    }

    // Header above opening
    const opTop = Math.min(wallHeight, op.elevation + op.height);
    if (opTop < wallHeight - 0.02) {
      const headH = wallHeight - opTop;
      segments.push({
        x: opLeft + actualW / 2,
        y: opTop + headH / 2,
        w: actualW,
        h: headH,
      });
    }

    // Sill below window opening
    if (op.elevation > 0.02) {
      segments.push({
        x: opLeft + actualW / 2,
        y: op.elevation / 2,
        w: actualW,
        h: op.elevation,
      });
    }

    cursor = opRight;
  }

  // Trailing solid column
  if (cursor < wallLength / 2 - 0.01) {
    const segW = wallLength / 2 - cursor;
    segments.push({
      x: cursor + segW / 2,
      y: wallHeight / 2,
      w: segW,
      h: wallHeight,
    });
  }

  return segments;
}

const OpeningAssembly: React.FC<{
  opening: WallOpening;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ opening, isSelected, onSelect }) => {
  const frameThickness = 0.05;
  const depth = WALL_THICKNESS + 0.03;

  return (
    <group
      position={[opening.offset, opening.elevation + opening.height / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Frame perimeter */}
      <mesh position={[0, opening.height / 2 - frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[opening.width, frameThickness, depth]} />
        <meshStandardMaterial color={opening.frameColor} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[-opening.width / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, opening.height, depth]} />
        <meshStandardMaterial color={opening.frameColor} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[opening.width / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, opening.height, depth]} />
        <meshStandardMaterial color={opening.frameColor} roughness={0.45} metalness={0.25} />
      </mesh>

      {opening.type === 'window' ? (
        <>
          <mesh position={[0, -opening.height / 2 + frameThickness / 2, 0]} castShadow>
            <boxGeometry args={[opening.width, frameThickness, depth + 0.03]} />
            <meshStandardMaterial color={opening.frameColor} roughness={0.45} metalness={0.25} />
          </mesh>
          {/* Vertical mullion */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.035, opening.height - frameThickness * 2, depth * 0.7]} />
            <meshStandardMaterial color={opening.frameColor} roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Glazing pane */}
          <mesh>
            <boxGeometry args={[opening.width - frameThickness * 2, opening.height - frameThickness * 2, 0.015]} />
            <meshPhysicalMaterial
              color="#CBE2F0"
              transparent
              opacity={0.32}
              roughness={0.05}
              metalness={0.1}
              clearcoat={1}
            />
          </mesh>
        </>
      ) : (
        /* Hinged Door Leaf + Brass Lever */
        <group>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[opening.width - frameThickness * 2, opening.height - frameThickness, 0.045]} />
            <meshStandardMaterial color={opening.frameColor} roughness={0.55} metalness={0.08} />
          </mesh>
          <mesh position={[opening.width * 0.34, -0.05, 0.04]}>
            <boxGeometry args={[0.11, 0.022, 0.035]} />
            <meshStandardMaterial color="#C59B49" roughness={0.25} metalness={0.88} />
          </mesh>
          <mesh position={[opening.width * 0.34, -0.05, -0.04]}>
            <boxGeometry args={[0.11, 0.022, 0.035]} />
            <meshStandardMaterial color="#C59B49" roughness={0.25} metalness={0.88} />
          </mesh>
        </group>
      )}

      {isSelected && (
        <mesh>
          <boxGeometry args={[opening.width + 0.06, opening.height + 0.06, depth + 0.06]} />
          <meshBasicMaterial color="#D9A05B" wireframe />
        </mesh>
      )}
    </group>
  );
};

export const RoomArchitecture: React.FC<RoomArchitectureProps> = ({
  room,
  isActiveRoom,
  cutawayWalls,
  showCeiling,
  showGrid,
  selectedOpeningId,
  onSelectOpening,
  onFloorPointerDown,
}) => {
  const floorMap = useMemo(
    () =>
      getProceduralTexture(
        room.floorMaterial.type,
        room.floorMaterial.color,
        (room.floorMaterial.textureScale ?? 2) * Math.max(room.width, room.length) * 0.35
      ),
    [room.floorMaterial, room.width, room.length]
  );

  const wallMap = useMemo(
    () =>
      getProceduralTexture(
        room.wallMaterial.type,
        room.wallMaterial.color,
        room.wallMaterial.textureScale ?? 1.5
      ),
    [room.wallMaterial]
  );

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: floorMap ? '#ffffff' : room.floorMaterial.color,
        map: floorMap ?? undefined,
        roughness: room.floorMaterial.roughness,
        metalness: room.floorMaterial.metalness,
      }),
    [floorMap, room.floorMaterial]
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: wallMap ? '#ffffff' : room.wallMaterial.color,
        map: wallMap ?? undefined,
        roughness: room.wallMaterial.roughness,
        metalness: room.wallMaterial.metalness,
      }),
    [wallMap, room.wallMaterial]
  );

  const trimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: room.trimColor, roughness: 0.65, metalness: 0.02 }),
    [room.trimColor]
  );

  const walls: {
    side: WallSide;
    len: number;
    pos: [number, number, number];
    rotY: number;
    hideInCutaway: boolean;
  }[] = [
    {
      side: 'north',
      len: room.width + WALL_THICKNESS * 2,
      pos: [0, 0, -room.length / 2 - WALL_THICKNESS / 2],
      rotY: 0,
      hideInCutaway: false,
    },
    {
      side: 'south',
      len: room.width + WALL_THICKNESS * 2,
      pos: [0, 0, room.length / 2 + WALL_THICKNESS / 2],
      rotY: Math.PI,
      hideInCutaway: true,
    },
    {
      side: 'west',
      len: room.length,
      pos: [-room.width / 2 - WALL_THICKNESS / 2, 0, 0],
      rotY: Math.PI / 2,
      hideInCutaway: false,
    },
    {
      side: 'east',
      len: room.length,
      pos: [room.width / 2 + WALL_THICKNESS / 2, 0, 0],
      rotY: -Math.PI / 2,
      hideInCutaway: true,
    },
  ];

  return (
    <group position={[room.offsetX, 0, room.offsetZ]}>
      {/* Structural Floor Slab */}
      <mesh
        position={[0, -0.06, 0]}
        material={floorMaterial}
        receiveShadow
        onPointerDown={onFloorPointerDown}
      >
        <boxGeometry args={[room.width + WALL_THICKNESS * 2, 0.12, room.length + WALL_THICKNESS * 2]} />
      </mesh>

      {/* Architectural Floor Grid Overlay */}
      {showGrid && isActiveRoom && (
        <gridHelper
          args={[Math.max(room.width, room.length), Math.round(Math.max(room.width, room.length) * 2), '#D9A05B', '#4B5563']}
          position={[0, 0.004, 0]}
        />
      )}

      {/* Walls with True Door & Window Openings */}
      {walls.map((w) => {
        const wallOpenings = room.openings.filter((o) => o.wall === w.side);
        const segments = computeWallSegments(w.len, room.height, wallOpenings);
        const displayFull = !cutawayWalls || !w.hideInCutaway;
        const effectiveH = displayFull ? room.height : 0.24;

        return (
          <group key={w.side} position={w.pos} rotation={[0, w.rotY, 0]}>
            {displayFull ? (
              <>
                {segments.map((seg, idx) => (
                  <mesh
                    key={idx}
                    position={[seg.x, seg.y, 0]}
                    material={wallMaterial}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[seg.w, seg.h, WALL_THICKNESS]} />
                  </mesh>
                ))}
                {wallOpenings.map((op) => (
                  <OpeningAssembly
                    key={op.id}
                    opening={op}
                    isSelected={selectedOpeningId === op.id}
                    onSelect={() => onSelectOpening(op.id)}
                  />
                ))}
                {/* Baseboard trim */}
                <mesh position={[0, 0.05, WALL_THICKNESS / 2 + 0.006]} material={trimMaterial} receiveShadow>
                  <boxGeometry args={[w.len - 0.28, 0.1, 0.012]} />
                </mesh>
              </>
            ) : (
              /* Low architectural cutaway stub wall */
              <mesh position={[0, effectiveH / 2, 0]} material={wallMaterial} receiveShadow>
                <boxGeometry args={[w.len, effectiveH, WALL_THICKNESS]} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Optional Ceiling Plane */}
      {showCeiling && (
        <mesh position={[0, room.height + 0.04, 0]} receiveShadow>
          <boxGeometry args={[room.width + WALL_THICKNESS * 2, 0.08, room.length + WALL_THICKNESS * 2]} />
          <meshStandardMaterial color={room.ceilingColor} roughness={0.85} metalness={0} />
        </mesh>
      )}
    </group>
  );
};
