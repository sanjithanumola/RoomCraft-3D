import type { FurnitureInstance, RoomData, WallSide } from '../types/studio';

export interface FootprintRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  depth: number;
}

/**
 * Computes the axis-aligned bounding rectangle of a rotated furniture item on the XZ floor plane.
 */
export function getFurnitureFootprint(item: FurnitureInstance): FootprintRect {
  const w = item.baseSize[0] * item.scale[0];
  const d = item.baseSize[2] * item.scale[2];
  const cos = Math.abs(Math.cos(item.rotationY));
  const sin = Math.abs(Math.sin(item.rotationY));
  const effW = w * cos + d * sin;
  const effD = w * sin + d * cos;
  const [cx, , cz] = item.position;
  return {
    minX: cx - effW / 2,
    maxX: cx + effW / 2,
    minZ: cz - effD / 2,
    maxZ: cz + effD / 2,
    width: effW,
    depth: effD,
  };
}

export function clampPositionInsideRoom(
  x: number,
  z: number,
  item: FurnitureInstance,
  room: RoomData,
  margin = 0.04
): [number, number] {
  const w = item.baseSize[0] * item.scale[0];
  const d = item.baseSize[2] * item.scale[2];
  const cos = Math.abs(Math.cos(item.rotationY));
  const sin = Math.abs(Math.sin(item.rotationY));
  const halfW = (w * cos + d * sin) / 2;
  const halfD = (w * sin + d * cos) / 2;

  const limitX = Math.max(0.05, room.width / 2 - halfW - margin);
  const limitZ = Math.max(0.05, room.length / 2 - halfD - margin);

  return [
    Math.max(-limitX, Math.min(limitX, x)),
    Math.max(-limitZ, Math.min(limitZ, z)),
  ];
}

export function snapValue(val: number, step: number): number {
  if (step <= 0) return val;
  return Math.round(val / step) * step;
}

export interface ValidationIssue {
  furnitureId: string;
  outOfBounds: boolean;
  overlappingIds: string[];
}

/**
 * Detects room boundary violations and furniture-to-furniture overlaps.
 * Flat floor rugs and overhead pendants are exempt from horizontal collision against floor pieces.
 */
export function validateRoomFurniture(room: RoomData): Map<string, ValidationIssue> {
  const issues = new Map<string, ValidationIssue>();
  const halfRoomW = room.width / 2;
  const halfRoomL = room.length / 2;
  const wallTolerance = 0.015;

  const isExemptFromOverlap = (item: FurnitureInstance) =>
    item.catalogId === 'decor-area-rug' || item.position[1] > 1.3;

  const visibleItems = room.furniture.filter((f) => f.visible);

  for (const item of visibleItems) {
    const rect = getFurnitureFootprint(item);
    const outOfBounds =
      rect.minX < -halfRoomW - wallTolerance ||
      rect.maxX > halfRoomW + wallTolerance ||
      rect.minZ < -halfRoomL - wallTolerance ||
      rect.maxZ > halfRoomL + wallTolerance ||
      item.position[1] + item.baseSize[1] * item.scale[1] > room.height + 0.05;

    const overlappingIds: string[] = [];

    if (!isExemptFromOverlap(item)) {
      for (const other of visibleItems) {
        if (other.id === item.id || isExemptFromOverlap(other)) continue;
        // Skip vertical stacking check if one sits cleanly atop the other (e.g. table lamp on nightstand)
        const itemBottom = item.position[1];
        const itemTop = itemBottom + item.baseSize[1] * item.scale[1];
        const otherBottom = other.position[1];
        const otherTop = otherBottom + other.baseSize[1] * other.scale[1];
        const verticalOverlap = itemBottom < otherTop - 0.04 && itemTop > otherBottom + 0.04;
        if (!verticalOverlap) continue;

        const r2 = getFurnitureFootprint(other);
        const pad = 0.03;
        const overlapsXZ =
          rect.minX + pad < r2.maxX &&
          rect.maxX - pad > r2.minX &&
          rect.minZ + pad < r2.maxZ &&
          rect.maxZ - pad > r2.minZ;

        if (overlapsXZ) {
          overlappingIds.push(other.id);
        }
      }
    }

    if (outOfBounds || overlappingIds.length > 0) {
      issues.set(item.id, {
        furnitureId: item.id,
        outOfBounds,
        overlappingIds,
      });
    }
  }

  return issues;
}

/**
 * Computes nearest wall and returns snapped [x, z, rotationY] flush against that wall.
 */
export function computeSnapToNearestWall(
  item: FurnitureInstance,
  room: RoomData
): { x: number; z: number; rotationY: number; wall: WallSide } {
  const [x, , z] = item.position;
  const halfW = room.width / 2;
  const halfL = room.length / 2;

  const distNorth = Math.abs(-halfL - z);
  const distSouth = Math.abs(halfL - z);
  const distWest = Math.abs(-halfW - x);
  const distEast = Math.abs(halfW - x);

  const min = Math.min(distNorth, distSouth, distWest, distEast);
  const depth = (item.baseSize[2] * item.scale[2]) / 2;
  const width = (item.baseSize[0] * item.scale[0]) / 2;
  const gap = 0.02;

  if (min === distNorth) {
    return {
      wall: 'north',
      x: Math.max(-halfW + width + gap, Math.min(halfW - width - gap, x)),
      z: -halfL + depth + gap,
      rotationY: 0,
    };
  }
  if (min === distSouth) {
    return {
      wall: 'south',
      x: Math.max(-halfW + width + gap, Math.min(halfW - width - gap, x)),
      z: halfL - depth - gap,
      rotationY: Math.PI,
    };
  }
  if (min === distWest) {
    return {
      wall: 'west',
      x: -halfW + depth + gap,
      z: Math.max(-halfL + width + gap, Math.min(halfL - width - gap, z)),
      rotationY: Math.PI / 2,
    };
  }
  return {
    wall: 'east',
    x: halfW - depth - gap,
    z: Math.max(-halfL + width + gap, Math.min(halfL - width - gap, z)),
    rotationY: -Math.PI / 2,
  };
}

export function getWallDistances(item: FurnitureInstance, room: RoomData) {
  const rect = getFurnitureFootprint(item);
  const halfW = room.width / 2;
  const halfL = room.length / 2;
  return {
    west: Math.max(0, rect.minX - -halfW),
    east: Math.max(0, halfW - rect.maxX),
    north: Math.max(0, rect.minZ - -halfL),
    south: Math.max(0, halfL - rect.maxZ),
  };
}
