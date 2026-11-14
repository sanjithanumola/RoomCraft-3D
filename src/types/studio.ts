export type MaterialType =
  | 'wood'
  | 'marble'
  | 'concrete'
  | 'glass'
  | 'metal'
  | 'fabric'
  | 'tiles'
  | 'paint';

export interface MaterialConfig {
  type: MaterialType;
  color: string;
  roughness: number;
  metalness: number;
  textureScale?: number;
}

export type FurnitureCategory =
  | 'sofas'
  | 'beds'
  | 'chairs'
  | 'tables'
  | 'wardrobes'
  | 'cabinets'
  | 'desks'
  | 'lamps'
  | 'plants'
  | 'decorations'
  | 'kitchen';

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  defaultSize: [number, number, number]; // [width, height, depth] in meters
  defaultMaterial: MaterialConfig;
  secondaryColor?: string;
  supportsLampLight?: boolean;
  description: string;
}

export interface FurnitureInstance {
  id: string;
  catalogId: string;
  name: string;
  category: FurnitureCategory;
  position: [number, number, number]; // [x, y, z] relative to room center
  rotationY: number; // radians
  scale: [number, number, number];
  baseSize: [number, number, number]; // [w, h, d] in meters
  material: MaterialConfig;
  secondaryColor?: string;
  locked: boolean;
  visible: boolean;
  lampOn?: boolean;
}

export type WallSide = 'north' | 'south' | 'east' | 'west';

export interface WallOpening {
  id: string;
  type: 'door' | 'window';
  wall: WallSide;
  offset: number; // offset from wall center along wall axis (meters)
  width: number;
  height: number;
  elevation: number; // bottom height from floor (0 for door, ~0.9 for window)
  frameColor: string;
}

export type RoomType = 'bedroom' | 'living' | 'kitchen' | 'office' | 'custom';

export interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  width: number; // X axis (meters)
  length: number; // Z axis (meters)
  height: number; // Y axis (meters)
  offsetX: number; // Multi-room world X offset
  offsetZ: number; // Multi-room world Z offset
  floorMaterial: MaterialConfig;
  wallMaterial: MaterialConfig;
  ceilingColor: string;
  trimColor: string;
  openings: WallOpening[];
  furniture: FurnitureInstance[];
}

export interface LightingConfig {
  mode: 'day' | 'night';
  sunIntensity: number;
  sunAzimuth: number; // degrees 0-360
  sunElevation: number; // degrees 10-85
  ambientIntensity: number;
  ceilingLightIntensity: number;
  ceilingLightColor: string;
  shadowsEnabled: boolean;
  lampGlowEnabled: boolean;
}

export type DesignTheme = 'obsidian' | 'graphite' | 'studio-light';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  theme: DesignTheme;
  activeRoomId: string;
  rooms: RoomData[];
  lighting: LightingConfig;
  createdAt: number;
  updatedAt: number;
  thumbnailDataUrl?: string;
}

export type CameraMode = 'perspective' | 'orthographic' | 'walkthrough';

export type CameraAnglePreset =
  | 'isometric'
  | 'front'
  | 'top'
  | 'corner'
  | 'eye-level';

export type TransformMode = 'drag' | 'translate' | 'rotate' | 'scale';

export type ViewportMode = '3d' | '2d' | 'split';

export interface RoomTemplate {
  id: string;
  name: string;
  subtitle: string;
  roomType: RoomType;
  dimensionsLabel: string;
  thumbnailUrl?: string;
  buildProject: (customName?: string) => ProjectData;
}
