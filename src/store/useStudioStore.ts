import { create } from 'zustand';
import {
  createCustomProject,
  createFurnitureFromCatalog,
  ROOM_TEMPLATES,
} from '../data/catalog';
import type {
  CameraAnglePreset,
  CameraMode,
  DesignTheme,
  FurnitureInstance,
  LightingConfig,
  MaterialConfig,
  ProjectData,
  RoomData,
  RoomType,
  TransformMode,
  ViewportMode,
  WallOpening,
} from '../types/studio';
import {
  clampPositionInsideRoom,
  computeSnapToNearestWall,
  snapValue,
} from '../utils/geometryValidation';
import {
  deleteProjectFromDb,
  loadAllProjects,
  saveProjectToDb,
} from '../utils/storage';

interface HistorySnapshot {
  rooms: RoomData[];
  lighting: LightingConfig;
  activeRoomId: string;
}

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  furnitureId: string | null;
}

interface StudioState {
  view: 'dashboard' | 'editor';
  projects: ProjectData[];
  projectsLoaded: boolean;
  activeProject: ProjectData | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSavedAt: number | null;

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Selection & interaction
  selectedFurnitureId: string | null;
  selectedOpeningId: string | null;
  hoveredFurnitureId: string | null;
  isDraggingFurniture: boolean;
  transformMode: TransformMode;
  viewportMode: ViewportMode;

  // Camera & visualization
  cameraMode: CameraMode;
  cameraPreset: CameraAnglePreset;
  cameraTrigger: number;
  cutawayWalls: boolean;
  showCeiling: boolean;
  showMeasurements: boolean;
  showGrid: boolean;
  gridSnap: number; // 0 = off, 0.1 = 10cm, 0.25 = 25cm
  clampToRoom: boolean;

  // UI overlays
  contextMenu: ContextMenuState;
  exportModalOpen: boolean;
  layersOpen: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  leftTab: 'furniture' | 'room' | 'lighting';

  // Screenshot capture hook registered by 3D viewport
  captureScreenshotFn: ((angle?: CameraAnglePreset) => string | null) | null;

  // Actions
  initProjects: () => Promise<void>;
  goToDashboard: () => Promise<void>;
  openProject: (projectId: string) => void;
  createNewCustomProject: (params: {
    name: string;
    roomType: RoomType;
    width: number;
    length: number;
    height: number;
  }) => Promise<void>;
  createFromTemplate: (templateId: string, customName?: string) => Promise<void>;
  importProject: (project: ProjectData) => Promise<void>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveNow: () => Promise<void>;

  // Undo/Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Room & Multi-room
  switchRoom: (roomId: string) => void;
  addConnectedRoom: (roomType: RoomType) => void;
  removeRoom: (roomId: string) => void;
  updateRoomDimensions: (patch: Partial<Pick<RoomData, 'name' | 'type' | 'width' | 'length' | 'height'>>, recordHistory?: boolean) => void;
  updateRoomMaterials: (patch: {
    floorMaterial?: MaterialConfig;
    wallMaterial?: MaterialConfig;
    ceilingColor?: string;
    trimColor?: string;
  }, recordHistory?: boolean) => void;
  addOpening: (opening: Omit<WallOpening, 'id'>) => void;
  updateOpening: (openingId: string, patch: Partial<WallOpening>, recordHistory?: boolean) => void;
  removeOpening: (openingId: string) => void;

  // Furniture
  addFurniture: (catalogId: string, position?: [number, number, number]) => string | null;
  selectFurniture: (id: string | null) => void;
  selectOpening: (id: string | null) => void;
  setHoveredFurniture: (id: string | null) => void;
  setIsDraggingFurniture: (dragging: boolean) => void;
  updateFurniture: (
    furnitureId: string,
    patch: Partial<FurnitureInstance>,
    options?: { recordHistory?: boolean; applySnapAndClamp?: boolean }
  ) => void;
  duplicateFurniture: (furnitureId: string) => void;
  removeFurniture: (furnitureId: string) => void;
  snapFurnitureToWall: (furnitureId: string) => void;
  rotateFurniture90: (furnitureId: string) => void;

  // Lighting & Theme
  updateLighting: (patch: Partial<LightingConfig>, recordHistory?: boolean) => void;
  setDesignTheme: (theme: DesignTheme) => void;

  // Editor controls
  setTransformMode: (mode: TransformMode) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  triggerCameraPreset: (preset: CameraAnglePreset) => void;
  setCutawayWalls: (val: boolean) => void;
  setShowCeiling: (val: boolean) => void;
  setShowMeasurements: (val: boolean) => void;
  setShowGrid: (val: boolean) => void;
  setGridSnap: (step: number) => void;
  setClampToRoom: (val: boolean) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  setExportModalOpen: (open: boolean) => void;
  setLayersOpen: (open: boolean) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setLeftTab: (tab: 'furniture' | 'room' | 'lighting') => void;
  registerScreenshotCapture: (fn: ((angle?: CameraAnglePreset) => string | null) | null) => void;
}

let autoSaveTimer: number | null = null;

function scheduleAutoSave(get: () => StudioState, set: (partial: Partial<StudioState>) => void) {
  set({ saveStatus: 'unsaved' });
  if (autoSaveTimer) window.clearTimeout(autoSaveTimer);
  autoSaveTimer = window.setTimeout(() => {
    void get().saveNow();
  }, 650);
}

function cloneSnapshot(proj: ProjectData): HistorySnapshot {
  return {
    rooms: JSON.parse(JSON.stringify(proj.rooms)) as RoomData[],
    lighting: { ...proj.lighting },
    activeRoomId: proj.activeRoomId,
  };
}

export const useStudioStore = create<StudioState>((set, get) => ({
  view: 'dashboard',
  projects: [],
  projectsLoaded: false,
  activeProject: null,
  saveStatus: 'saved',
  lastSavedAt: null,

  past: [],
  future: [],

  selectedFurnitureId: null,
  selectedOpeningId: null,
  hoveredFurnitureId: null,
  isDraggingFurniture: false,
  transformMode: 'drag',
  viewportMode: '3d',

  cameraMode: 'perspective',
  cameraPreset: 'isometric',
  cameraTrigger: 0,
  cutawayWalls: true,
  showCeiling: false,
  showMeasurements: true,
  showGrid: true,
  gridSnap: 0.1,
  clampToRoom: true,

  contextMenu: { open: false, x: 0, y: 0, furnitureId: null },
  exportModalOpen: false,
  layersOpen: false,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  leftTab: 'furniture',

  captureScreenshotFn: null,

  initProjects: async () => {
    const loaded = await loadAllProjects();
    set({ projects: loaded, projectsLoaded: true });
  },

  goToDashboard: async () => {
    const { activeProject, captureScreenshotFn } = get();
    if (activeProject) {
      let thumb = activeProject.thumbnailDataUrl;
      if (captureScreenshotFn) {
        const shot = captureScreenshotFn();
        if (shot) thumb = shot;
      }
      const updated = { ...activeProject, thumbnailDataUrl: thumb, updatedAt: Date.now() };
      await saveProjectToDb(updated);
      const list = get().projects.map((p) => (p.id === updated.id ? updated : p));
      set({
        projects: list.sort((a, b) => b.updatedAt - a.updatedAt),
        activeProject: null,
        view: 'dashboard',
        selectedFurnitureId: null,
        selectedOpeningId: null,
        past: [],
        future: [],
      });
    } else {
      set({ view: 'dashboard' });
    }
  },

  openProject: (projectId) => {
    const found = get().projects.find((p) => p.id === projectId);
    if (!found) return;
    const cloned = JSON.parse(JSON.stringify(found)) as ProjectData;
    set({
      activeProject: cloned,
      view: 'editor',
      selectedFurnitureId: null,
      selectedOpeningId: null,
      past: [],
      future: [],
      saveStatus: 'saved',
      lastSavedAt: cloned.updatedAt,
      cameraMode: 'perspective',
      cameraPreset: 'isometric',
      cameraTrigger: get().cameraTrigger + 1,
    });
  },

  createNewCustomProject: async (params) => {
    const proj = createCustomProject(params);
    await saveProjectToDb(proj);
    set((state) => ({
      projects: [proj, ...state.projects],
      activeProject: JSON.parse(JSON.stringify(proj)) as ProjectData,
      view: 'editor',
      selectedFurnitureId: null,
      selectedOpeningId: null,
      past: [],
      future: [],
      saveStatus: 'saved',
      lastSavedAt: proj.updatedAt,
      cameraMode: 'perspective',
      cameraPreset: 'isometric',
      cameraTrigger: state.cameraTrigger + 1,
    }));
  },

  createFromTemplate: async (templateId, customName) => {
    const tpl = ROOM_TEMPLATES.find((t) => t.id === templateId) ?? ROOM_TEMPLATES[0];
    const proj = tpl.buildProject(customName);
    await saveProjectToDb(proj);
    set((state) => ({
      projects: [proj, ...state.projects],
      activeProject: JSON.parse(JSON.stringify(proj)) as ProjectData,
      view: 'editor',
      selectedFurnitureId: null,
      selectedOpeningId: null,
      past: [],
      future: [],
      saveStatus: 'saved',
      lastSavedAt: proj.updatedAt,
      cameraMode: 'perspective',
      cameraPreset: 'isometric',
      cameraTrigger: state.cameraTrigger + 1,
    }));
  },

  importProject: async (project) => {
    const sanitized: ProjectData = {
      ...project,
      id: `proj_${Math.random().toString(36).slice(2, 10)}`,
      name: `${project.name} (Imported)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProjectToDb(sanitized);
    set((state) => ({
      projects: [sanitized, ...state.projects],
    }));
    get().openProject(sanitized.id);
  },

  renameProject: async (projectId, name) => {
    const clean = name.trim();
    if (!clean) return;
    const { activeProject, projects } = get();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const updated = { ...target, name: clean, updatedAt: Date.now() };
    await saveProjectToDb(updated);
    set({
      projects: projects.map((p) => (p.id === projectId ? updated : p)),
      activeProject:
        activeProject && activeProject.id === projectId
          ? { ...activeProject, name: clean, updatedAt: updated.updatedAt }
          : activeProject,
    });
  },

  duplicateProject: async (projectId) => {
    const target = get().projects.find((p) => p.id === projectId);
    if (!target) return;
    const copy: ProjectData = {
      ...(JSON.parse(JSON.stringify(target)) as ProjectData),
      id: `proj_${Math.random().toString(36).slice(2, 10)}`,
      name: `${target.name} Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProjectToDb(copy);
    set((state) => ({ projects: [copy, ...state.projects] }));
  },

  deleteProject: async (projectId) => {
    await deleteProjectFromDb(projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
      view: state.activeProject?.id === projectId ? 'dashboard' : state.view,
    }));
  },

  saveNow: async () => {
    const { activeProject, captureScreenshotFn } = get();
    if (!activeProject) return;
    set({ saveStatus: 'saving' });
    let thumb = activeProject.thumbnailDataUrl;
    if (captureScreenshotFn) {
      const shot = captureScreenshotFn();
      if (shot) thumb = shot;
    }
    const updated: ProjectData = {
      ...activeProject,
      thumbnailDataUrl: thumb,
      updatedAt: Date.now(),
    };
    await saveProjectToDb(updated);
    set((state) => ({
      activeProject: updated,
      projects: state.projects
        .map((p) => (p.id === updated.id ? updated : p))
        .sort((a, b) => b.updatedAt - a.updatedAt),
      saveStatus: 'saved',
      lastSavedAt: updated.updatedAt,
    }));
  },

  pushHistory: () => {
    const { activeProject, past } = get();
    if (!activeProject) return;
    const snap = cloneSnapshot(activeProject);
    const nextPast = [...past.slice(-49), snap];
    set({ past: nextPast, future: [] });
  },

  undo: () => {
    const { activeProject, past, future } = get();
    if (!activeProject || past.length === 0) return;
    const previous = past[past.length - 1];
    const currentSnap = cloneSnapshot(activeProject);
    const updated: ProjectData = {
      ...activeProject,
      rooms: previous.rooms,
      lighting: previous.lighting,
      activeRoomId: previous.activeRoomId,
      updatedAt: Date.now(),
    };
    set({
      activeProject: updated,
      past: past.slice(0, -1),
      future: [currentSnap, ...future.slice(0, 49)],
      selectedFurnitureId: null,
      selectedOpeningId: null,
    });
    scheduleAutoSave(get, set);
  },

  redo: () => {
    const { activeProject, past, future } = get();
    if (!activeProject || future.length === 0) return;
    const next = future[0];
    const currentSnap = cloneSnapshot(activeProject);
    const updated: ProjectData = {
      ...activeProject,
      rooms: next.rooms,
      lighting: next.lighting,
      activeRoomId: next.activeRoomId,
      updatedAt: Date.now(),
    };
    set({
      activeProject: updated,
      past: [...past, currentSnap],
      future: future.slice(1),
      selectedFurnitureId: null,
      selectedOpeningId: null,
    });
    scheduleAutoSave(get, set);
  },

  switchRoom: (roomId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    set({
      activeProject: { ...activeProject, activeRoomId: roomId },
      selectedFurnitureId: null,
      selectedOpeningId: null,
      cameraTrigger: get().cameraTrigger + 1,
    });
  },

  addConnectedRoom: (roomType) => {
    const { activeProject } = get();
    if (!activeProject) return;
    get().pushHistory();
    const maxRight = activeProject.rooms.reduce(
      (acc, r) => Math.max(acc, r.offsetX + r.width / 2),
      0
    );
    const newW = roomType === 'office' ? 4.2 : 5.0;
    const newL = 4.6;
    const newRoom: RoomData = {
      id: `room_${Math.random().toString(36).slice(2, 10)}`,
      name: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} ${activeProject.rooms.length + 1}`,
      type: roomType,
      width: newW,
      length: newL,
      height: activeProject.rooms[0]?.height ?? 2.9,
      offsetX: maxRight + newW / 2 + 0.14,
      offsetZ: 0,
      floorMaterial: { ...activeProject.rooms[0].floorMaterial },
      wallMaterial: { ...activeProject.rooms[0].wallMaterial },
      ceilingColor: activeProject.rooms[0].ceilingColor,
      trimColor: activeProject.rooms[0].trimColor,
      openings: [
        {
          id: `op_${Math.random().toString(36).slice(2, 9)}`,
          type: 'door',
          wall: 'west',
          offset: 0,
          width: 0.95,
          height: 2.15,
          elevation: 0,
          frameColor: '#5D3E28',
        },
      ],
      furniture: [],
    };
    set({
      activeProject: {
        ...activeProject,
        rooms: [...activeProject.rooms, newRoom],
        activeRoomId: newRoom.id,
        updatedAt: Date.now(),
      },
      selectedFurnitureId: null,
      selectedOpeningId: null,
      cameraTrigger: get().cameraTrigger + 1,
    });
    scheduleAutoSave(get, set);
  },

  removeRoom: (roomId) => {
    const { activeProject } = get();
    if (!activeProject || activeProject.rooms.length <= 1) return;
    get().pushHistory();
    const remaining = activeProject.rooms.filter((r) => r.id !== roomId);
    set({
      activeProject: {
        ...activeProject,
        rooms: remaining,
        activeRoomId:
          activeProject.activeRoomId === roomId ? remaining[0].id : activeProject.activeRoomId,
        updatedAt: Date.now(),
      },
      selectedFurnitureId: null,
      selectedOpeningId: null,
    });
    scheduleAutoSave(get, set);
  },

  updateRoomDimensions: (patch, recordHistory = true) => {
    const { activeProject } = get();
    if (!activeProject) return;
    if (recordHistory) get().pushHistory();
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId ? { ...r, ...patch } : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
    });
    scheduleAutoSave(get, set);
  },

  updateRoomMaterials: (patch, recordHistory = true) => {
    const { activeProject } = get();
    if (!activeProject) return;
    if (recordHistory) get().pushHistory();
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId
        ? {
            ...r,
            floorMaterial: patch.floorMaterial ?? r.floorMaterial,
            wallMaterial: patch.wallMaterial ?? r.wallMaterial,
            ceilingColor: patch.ceilingColor ?? r.ceilingColor,
            trimColor: patch.trimColor ?? r.trimColor,
          }
        : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
    });
    scheduleAutoSave(get, set);
  },

  addOpening: (opening) => {
    const { activeProject } = get();
    if (!activeProject) return;
    get().pushHistory();
    const created: WallOpening = {
      ...opening,
      id: `op_${Math.random().toString(36).slice(2, 9)}`,
    };
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId
        ? { ...r, openings: [...r.openings, created] }
        : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
      selectedOpeningId: created.id,
      selectedFurnitureId: null,
    });
    scheduleAutoSave(get, set);
  },

  updateOpening: (openingId, patch, recordHistory = true) => {
    const { activeProject } = get();
    if (!activeProject) return;
    if (recordHistory) get().pushHistory();
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId
        ? {
            ...r,
            openings: r.openings.map((op) =>
              op.id === openingId ? { ...op, ...patch } : op
            ),
          }
        : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
    });
    scheduleAutoSave(get, set);
  },

  removeOpening: (openingId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    get().pushHistory();
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId
        ? { ...r, openings: r.openings.filter((op) => op.id !== openingId) }
        : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
      selectedOpeningId:
        get().selectedOpeningId === openingId ? null : get().selectedOpeningId,
    });
    scheduleAutoSave(get, set);
  },

  addFurniture: (catalogId, position) => {
    const { activeProject, gridSnap, clampToRoom } = get();
    if (!activeProject) return null;
    const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
    if (!room) return null;

    get().pushHistory();
    const item = createFurnitureFromCatalog(catalogId, position ?? [0, 0, 0], 0);
    if (catalogId === 'lamp-pendant') {
      item.position[1] = Math.max(1.8, room.height - 0.85);
    }

    let [nx, ny, nz] = item.position;
    if (gridSnap > 0) {
      nx = snapValue(nx, gridSnap);
      nz = snapValue(nz, gridSnap);
    }
    if (clampToRoom) {
      [nx, nz] = clampPositionInsideRoom(nx, nz, item, room);
    }
    item.position = [nx, ny, nz];

    const rooms = activeProject.rooms.map((r) =>
      r.id === room.id ? { ...r, furniture: [...r.furniture, item] } : r
    );

    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
      selectedFurnitureId: item.id,
      selectedOpeningId: null,
      rightSidebarOpen: true,
    });
    scheduleAutoSave(get, set);
    return item.id;
  },

  selectFurniture: (id) =>
    set({
      selectedFurnitureId: id,
      selectedOpeningId: id ? null : get().selectedOpeningId,
      contextMenu: { open: false, x: 0, y: 0, furnitureId: null },
    }),

  selectOpening: (id) =>
    set({
      selectedOpeningId: id,
      selectedFurnitureId: id ? null : get().selectedFurnitureId,
      contextMenu: { open: false, x: 0, y: 0, furnitureId: null },
    }),

  setHoveredFurniture: (id) => set({ hoveredFurnitureId: id }),

  setIsDraggingFurniture: (dragging) => set({ isDraggingFurniture: dragging }),

  updateFurniture: (furnitureId, patch, options) => {
    const { activeProject, gridSnap, clampToRoom } = get();
    if (!activeProject) return;
    const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
    if (!room) return;

    if (options?.recordHistory) {
      get().pushHistory();
    }

    const rooms = activeProject.rooms.map((r) => {
      if (r.id !== room.id) return r;
      return {
        ...r,
        furniture: r.furniture.map((f) => {
          if (f.id !== furnitureId) return f;
          const next: FurnitureInstance = { ...f, ...patch };
          if (options?.applySnapAndClamp && patch.position) {
            let [px, py, pz] = patch.position;
            if (gridSnap > 0) {
              px = snapValue(px, gridSnap);
              pz = snapValue(pz, gridSnap);
            }
            if (clampToRoom) {
              [px, pz] = clampPositionInsideRoom(px, pz, next, room);
            }
            next.position = [px, Math.max(0, Math.min(room.height - 0.1, py)), pz];
          }
          return next;
        }),
      };
    });

    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
    });
    scheduleAutoSave(get, set);
  },

  duplicateFurniture: (furnitureId) => {
    const { activeProject, clampToRoom } = get();
    if (!activeProject) return;
    const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
    const source = room?.furniture.find((f) => f.id === furnitureId);
    if (!room || !source) return;

    get().pushHistory();
    const copy: FurnitureInstance = {
      ...(JSON.parse(JSON.stringify(source)) as FurnitureInstance),
      id: `furn_${Math.random().toString(36).slice(2, 10)}`,
      name: `${source.name} Copy`,
      locked: false,
      position: [source.position[0] + 0.45, source.position[1], source.position[2] + 0.45],
    };
    if (clampToRoom) {
      const [cx, cz] = clampPositionInsideRoom(copy.position[0], copy.position[2], copy, room);
      copy.position = [cx, copy.position[1], cz];
    }

    const rooms = activeProject.rooms.map((r) =>
      r.id === room.id ? { ...r, furniture: [...r.furniture, copy] } : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
      selectedFurnitureId: copy.id,
      contextMenu: { open: false, x: 0, y: 0, furnitureId: null },
    });
    scheduleAutoSave(get, set);
  },

  removeFurniture: (furnitureId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    get().pushHistory();
    const rooms = activeProject.rooms.map((r) =>
      r.id === activeProject.activeRoomId
        ? { ...r, furniture: r.furniture.filter((f) => f.id !== furnitureId) }
        : r
    );
    set({
      activeProject: { ...activeProject, rooms, updatedAt: Date.now() },
      selectedFurnitureId:
        get().selectedFurnitureId === furnitureId ? null : get().selectedFurnitureId,
      contextMenu: { open: false, x: 0, y: 0, furnitureId: null },
    });
    scheduleAutoSave(get, set);
  },

  snapFurnitureToWall: (furnitureId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
    const item = room?.furniture.find((f) => f.id === furnitureId);
    if (!room || !item || item.locked) return;

    get().pushHistory();
    const snapped = computeSnapToNearestWall(item, room);
    get().updateFurniture(
      furnitureId,
      {
        position: [snapped.x, item.position[1], snapped.z],
        rotationY: snapped.rotationY,
      },
      { recordHistory: false }
    );
  },

  rotateFurniture90: (furnitureId) => {
    const { activeProject } = get();
    if (!activeProject) return;
    const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
    const item = room?.furniture.find((f) => f.id === furnitureId);
    if (!room || !item || item.locked) return;
    get().updateFurniture(
      furnitureId,
      { rotationY: (item.rotationY + Math.PI / 2) % (Math.PI * 2) },
      { recordHistory: true, applySnapAndClamp: true }
    );
  },

  updateLighting: (patch, recordHistory = false) => {
    const { activeProject } = get();
    if (!activeProject) return;
    if (recordHistory) get().pushHistory();
    set({
      activeProject: {
        ...activeProject,
        lighting: { ...activeProject.lighting, ...patch },
        updatedAt: Date.now(),
      },
    });
    scheduleAutoSave(get, set);
  },

  setDesignTheme: (theme) => {
    const { activeProject } = get();
    if (!activeProject) return;
    set({
      activeProject: { ...activeProject, theme, updatedAt: Date.now() },
    });
    scheduleAutoSave(get, set);
  },

  setTransformMode: (mode) => set({ transformMode: mode }),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  setCameraMode: (mode) =>
    set((s) => ({ cameraMode: mode, cameraTrigger: s.cameraTrigger + 1 })),
  triggerCameraPreset: (preset) =>
    set((s) => ({
      cameraPreset: preset,
      cameraMode: preset === 'top' ? 'orthographic' : 'perspective',
      cameraTrigger: s.cameraTrigger + 1,
    })),
  setCutawayWalls: (val) => set({ cutawayWalls: val }),
  setShowCeiling: (val) => set({ showCeiling: val }),
  setShowMeasurements: (val) => set({ showMeasurements: val }),
  setShowGrid: (val) => set({ showGrid: val }),
  setGridSnap: (step) => set({ gridSnap: step }),
  setClampToRoom: (val) => set({ clampToRoom: val }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
  setLayersOpen: (open) => set({ layersOpen: open }),
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setLeftTab: (tab) => set({ leftTab: tab }),
  registerScreenshotCapture: (fn) => set({ captureScreenshotFn: fn }),
}));
