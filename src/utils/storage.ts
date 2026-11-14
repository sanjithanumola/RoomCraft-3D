import { ROOM_TEMPLATES } from '../data/catalog';
import type { ProjectData } from '../types/studio';

const DB_NAME = 'roomcraft_3d_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const LS_KEY = 'roomcraft_3d_projects_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
  });
}

function readLocalFallback(): ProjectData[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(projects: ProjectData[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  } catch {
    // Ignore storage quota errors in fallback
  }
}

export async function loadAllProjects(): Promise<ProjectData[]> {
  try {
    const db = await openDatabase();
    const items = await new Promise<ProjectData[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as ProjectData[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();

    if (items.length === 0) {
      // Seed initial curated sample projects on first launch so user can inspect immediately
      const seeded = [
        ROOM_TEMPLATES[0].buildProject('Nordic Master Suite'),
        ROOM_TEMPLATES[1].buildProject('Loft Living Lounge'),
      ];
      for (const proj of seeded) {
        await saveProjectToDb(proj);
      }
      return seeded.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    const local = readLocalFallback();
    if (local.length === 0) {
      const seeded = [
        ROOM_TEMPLATES[0].buildProject('Nordic Master Suite'),
        ROOM_TEMPLATES[1].buildProject('Loft Living Lounge'),
      ];
      writeLocalFallback(seeded);
      return seeded;
    }
    return local.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export async function saveProjectToDb(project: ProjectData): Promise<void> {
  const payload: ProjectData = { ...project, updatedAt: Date.now() };
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    const list = readLocalFallback();
    const idx = list.findIndex((p) => p.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.unshift(payload);
    writeLocalFallback(list);
  }
}

export async function deleteProjectFromDb(projectId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(projectId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    const list = readLocalFallback().filter((p) => p.id !== projectId);
    writeLocalFallback(list);
  }
}

export function exportProjectJson(project: ProjectData): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.roomcraft.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDimensionsSpec(project: ProjectData): void {
  const lines: string[] = [
    `ROOMCRAFT 3D — ARCHITECTURAL SPECIFICATION`,
    `Project: ${project.name}`,
    `Updated: ${new Date(project.updatedAt).toLocaleString()}`,
    `============================================================`,
    '',
  ];

  for (const room of project.rooms) {
    const area = (room.width * room.length).toFixed(2);
    const volume = (room.width * room.length * room.height).toFixed(2);
    lines.push(`ROOM: ${room.name} (${room.type})`);
    lines.push(
      `Dimensions: ${room.width.toFixed(2)}m (W) × ${room.length.toFixed(2)}m (L) × ${room.height.toFixed(2)}m (H)`
    );
    lines.push(`Floor Area: ${area} m² | Volume: ${volume} m³`);
    lines.push(
      `Floor Finish: ${room.floorMaterial.type} (${room.floorMaterial.color}) | Wall Finish: ${room.wallMaterial.type} (${room.wallMaterial.color})`
    );
    lines.push(`Openings (${room.openings.length}):`);
    for (const op of room.openings) {
      lines.push(
        `  - ${op.type.toUpperCase()} on ${op.wall} wall: ${op.width.toFixed(2)}m W × ${op.height.toFixed(2)}m H (offset ${op.offset.toFixed(2)}m)`
      );
    }
    lines.push(`Furniture & Fixtures (${room.furniture.length}):`);
    for (const f of room.furniture) {
      const w = (f.baseSize[0] * f.scale[0]).toFixed(2);
      const h = (f.baseSize[1] * f.scale[1]).toFixed(2);
      const d = (f.baseSize[2] * f.scale[2]).toFixed(2);
      const deg = Math.round((f.rotationY * 180) / Math.PI);
      lines.push(
        `  - ${f.name}: ${w}m × ${d}m × ${h}m | Pos(${f.position[0].toFixed(2)}, ${f.position[1].toFixed(2)}, ${f.position[2].toFixed(2)}) | Rot ${deg}° | ${f.material.type} (${f.material.color})`
      );
    }
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dimensions.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
