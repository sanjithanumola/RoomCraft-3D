import * as THREE from 'three';
import type { MaterialType } from '../types/studio';

const textureCache = new Map<string, THREE.CanvasTexture>();

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 180, g: 180, b: 180 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/**
 * Generates deterministic, zero-404 procedural PBR textures using HTML5 Canvas.
 * Color textures explicitly use SRGBColorSpace and anisotropic filtering.
 */
export function getProceduralTexture(
  type: MaterialType,
  colorHex: string,
  repeat = 2,
  maxAnisotropy = 8
): THREE.CanvasTexture | null {
  if (type === 'glass' || type === 'metal') return null;

  const key = `${type}_${colorHex}_${repeat.toFixed(2)}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { r, g, b } = hexToRgb(colorHex);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random helper
  let seed = (r * 73856093) ^ (g * 19349663) ^ (b * 83492791);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  if (type === 'wood') {
    const planks = 4;
    const plankW = size / planks;
    for (let p = 0; p < planks; p++) {
      const shade = (rand() - 0.5) * 20;
      ctx.fillStyle = `rgb(${clampByte(r + shade)},${clampByte(g + shade * 0.85)},${clampByte(b + shade * 0.7)})`;
      ctx.fillRect(p * plankW, 0, plankW, size);

      // Wood grain streaks
      for (let i = 0; i < 42; i++) {
        const x = p * plankW + rand() * plankW;
        const alpha = 0.05 + rand() * 0.09;
        const dark = rand() > 0.45 ? -26 : 16;
        ctx.strokeStyle = `rgba(${clampByte(r + dark)},${clampByte(g + dark)},${clampByte(b + dark)},${alpha})`;
        ctx.lineWidth = 0.8 + rand() * 1.4;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        const curve = (rand() - 0.5) * 8;
        ctx.bezierCurveTo(x + curve, size * 0.33, x - curve, size * 0.66, x, size);
        ctx.stroke();
      }

      // Plank seam
      ctx.fillStyle = `rgba(18, 12, 8, 0.28)`;
      ctx.fillRect(p * plankW, 0, 1.5, size);
    }
    // Horizontal plank joint
    ctx.fillStyle = `rgba(18, 12, 8, 0.22)`;
    ctx.fillRect(0, size * 0.5, plankW * 2, 1.5);
    ctx.fillRect(plankW * 2, size * 0.25, plankW * 2, 1.5);
  } else if (type === 'marble') {
    // Subtle mineral clouding + veins
    for (let i = 0; i < 18; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const rad = 25 + rand() * 65;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
      const shift = rand() > 0.5 ? 18 : -18;
      grad.addColorStop(0, `rgba(${clampByte(r + shift)},${clampByte(g + shift)},${clampByte(b + shift)},0.12)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    const isDark = (r + g + b) / 3 < 100;
    for (let v = 0; v < 7; v++) {
      ctx.strokeStyle = isDark
        ? `rgba(235, 228, 214, ${0.08 + rand() * 0.14})`
        : `rgba(110, 108, 104, ${0.09 + rand() * 0.14})`;
      ctx.lineWidth = 0.8 + rand() * 1.8;
      ctx.beginPath();
      let vx = rand() * size;
      let vy = 0;
      ctx.moveTo(vx, vy);
      for (let s = 1; s <= 8; s++) {
        vx += (rand() - 0.45) * 44;
        vy = (s / 8) * size;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }
  } else if (type === 'concrete') {
    for (let i = 0; i < 900; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const w = 2 + rand() * 8;
      const d = (rand() - 0.5) * 26;
      ctx.fillStyle = `rgba(${clampByte(r + d)},${clampByte(g + d)},${clampByte(b + d)},0.14)`;
      ctx.fillRect(x, y, w, w);
    }
  } else if (type === 'tiles') {
    const grid = 4;
    const tile = size / grid;
    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        const d = (rand() - 0.5) * 14;
        ctx.fillStyle = `rgb(${clampByte(r + d)},${clampByte(g + d)},${clampByte(b + d)})`;
        ctx.fillRect(gx * tile + 2, gy * tile + 2, tile - 3, tile - 3);
      }
    }
    // Grout lines
    ctx.strokeStyle = `rgba(${clampByte(r - 42)},${clampByte(g - 42)},${clampByte(b - 42)},0.65)`;
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= grid; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tile, 0);
      ctx.lineTo(i * tile, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tile);
      ctx.lineTo(size, i * tile);
      ctx.stroke();
    }
  } else if (type === 'fabric') {
    // Crosshatch linen/bouclé weave
    ctx.fillStyle = `rgba(${clampByte(r - 18)},${clampByte(g - 18)},${clampByte(b - 18)},0.16)`;
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 1);
    }
    ctx.fillStyle = `rgba(${clampByte(r + 18)},${clampByte(g + 18)},${clampByte(b + 18)},0.12)`;
    for (let x = 0; x < size; x += 4) {
      ctx.fillRect(x, 0, 1, size);
    }
    for (let i = 0; i < 400; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const d = (rand() - 0.5) * 24;
      ctx.fillStyle = `rgba(${clampByte(r + d)},${clampByte(g + d)},${clampByte(b + d)},0.16)`;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (type === 'paint') {
    for (let i = 0; i < 450; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const d = (rand() - 0.5) * 10;
      ctx.fillStyle = `rgba(${clampByte(r + d)},${clampByte(g + d)},${clampByte(b + d)},0.09)`;
      ctx.fillRect(x, y, 3, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}
