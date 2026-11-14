import type {
  FurnitureCatalogItem,
  FurnitureCategory,
  FurnitureInstance,
  LightingConfig,
  MaterialConfig,
  MaterialType,
  ProjectData,
  RoomData,
  RoomTemplate,
} from '../types/studio';

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  sofas: 'Sofas',
  beds: 'Beds',
  chairs: 'Chairs',
  tables: 'Tables',
  wardrobes: 'Wardrobes',
  cabinets: 'Cabinets',
  desks: 'Desks',
  lamps: 'Lamps',
  plants: 'Plants',
  decorations: 'Decor',
  kitchen: 'Kitchen',
};

export interface MaterialPreset {
  id: string;
  name: string;
  config: MaterialConfig;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'oak-wood',
    name: 'Nordic Oak',
    config: { type: 'wood', color: '#B88B58', roughness: 0.58, metalness: 0.04, textureScale: 2 },
  },
  {
    id: 'walnut-wood',
    name: 'Dark Walnut',
    config: { type: 'wood', color: '#5D3E28', roughness: 0.48, metalness: 0.05, textureScale: 2 },
  },
  {
    id: 'carrara-marble',
    name: 'Carrara Marble',
    config: { type: 'marble', color: '#ECEAE4', roughness: 0.22, metalness: 0.05, textureScale: 1.5 },
  },
  {
    id: 'nero-marble',
    name: 'Nero Marquina',
    config: { type: 'marble', color: '#242629', roughness: 0.2, metalness: 0.08, textureScale: 1.5 },
  },
  {
    id: 'arch-concrete',
    name: 'Honed Concrete',
    config: { type: 'concrete', color: '#7D8288', roughness: 0.84, metalness: 0.02, textureScale: 2 },
  },
  {
    id: 'frosted-glass',
    name: 'Architectural Glass',
    config: { type: 'glass', color: '#DCEAF2', roughness: 0.08, metalness: 0.1, textureScale: 1 },
  },
  {
    id: 'brushed-brass',
    name: 'Brushed Brass',
    config: { type: 'metal', color: '#C59B49', roughness: 0.28, metalness: 0.88, textureScale: 1 },
  },
  {
    id: 'matte-steel',
    name: 'Blackened Steel',
    config: { type: 'metal', color: '#2E3238', roughness: 0.42, metalness: 0.82, textureScale: 1 },
  },
  {
    id: 'boucle-fabric',
    name: 'Oat Bouclé',
    config: { type: 'fabric', color: '#D8D0C5', roughness: 0.92, metalness: 0.0, textureScale: 3 },
  },
  {
    id: 'charcoal-fabric',
    name: 'Charcoal Linen',
    config: { type: 'fabric', color: '#393E46', roughness: 0.9, metalness: 0.0, textureScale: 3 },
  },
  {
    id: 'limestone-tiles',
    name: 'Limestone Tile',
    config: { type: 'tiles', color: '#CFC9BD', roughness: 0.55, metalness: 0.02, textureScale: 3 },
  },
  {
    id: 'sage-paint',
    name: 'Sage Matte Plaster',
    config: { type: 'paint', color: '#6E7A71', roughness: 0.88, metalness: 0.0, textureScale: 1 },
  },
];

export const MATERIAL_TYPE_DEFAULTS: Record<MaterialType, { roughness: number; metalness: number }> = {
  wood: { roughness: 0.55, metalness: 0.04 },
  marble: { roughness: 0.22, metalness: 0.06 },
  concrete: { roughness: 0.85, metalness: 0.02 },
  glass: { roughness: 0.08, metalness: 0.1 },
  metal: { roughness: 0.3, metalness: 0.88 },
  fabric: { roughness: 0.92, metalness: 0.0 },
  tiles: { roughness: 0.52, metalness: 0.03 },
  paint: { roughness: 0.86, metalness: 0.0 },
};

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Sofas
  {
    id: 'sofa-sectional',
    name: 'L-Shape Sectional Sofa',
    category: 'sofas',
    defaultSize: [2.7, 0.82, 1.75],
    defaultMaterial: { type: 'fabric', color: '#3F444E', roughness: 0.9, metalness: 0 },
    secondaryColor: '#C9A77C',
    description: 'Deep modular corner sofa with chaise lounge and throw cushions.',
  },
  {
    id: 'sofa-three-seater',
    name: 'Nordic 3-Seat Sofa',
    category: 'sofas',
    defaultSize: [2.2, 0.82, 0.95],
    defaultMaterial: { type: 'fabric', color: '#D2C8BA', roughness: 0.9, metalness: 0 },
    secondaryColor: '#7B563A',
    description: 'Clean-lined upholstered sofa on tapered solid oak legs.',
  },
  {
    id: 'sofa-loveseat',
    name: 'Velvet Loveseat',
    category: 'sofas',
    defaultSize: [1.55, 0.8, 0.88],
    defaultMaterial: { type: 'fabric', color: '#4B645A', roughness: 0.86, metalness: 0.02 },
    secondaryColor: '#C59B49',
    description: 'Compact channel-tufted two-seater with brass plinth legs.',
  },

  // Beds
  {
    id: 'bed-platform-king',
    name: 'Linen Platform Bed',
    category: 'beds',
    defaultSize: [2.05, 1.08, 2.25],
    defaultMaterial: { type: 'fabric', color: '#CFC7BA', roughness: 0.9, metalness: 0 },
    secondaryColor: '#9A6F46',
    description: 'King platform bed with upholstered headboard, duvet, and oak base.',
  },
  {
    id: 'bed-canopy-queen',
    name: 'Architectural Canopy Bed',
    category: 'beds',
    defaultSize: [1.75, 2.05, 2.15],
    defaultMaterial: { type: 'metal', color: '#26292E', roughness: 0.45, metalness: 0.8 },
    secondaryColor: '#E8E3DA',
    description: 'Matte steel four-poster frame with layered linen bedding.',
  },

  // Chairs
  {
    id: 'chair-lounge',
    name: 'Sculpted Lounge Chair',
    category: 'chairs',
    defaultSize: [0.78, 0.78, 0.82],
    defaultMaterial: { type: 'fabric', color: '#8C583A', roughness: 0.65, metalness: 0.05 },
    secondaryColor: '#4D3322',
    description: 'Mid-century walnut shell armchair with stitched leather cushions.',
  },
  {
    id: 'chair-dining',
    name: 'Wishbone Dining Chair',
    category: 'chairs',
    defaultSize: [0.54, 0.78, 0.52],
    defaultMaterial: { type: 'wood', color: '#AD7E4E', roughness: 0.52, metalness: 0.04 },
    secondaryColor: '#DDD4C6',
    description: 'Curved timber frame chair with woven cord seat.',
  },
  {
    id: 'chair-office',
    name: 'Executive Task Chair',
    category: 'chairs',
    defaultSize: [0.64, 1.05, 0.64],
    defaultMaterial: { type: 'fabric', color: '#272A30', roughness: 0.55, metalness: 0.1 },
    secondaryColor: '#A8ADB5',
    description: 'Ergonomic ribbed high-back chair on five-star polished base.',
  },
  {
    id: 'chair-barstool',
    name: 'Counter Bar Stool',
    category: 'chairs',
    defaultSize: [0.44, 0.78, 0.44],
    defaultMaterial: { type: 'wood', color: '#5D3E28', roughness: 0.48, metalness: 0.05 },
    secondaryColor: '#D6CCBE',
    description: 'Curved walnut counter stool with upholstered seat pad.',
  },

  // Tables
  {
    id: 'table-coffee-marble',
    name: 'Travertine Coffee Table',
    category: 'tables',
    defaultSize: [1.3, 0.38, 0.75],
    defaultMaterial: { type: 'marble', color: '#E2DDD2', roughness: 0.3, metalness: 0.03 },
    secondaryColor: '#3A3D42',
    description: 'Low architectural slab coffee table on twin stone plinths.',
  },
  {
    id: 'table-dining-oak',
    name: 'Solid Oak Dining Table',
    category: 'tables',
    defaultSize: [2.1, 0.76, 1.0],
    defaultMaterial: { type: 'wood', color: '#A57548', roughness: 0.5, metalness: 0.04 },
    secondaryColor: '#2B2E33',
    description: 'Six-seat beveled plank dining table with architectural legs.',
  },
  {
    id: 'table-round-bistro',
    name: 'Round Tulip Bistro Table',
    category: 'tables',
    defaultSize: [1.05, 0.75, 1.05],
    defaultMaterial: { type: 'marble', color: '#EFECE6', roughness: 0.2, metalness: 0.05 },
    secondaryColor: '#2A2D32',
    description: 'Circular beveled marble top on sculpted pedestal column.',
  },
  {
    id: 'table-nightstand',
    name: 'Floating Nightstand',
    category: 'tables',
    defaultSize: [0.55, 0.52, 0.44],
    defaultMaterial: { type: 'wood', color: '#B48452', roughness: 0.52, metalness: 0.04 },
    secondaryColor: '#C59B49',
    description: 'Two-drawer bedside table with recessed brass pulls.',
  },

  // Wardrobes
  {
    id: 'wardrobe-double',
    name: 'Fluted Double Wardrobe',
    category: 'wardrobes',
    defaultSize: [1.6, 2.2, 0.62],
    defaultMaterial: { type: 'wood', color: '#8C623E', roughness: 0.55, metalness: 0.05 },
    secondaryColor: '#C59B49',
    description: 'Tall floor-to-ceiling closet with double doors and brass hardware.',
  },
  {
    id: 'wardrobe-glass',
    name: 'Glass Display Armoire',
    category: 'wardrobes',
    defaultSize: [1.35, 2.15, 0.56],
    defaultMaterial: { type: 'metal', color: '#272A30', roughness: 0.38, metalness: 0.82 },
    secondaryColor: '#B8C9D4',
    description: 'Blackened aluminum frame wardrobe with smoked glass doors.',
  },

  // Cabinets
  {
    id: 'cabinet-media-console',
    name: 'Walnut Media Console',
    category: 'cabinets',
    defaultSize: [1.95, 0.56, 0.45],
    defaultMaterial: { type: 'wood', color: '#61412B', roughness: 0.48, metalness: 0.05 },
    secondaryColor: '#1E2126',
    description: 'Low credenza with slatted doors and brushed steel base.',
  },
  {
    id: 'cabinet-bookcase',
    name: 'Architectural Bookcase',
    category: 'cabinets',
    defaultSize: [1.5, 2.1, 0.38],
    defaultMaterial: { type: 'wood', color: '#583A26', roughness: 0.52, metalness: 0.04 },
    secondaryColor: '#D6D0C4',
    description: 'Five-tier open shelving unit styled with hardcover volumes.',
  },
  {
    id: 'cabinet-dresser',
    name: 'Six-Drawer Dresser',
    category: 'cabinets',
    defaultSize: [1.45, 0.84, 0.5],
    defaultMaterial: { type: 'paint', color: '#D8D4CC', roughness: 0.72, metalness: 0.02 },
    secondaryColor: '#9B7048',
    description: 'Wide chest of drawers with warm timber top and brass knobs.',
  },

  // Desks
  {
    id: 'desk-architect',
    name: 'Executive Studio Desk',
    category: 'desks',
    defaultSize: [1.75, 0.76, 0.82],
    defaultMaterial: { type: 'wood', color: '#543825', roughness: 0.46, metalness: 0.06 },
    secondaryColor: '#25282E',
    description: 'Wide walnut work desk with drawer pedestal and cable tray.',
  },
  {
    id: 'desk-minimal',
    name: 'Minimalist Drafting Desk',
    category: 'desks',
    defaultSize: [1.4, 0.75, 0.7],
    defaultMaterial: { type: 'wood', color: '#C29666', roughness: 0.55, metalness: 0.04 },
    secondaryColor: '#2A2E35',
    description: 'Slim oak desktop supported by powder-coated steel trestle legs.',
  },

  // Lamps
  {
    id: 'lamp-arc-floor',
    name: 'Brass Arc Floor Lamp',
    category: 'lamps',
    defaultSize: [0.65, 1.95, 0.95],
    defaultMaterial: { type: 'metal', color: '#C59B49', roughness: 0.25, metalness: 0.88 },
    secondaryColor: '#EFE9DC',
    supportsLampLight: true,
    description: 'Curved brass floor lamp with marble counterweight base.',
  },
  {
    id: 'lamp-table',
    name: 'Ceramic Table Lamp',
    category: 'lamps',
    defaultSize: [0.34, 0.52, 0.34],
    defaultMaterial: { type: 'paint', color: '#DED7CB', roughness: 0.65, metalness: 0.04 },
    secondaryColor: '#C59B49',
    supportsLampLight: true,
    description: 'Lathe-turned stoneware base with warm linen drum shade.',
  },
  {
    id: 'lamp-pendant',
    name: 'Linear Pendant Light',
    category: 'lamps',
    defaultSize: [1.2, 0.75, 0.16],
    defaultMaterial: { type: 'metal', color: '#C59B49', roughness: 0.26, metalness: 0.9 },
    secondaryColor: '#FFF5E0',
    supportsLampLight: true,
    description: 'Suspended architectural brass light bar with diffused LED tube.',
  },

  // Plants
  {
    id: 'plant-fiddle-fig',
    name: 'Fiddle-Leaf Fig Tree',
    category: 'plants',
    defaultSize: [0.75, 1.65, 0.75],
    defaultMaterial: { type: 'paint', color: '#426143', roughness: 0.62, metalness: 0.02 },
    secondaryColor: '#C7BFB2',
    description: 'Tall indoor tree in hand-thrown matte ceramic planter.',
  },
  {
    id: 'plant-olive-pot',
    name: 'Potted Olive Accent',
    category: 'plants',
    defaultSize: [0.46, 0.92, 0.46],
    defaultMaterial: { type: 'paint', color: '#5D7057', roughness: 0.68, metalness: 0.02 },
    secondaryColor: '#B57D58',
    description: 'Terracotta pot with branched Mediterranean olive foliage.',
  },

  // Decorations
  {
    id: 'decor-area-rug',
    name: 'Woven Wool Area Rug',
    category: 'decorations',
    defaultSize: [2.8, 0.03, 2.0],
    defaultMaterial: { type: 'fabric', color: '#CFC7BA', roughness: 0.95, metalness: 0 },
    secondaryColor: '#7B7468',
    description: 'Textured flat-weave wool rug with subtle border weave.',
  },
  {
    id: 'decor-wall-mirror',
    name: 'Arched Floor Mirror',
    category: 'decorations',
    defaultSize: [0.82, 1.88, 0.08],
    defaultMaterial: { type: 'metal', color: '#2A2D33', roughness: 0.35, metalness: 0.85 },
    secondaryColor: '#D6E4EC',
    description: 'Full-length leaning arched mirror in slim anodized frame.',
  },
  {
    id: 'decor-sculpture-pedestal',
    name: 'Travertine Vase & Plinth',
    category: 'decorations',
    defaultSize: [0.42, 1.15, 0.42],
    defaultMaterial: { type: 'marble', color: '#DCD5C8', roughness: 0.38, metalness: 0.04 },
    secondaryColor: '#9C6A4A',
    description: 'Gallery display column topped with sculpted ceramic amphora.',
  },

  // Kitchen
  {
    id: 'kitchen-island',
    name: 'Marble Kitchen Island',
    category: 'kitchen',
    defaultSize: [2.4, 0.92, 1.05],
    defaultMaterial: { type: 'marble', color: '#EAE6DE', roughness: 0.24, metalness: 0.05 },
    secondaryColor: '#5D3E28',
    description: 'Waterfall Carrara island with walnut cabinetry, sink & brass faucet.',
  },
  {
    id: 'kitchen-counter-run',
    name: 'Kitchen Base & Stove Run',
    category: 'kitchen',
    defaultSize: [2.6, 0.92, 0.68],
    defaultMaterial: { type: 'wood', color: '#583B27', roughness: 0.5, metalness: 0.04 },
    secondaryColor: '#EAE6DE',
    description: 'Modular cabinetry run with induction cooktop, oven & marble top.',
  },
  {
    id: 'kitchen-fridge',
    name: 'Integrated French Fridge',
    category: 'kitchen',
    defaultSize: [0.92, 2.02, 0.74],
    defaultMaterial: { type: 'metal', color: '#8F969E', roughness: 0.32, metalness: 0.84 },
    secondaryColor: '#25282E',
    description: 'Brushed stainless French-door refrigerator with freezer drawer.',
  },
];

export function createFurnitureFromCatalog(
  catalogId: string,
  position: [number, number, number] = [0, 0, 0],
  rotationY = 0
): FurnitureInstance {
  const item = FURNITURE_CATALOG.find((c) => c.id === catalogId) ?? FURNITURE_CATALOG[0];
  return {
    id: `furn_${Math.random().toString(36).slice(2, 10)}`,
    catalogId: item.id,
    name: item.name,
    category: item.category,
    position,
    rotationY,
    scale: [1, 1, 1],
    baseSize: [...item.defaultSize],
    material: { ...item.defaultMaterial },
    secondaryColor: item.secondaryColor,
    locked: false,
    visible: true,
    lampOn: item.supportsLampLight ? true : undefined,
  };
}

export const DEFAULT_LIGHTING: LightingConfig = {
  mode: 'day',
  sunIntensity: 1.65,
  sunAzimuth: 48,
  sunElevation: 52,
  ambientIntensity: 0.45,
  ceilingLightIntensity: 0.85,
  ceilingLightColor: '#FFF3DF',
  shadowsEnabled: true,
  lampGlowEnabled: true,
};

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'tpl-scandi-bedroom',
    name: 'Scandinavian Bedroom',
    subtitle: 'Warm oak floors, linen platform bed, floating nightstands & morning light',
    roomType: 'bedroom',
    dimensionsLabel: '5.2m × 4.6m × 2.9m',
    thumbnailUrl: '/src/assets/images/template_scandi_bedroom_1794663251000.jpg',
    buildProject: (customName) => {
      const now = Date.now();
      const roomId = makeId('room');
      const room: RoomData = {
        id: roomId,
        name: 'Master Bedroom',
        type: 'bedroom',
        width: 5.2,
        length: 4.6,
        height: 2.9,
        offsetX: 0,
        offsetZ: 0,
        floorMaterial: { type: 'wood', color: '#B88B58', roughness: 0.54, metalness: 0.04, textureScale: 2 },
        wallMaterial: { type: 'paint', color: '#6E7A71', roughness: 0.88, metalness: 0, textureScale: 1 },
        ceilingColor: '#EAE8E2',
        trimColor: '#E5E1D8',
        openings: [
          {
            id: makeId('op'),
            type: 'window',
            wall: 'west',
            offset: -0.2,
            width: 2.1,
            height: 1.75,
            elevation: 0.55,
            frameColor: '#25282E',
          },
          {
            id: makeId('op'),
            type: 'door',
            wall: 'east',
            offset: 1.35,
            width: 0.92,
            height: 2.15,
            elevation: 0,
            frameColor: '#5D3E28',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('decor-area-rug', [0, 0, 0.25], 0),
          createFurnitureFromCatalog('bed-platform-king', [0, 0, -1.05], 0),
          createFurnitureFromCatalog('table-nightstand', [-1.45, 0, -1.92], 0),
          createFurnitureFromCatalog('table-nightstand', [1.45, 0, -1.92], 0),
          createFurnitureFromCatalog('lamp-table', [-1.45, 0.52, -1.92], 0),
          createFurnitureFromCatalog('lamp-table', [1.45, 0.52, -1.92], 0),
          createFurnitureFromCatalog('wardrobe-double', [1.75, 0, 1.85], Math.PI),
          createFurnitureFromCatalog('plant-fiddle-fig', [-2.05, 0, -1.75], 0),
          createFurnitureFromCatalog('chair-lounge', [-1.75, 0, 1.35], Math.PI * 0.72),
        ],
      };
      return {
        id: makeId('proj'),
        name: customName || 'Scandinavian Sanctuary',
        description: 'Serene master suite with oak flooring and soft sage plaster walls.',
        theme: 'obsidian',
        activeRoomId: roomId,
        rooms: [room],
        lighting: { ...DEFAULT_LIGHTING },
        createdAt: now,
        updatedAt: now,
      };
    },
  },
  {
    id: 'tpl-modern-living',
    name: 'Modern Living Room',
    subtitle: 'Modular sectional sofa, travertine table, media console & tall glazing',
    roomType: 'living',
    dimensionsLabel: '6.4m × 5.2m × 3.2m',
    thumbnailUrl: '/src/assets/images/template_modern_living_1794663252777.jpg',
    buildProject: (customName) => {
      const now = Date.now();
      const roomId = makeId('room');
      const room: RoomData = {
        id: roomId,
        name: 'Living Lounge',
        type: 'living',
        width: 6.4,
        length: 5.2,
        height: 3.2,
        offsetX: 0,
        offsetZ: 0,
        floorMaterial: { type: 'concrete', color: '#787C82', roughness: 0.72, metalness: 0.04, textureScale: 2 },
        wallMaterial: { type: 'paint', color: '#3B3F46', roughness: 0.86, metalness: 0, textureScale: 1 },
        ceilingColor: '#2E3238',
        trimColor: '#25282E',
        openings: [
          {
            id: makeId('op'),
            type: 'window',
            wall: 'west',
            offset: 0,
            width: 3.2,
            height: 2.35,
            elevation: 0.35,
            frameColor: '#1C1F24',
          },
          {
            id: makeId('op'),
            type: 'door',
            wall: 'south',
            offset: 2.1,
            width: 1.0,
            height: 2.2,
            elevation: 0,
            frameColor: '#25282E',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('decor-area-rug', [-0.2, 0, 0.15], 0),
          createFurnitureFromCatalog('sofa-sectional', [-0.65, 0, -0.85], 0),
          createFurnitureFromCatalog('table-coffee-marble', [-0.1, 0, 0.35], 0),
          createFurnitureFromCatalog('cabinet-media-console', [2.85, 0, 0.1], -Math.PI / 2),
          createFurnitureFromCatalog('chair-lounge', [1.45, 0, 1.35], -Math.PI * 0.72),
          createFurnitureFromCatalog('lamp-arc-floor', [-2.2, 0, -1.65], Math.PI * 0.25),
          createFurnitureFromCatalog('plant-fiddle-fig', [-2.45, 0, 1.75], 0),
          createFurnitureFromCatalog('decor-sculpture-pedestal', [2.65, 0, -1.9], 0),
        ],
      };
      return {
        id: makeId('proj'),
        name: customName || 'Contemporary Loft Lounge',
        description: 'Architectural living room balancing honed concrete and charcoal bouclé.',
        theme: 'obsidian',
        activeRoomId: roomId,
        rooms: [room],
        lighting: { ...DEFAULT_LIGHTING, sunAzimuth: 245, sunElevation: 34 },
        createdAt: now,
        updatedAt: now,
      };
    },
  },
  {
    id: 'tpl-minimal-kitchen',
    name: 'Minimalist Kitchen',
    subtitle: 'Carrara waterfall island, walnut cabinetry, bar stools & linear pendant',
    roomType: 'kitchen',
    dimensionsLabel: '5.6m × 4.4m × 3.0m',
    thumbnailUrl: '/src/assets/images/template_minimal_kitchen_1794663252862.jpg',
    buildProject: (customName) => {
      const now = Date.now();
      const roomId = makeId('room');
      const room: RoomData = {
        id: roomId,
        name: 'Culinary Studio',
        type: 'kitchen',
        width: 5.6,
        length: 4.4,
        height: 3.0,
        offsetX: 0,
        offsetZ: 0,
        floorMaterial: { type: 'tiles', color: '#CEC7BA', roughness: 0.5, metalness: 0.03, textureScale: 3 },
        wallMaterial: { type: 'paint', color: '#E2DDD4', roughness: 0.84, metalness: 0, textureScale: 1 },
        ceilingColor: '#F0EDE6',
        trimColor: '#D6D0C5',
        openings: [
          {
            id: makeId('op'),
            type: 'window',
            wall: 'west',
            offset: 0.4,
            width: 1.8,
            height: 2.0,
            elevation: 0.4,
            frameColor: '#25282E',
          },
          {
            id: makeId('op'),
            type: 'door',
            wall: 'east',
            offset: 1.2,
            width: 0.95,
            height: 2.15,
            elevation: 0,
            frameColor: '#583B27',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('kitchen-counter-run', [-0.45, 0, -1.78], 0),
          createFurnitureFromCatalog('kitchen-fridge', [1.55, 0, -1.75], 0),
          createFurnitureFromCatalog('kitchen-island', [0, 0, 0.2], 0),
          createFurnitureFromCatalog('chair-barstool', [-0.7, 0, 0.98], Math.PI),
          createFurnitureFromCatalog('chair-barstool', [0, 0, 0.98], Math.PI),
          createFurnitureFromCatalog('chair-barstool', [0.7, 0, 0.98], Math.PI),
          createFurnitureFromCatalog('lamp-pendant', [0, 2.05, 0.2], 0),
          createFurnitureFromCatalog('plant-olive-pot', [-2.15, 0, 1.55], 0),
        ],
      };
      return {
        id: makeId('proj'),
        name: customName || 'Minimalist Walnut Kitchen',
        description: 'Warm walnut millwork paired with honed Carrara island and brass lighting.',
        theme: 'obsidian',
        activeRoomId: roomId,
        rooms: [room],
        lighting: { ...DEFAULT_LIGHTING },
        createdAt: now,
        updatedAt: now,
      };
    },
  },
  {
    id: 'tpl-exec-office',
    name: 'Executive Home Office',
    subtitle: 'Walnut studio desk, custom bookcase, task chair & concrete accent wall',
    roomType: 'office',
    dimensionsLabel: '4.6m × 4.0m × 2.9m',
    thumbnailUrl: '/src/assets/images/template_exec_office_1794663253773.jpg',
    buildProject: (customName) => {
      const now = Date.now();
      const roomId = makeId('room');
      const room: RoomData = {
        id: roomId,
        name: 'Architectural Study',
        type: 'office',
        width: 4.6,
        length: 4.0,
        height: 2.9,
        offsetX: 0,
        offsetZ: 0,
        floorMaterial: { type: 'wood', color: '#7D5838', roughness: 0.5, metalness: 0.04, textureScale: 2 },
        wallMaterial: { type: 'concrete', color: '#6C7076', roughness: 0.85, metalness: 0.02, textureScale: 2 },
        ceilingColor: '#2E3137',
        trimColor: '#25282E',
        openings: [
          {
            id: makeId('op'),
            type: 'window',
            wall: 'west',
            offset: 0,
            width: 2.0,
            height: 1.9,
            elevation: 0.45,
            frameColor: '#1E2025',
          },
          {
            id: makeId('op'),
            type: 'door',
            wall: 'south',
            offset: 1.4,
            width: 0.9,
            height: 2.15,
            elevation: 0,
            frameColor: '#543825',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('decor-area-rug', [0, 0, 0.2], 0),
          createFurnitureFromCatalog('cabinet-bookcase', [0, 0, -1.72], 0),
          createFurnitureFromCatalog('desk-architect', [0, 0, -0.1], 0),
          createFurnitureFromCatalog('chair-office', [0, 0, -0.78], 0),
          createFurnitureFromCatalog('lamp-table', [-0.66, 0.76, -0.15], 0),
          createFurnitureFromCatalog('sofa-loveseat', [1.45, 0, 1.15], -Math.PI * 0.7),
          createFurnitureFromCatalog('plant-fiddle-fig', [-1.8, 0, -1.45], 0),
        ],
      };
      return {
        id: makeId('proj'),
        name: customName || 'Executive Design Study',
        description: 'Moody architectural office with solid walnut desk and shelving.',
        theme: 'obsidian',
        activeRoomId: roomId,
        rooms: [room],
        lighting: { ...DEFAULT_LIGHTING, mode: 'night', sunIntensity: 0.3, ambientIntensity: 0.3, ceilingLightIntensity: 0.95 },
        createdAt: now,
        updatedAt: now,
      };
    },
  },
  {
    id: 'tpl-multi-suite',
    name: 'Two-Room Apartment Suite',
    subtitle: 'Connected living room and master bedroom multi-room layout',
    roomType: 'living',
    dimensionsLabel: 'Multi-Room · 64 m²',
    buildProject: (customName) => {
      const now = Date.now();
      const livingId = makeId('room');
      const bedId = makeId('room');
      const living: RoomData = {
        id: livingId,
        name: 'Living Room',
        type: 'living',
        width: 5.8,
        length: 5.0,
        height: 3.0,
        offsetX: -3.0,
        offsetZ: 0,
        floorMaterial: { type: 'wood', color: '#B48858', roughness: 0.55, metalness: 0.04, textureScale: 2 },
        wallMaterial: { type: 'paint', color: '#D8D3C9', roughness: 0.85, metalness: 0, textureScale: 1 },
        ceilingColor: '#ECE9E2',
        trimColor: '#DED8CE',
        openings: [
          {
            id: makeId('op'),
            type: 'window',
            wall: 'west',
            offset: 0,
            width: 2.6,
            height: 1.9,
            elevation: 0.5,
            frameColor: '#25282E',
          },
          {
            id: makeId('op'),
            type: 'door',
            wall: 'east',
            offset: 0.8,
            width: 1.0,
            height: 2.2,
            elevation: 0,
            frameColor: '#5D3E28',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('decor-area-rug', [-0.2, 0, 0.2], 0),
          createFurnitureFromCatalog('sofa-three-seater', [-0.4, 0, -1.2], 0),
          createFurnitureFromCatalog('table-coffee-marble', [-0.4, 0, 0.1], 0),
          createFurnitureFromCatalog('cabinet-media-console', [-0.4, 0, 1.95], Math.PI),
          createFurnitureFromCatalog('plant-fiddle-fig', [-2.2, 0, -1.85], 0),
        ],
      };
      const bedroom: RoomData = {
        id: bedId,
        name: 'Master Bedroom',
        type: 'bedroom',
        width: 4.8,
        length: 5.0,
        height: 3.0,
        offsetX: 2.4,
        offsetZ: 0,
        floorMaterial: { type: 'wood', color: '#B48858', roughness: 0.55, metalness: 0.04, textureScale: 2 },
        wallMaterial: { type: 'paint', color: '#6E7A71', roughness: 0.86, metalness: 0, textureScale: 1 },
        ceilingColor: '#ECE9E2',
        trimColor: '#DED8CE',
        openings: [
          {
            id: makeId('op'),
            type: 'door',
            wall: 'west',
            offset: 0.8,
            width: 1.0,
            height: 2.2,
            elevation: 0,
            frameColor: '#5D3E28',
          },
          {
            id: makeId('op'),
            type: 'window',
            wall: 'east',
            offset: 0,
            width: 2.0,
            height: 1.8,
            elevation: 0.55,
            frameColor: '#25282E',
          },
        ],
        furniture: [
          createFurnitureFromCatalog('bed-platform-king', [0, 0, -1.15], 0),
          createFurnitureFromCatalog('table-nightstand', [-1.35, 0, -1.95], 0),
          createFurnitureFromCatalog('wardrobe-double', [1.2, 0, 2.05], Math.PI),
          createFurnitureFromCatalog('lamp-arc-floor', [1.65, 0, -1.65], -Math.PI * 0.25),
        ],
      };
      return {
        id: makeId('proj'),
        name: customName || 'Two-Room Urban Suite',
        description: 'Connected living lounge and master bedroom suite.',
        theme: 'obsidian',
        activeRoomId: livingId,
        rooms: [living, bedroom],
        lighting: { ...DEFAULT_LIGHTING },
        createdAt: now,
        updatedAt: now,
      };
    },
  },
];

export function createCustomProject(params: {
  name: string;
  roomType: RoomData['type'];
  width: number;
  length: number;
  height: number;
  theme?: ProjectData['theme'];
}): ProjectData {
  const now = Date.now();
  const roomId = makeId('room');
  const defaultFloor: MaterialConfig =
    params.roomType === 'kitchen'
      ? { type: 'tiles', color: '#CEC7BA', roughness: 0.5, metalness: 0.03, textureScale: 3 }
      : { type: 'wood', color: '#B48858', roughness: 0.55, metalness: 0.04, textureScale: 2 };
  const defaultWall: MaterialConfig =
    params.roomType === 'office'
      ? { type: 'concrete', color: '#6E7379', roughness: 0.84, metalness: 0.02, textureScale: 2 }
      : { type: 'paint', color: '#D6D1C7', roughness: 0.86, metalness: 0, textureScale: 1 };

  const room: RoomData = {
    id: roomId,
    name:
      params.roomType === 'bedroom'
        ? 'Bedroom'
        : params.roomType === 'living'
        ? 'Living Room'
        : params.roomType === 'kitchen'
        ? 'Kitchen'
        : params.roomType === 'office'
        ? 'Office'
        : 'Custom Room',
    type: params.roomType,
    width: params.width,
    length: params.length,
    height: params.height,
    offsetX: 0,
    offsetZ: 0,
    floorMaterial: defaultFloor,
    wallMaterial: defaultWall,
    ceilingColor: '#EAE8E2',
    trimColor: '#D6D0C5',
    openings: [
      {
        id: makeId('op'),
        type: 'window',
        wall: 'west',
        offset: 0,
        width: Math.min(2.0, params.length * 0.45),
        height: Math.min(1.7, params.height - 0.8),
        elevation: 0.55,
        frameColor: '#25282E',
      },
      {
        id: makeId('op'),
        type: 'door',
        wall: 'south',
        offset: Math.max(0, params.width * 0.28),
        width: 0.92,
        height: Math.min(2.15, params.height - 0.25),
        elevation: 0,
        frameColor: '#5D3E28',
      },
    ],
    furniture: [],
  };

  return {
    id: makeId('proj'),
    name: params.name.trim() || 'Untitled Space',
    description: `Custom ${params.roomType} layout (${params.width.toFixed(1)}m × ${params.length.toFixed(1)}m)`,
    theme: params.theme ?? 'obsidian',
    activeRoomId: roomId,
    rooms: [room],
    lighting: { ...DEFAULT_LIGHTING },
    createdAt: now,
    updatedAt: now,
  };
}
