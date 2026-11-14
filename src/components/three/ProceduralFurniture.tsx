import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { FurnitureInstance } from '../../types/studio';
import { getProceduralTexture } from '../../utils/proceduralTextures';

interface Props {
  item: FurnitureInstance;
  lampGlowEnabled: boolean;
  isSelected: boolean;
  hasConflict: boolean;
}

function usePrimaryMaterial(item: FurnitureInstance) {
  const { type, color, roughness, metalness, textureScale } = item.material;
  const map = useMemo(
    () => getProceduralTexture(type, color, textureScale ?? 2),
    [type, color, textureScale]
  );

  const mat = useMemo(() => {
    if (type === 'glass') {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: Math.max(0.04, roughness),
        metalness,
        transparent: true,
        opacity: 0.42,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: map ? '#ffffff' : color,
      map: map ?? undefined,
      roughness,
      metalness,
    });
  }, [type, color, roughness, metalness, map]);

  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function useAccentMaterial(color: string, roughness = 0.45, metalness = 0.08) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      }),
    [color, roughness, metalness]
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

/**
 * Renders detailed 4-to-14 part procedural 3D furniture models with bottom-center pivot at y = 0.
 */
export const ProceduralFurniture: React.FC<Props> = ({
  item,
  lampGlowEnabled,
  isSelected,
  hasConflict,
}) => {
  const primaryMat = usePrimaryMaterial(item);
  const accentHex = item.secondaryColor || '#C59B49';
  const woodDarkMat = useAccentMaterial('#4A3321', 0.52, 0.04);
  const brassMat = useAccentMaterial('#C59B49', 0.25, 0.88);
  const steelMat = useAccentMaterial('#2A2E35', 0.38, 0.82);
  const ceramicMat = useAccentMaterial(accentHex, 0.42, 0.04);
  const crispLinenMat = useAccentMaterial(accentHex, 0.9, 0);
  const mirrorMat = useAccentMaterial('#B8CAD6', 0.06, 0.92);
  const darkInnerMat = useAccentMaterial('#1B1D22', 0.85, 0.05);

  const [w, h, d] = item.baseSize;
  const isLit = Boolean(item.lampOn && lampGlowEnabled);

  const renderModel = () => {
    switch (item.catalogId) {
      case 'sofa-sectional': {
        const legH = 0.1;
        const baseH = 0.24;
        const cushionH = 0.16;
        const backH = h - legH - baseH * 0.4;
        return (
          <group>
            {/* Main 3-seat frame + cushions */}
            <mesh position={[0, legH + baseH / 2, -d * 0.22]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, baseH, d * 0.56]} />
            </mesh>
            {/* Chaise extension on left */}
            <mesh position={[-w * 0.32, legH + baseH / 2, d * 0.22]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w * 0.36, baseH, d * 0.44]} />
            </mesh>
            {/* 3 Seat cushions */}
            {[-w * 0.32, 0, w * 0.32].map((cx, i) => (
              <mesh
                key={i}
                position={[cx, legH + baseH + cushionH / 2 - 0.02, i === 0 ? d * 0.02 : -d * 0.19]}
                material={primaryMat}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[w * 0.31, cushionH, i === 0 ? d * 0.84 : d * 0.48]} />
              </mesh>
            ))}
            {/* Backrest */}
            <mesh position={[0, legH + baseH + backH / 2 - 0.05, -d * 0.44]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, backH, 0.18]} />
            </mesh>
            {/* Right & Left Armrests */}
            <mesh position={[-w / 2 + 0.09, legH + baseH + 0.13, -d * 0.16]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.18, 0.34, d * 0.68]} />
            </mesh>
            <mesh position={[w / 2 - 0.09, legH + baseH + 0.13, -d * 0.22]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.18, 0.34, d * 0.56]} />
            </mesh>
            {/* Back cushions & throw pillows */}
            {[-w * 0.28, 0, w * 0.28].map((cx, i) => (
              <mesh
                key={`bc_${i}`}
                position={[cx, legH + baseH + 0.28, -d * 0.33]}
                rotation={[-0.14, 0, 0]}
                material={primaryMat}
                castShadow
              >
                <boxGeometry args={[w * 0.28, 0.34, 0.14]} />
              </mesh>
            ))}
            <mesh position={[-w * 0.34, legH + baseH + 0.25, -d * 0.25]} rotation={[-0.2, 0.3, 0.1]} material={crispLinenMat} castShadow>
              <boxGeometry args={[0.36, 0.32, 0.12]} />
            </mesh>
            <mesh position={[w * 0.34, legH + baseH + 0.25, -d * 0.26]} rotation={[-0.2, -0.35, -0.1]} material={crispLinenMat} castShadow>
              <boxGeometry args={[0.34, 0.32, 0.12]} />
            </mesh>
            {/* Plinth legs */}
            {[
              [-w / 2 + 0.12, -d * 0.44],
              [w / 2 - 0.12, -d * 0.44],
              [-w / 2 + 0.12, d * 0.44],
              [w / 2 - 0.12, d * 0.02],
            ].map(([lx, lz], i) => (
              <mesh key={`leg_${i}`} position={[lx, legH / 2, lz]} material={steelMat} castShadow>
                <cylinderGeometry args={[0.025, 0.018, legH, 10]} />
              </mesh>
            ))}
          </group>
        );
      }

      case 'sofa-three-seater':
      case 'sofa-loveseat': {
        const legH = 0.15;
        const baseH = 0.18;
        const cushionCount = item.catalogId === 'sofa-loveseat' ? 2 : 3;
        const innerW = w - 0.32;
        return (
          <group>
            {/* Base deck */}
            <mesh position={[0, legH + baseH / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, baseH, d]} />
            </mesh>
            {/* Seat cushions */}
            {Array.from({ length: cushionCount }).map((_, i) => {
              const cw = innerW / cushionCount;
              const cx = -innerW / 2 + cw / 2 + i * cw;
              return (
                <mesh
                  key={i}
                  position={[cx, legH + baseH + 0.075, 0.04]}
                  material={primaryMat}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[cw - 0.02, 0.15, d - 0.22]} />
                </mesh>
              );
            })}
            {/* Backrest & armrests */}
            <mesh position={[0, legH + baseH + 0.22, -d / 2 + 0.09]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h - legH - baseH, 0.18]} />
            </mesh>
            <mesh position={[-w / 2 + 0.08, legH + baseH + 0.14, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.3, d - 0.04]} />
            </mesh>
            <mesh position={[w / 2 - 0.08, legH + baseH + 0.14, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.3, d - 0.04]} />
            </mesh>
            {/* Accent throw pillows */}
            <mesh position={[-innerW * 0.35, legH + baseH + 0.24, -d * 0.22]} rotation={[-0.18, 0.25, 0.08]} material={crispLinenMat} castShadow>
              <boxGeometry args={[0.32, 0.32, 0.11]} />
            </mesh>
            <mesh position={[innerW * 0.35, legH + baseH + 0.24, -d * 0.22]} rotation={[-0.18, -0.25, -0.08]} material={crispLinenMat} castShadow>
              <boxGeometry args={[0.32, 0.32, 0.11]} />
            </mesh>
            {/* Tapered legs */}
            {[
              [-w / 2 + 0.1, -d / 2 + 0.1],
              [w / 2 - 0.1, -d / 2 + 0.1],
              [-w / 2 + 0.1, d / 2 - 0.1],
              [w / 2 - 0.1, d / 2 - 0.1],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} material={ceramicMat} castShadow>
                <cylinderGeometry args={[0.028, 0.016, legH, 10]} />
              </mesh>
            ))}
          </group>
        );
      }

      case 'bed-platform-king': {
        const frameH = 0.22;
        const legH = 0.14;
        const mattH = 0.24;
        return (
          <group>
            {/* Oak plinth legs */}
            {[
              [-w / 2 + 0.14, -d / 2 + 0.14],
              [w / 2 - 0.14, -d / 2 + 0.14],
              [-w / 2 + 0.14, d / 2 - 0.14],
              [w / 2 - 0.14, d / 2 - 0.14],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} material={ceramicMat} castShadow>
                <cylinderGeometry args={[0.035, 0.022, legH, 10]} />
              </mesh>
            ))}
            {/* Frame */}
            <mesh position={[0, legH + frameH / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, frameH, d]} />
            </mesh>
            {/* Upholstered Headboard */}
            <mesh position={[0, h / 2 + 0.06, -d / 2 + 0.07]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w + 0.06, h - 0.12, 0.14]} />
            </mesh>
            {/* Oak headboard side trim */}
            <mesh position={[-w / 2 - 0.02, h / 2 + 0.06, -d / 2 + 0.07]} material={ceramicMat} castShadow>
              <boxGeometry args={[0.04, h - 0.1, 0.16]} />
            </mesh>
            <mesh position={[w / 2 + 0.02, h / 2 + 0.06, -d / 2 + 0.07]} material={ceramicMat} castShadow>
              <boxGeometry args={[0.04, h - 0.1, 0.16]} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, legH + frameH + mattH / 2 - 0.04, 0.06]} material={crispLinenMat} castShadow receiveShadow>
              <boxGeometry args={[w - 0.14, mattH, d - 0.24]} />
            </mesh>
            {/* Folded Duvet */}
            <mesh position={[0, legH + frameH + mattH - 0.01, 0.25]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w - 0.08, 0.12, d * 0.62]} />
            </mesh>
            {/* 4 Pillows */}
            {[-0.45, 0.45].map((px, i) => (
              <group key={i}>
                <mesh position={[px, legH + frameH + mattH + 0.04, -d / 2 + 0.34]} rotation={[-0.25, 0, 0]} material={crispLinenMat} castShadow>
                  <boxGeometry args={[0.72, 0.16, 0.42]} />
                </mesh>
                <mesh position={[px, legH + frameH + mattH + 0.03, -d / 2 + 0.56]} rotation={[-0.18, 0, 0]} material={primaryMat} castShadow>
                  <boxGeometry args={[0.58, 0.13, 0.32]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      }

      case 'bed-canopy-queen': {
        const postR = 0.026;
        const baseY = 0.22;
        return (
          <group>
            {/* 4 Canopy Posts */}
            {[
              [-w / 2 + postR, -d / 2 + postR],
              [w / 2 - postR, -d / 2 + postR],
              [-w / 2 + postR, d / 2 - postR],
              [w / 2 - postR, d / 2 - postR],
            ].map(([px, pz], i) => (
              <mesh key={i} position={[px, h / 2, pz]} material={primaryMat} castShadow>
                <boxGeometry args={[postR * 2, h, postR * 2]} />
              </mesh>
            ))}
            {/* Top Canopy Frame */}
            <mesh position={[0, h - postR, -d / 2 + postR]} material={primaryMat} castShadow>
              <boxGeometry args={[w, postR * 1.8, postR * 1.8]} />
            </mesh>
            <mesh position={[0, h - postR, d / 2 - postR]} material={primaryMat} castShadow>
              <boxGeometry args={[w, postR * 1.8, postR * 1.8]} />
            </mesh>
            <mesh position={[-w / 2 + postR, h - postR, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[postR * 1.8, postR * 1.8, d]} />
            </mesh>
            <mesh position={[w / 2 - postR, h - postR, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[postR * 1.8, postR * 1.8, d]} />
            </mesh>
            {/* Platform & Headboard */}
            <mesh position={[0, baseY + 0.08, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w - 0.04, 0.16, d - 0.04]} />
            </mesh>
            <mesh position={[0, baseY + 0.55, -d / 2 + 0.05]} material={crispLinenMat} castShadow>
              <boxGeometry args={[w - 0.12, 0.72, 0.08]} />
            </mesh>
            {/* Mattress & Duvet */}
            <mesh position={[0, baseY + 0.28, 0.04]} material={crispLinenMat} castShadow receiveShadow>
              <boxGeometry args={[w - 0.14, 0.24, d - 0.22]} />
            </mesh>
            <mesh position={[0, baseY + 0.36, 0.25]} material={crispLinenMat} castShadow>
              <boxGeometry args={[w - 0.1, 0.1, d * 0.58]} />
            </mesh>
          </group>
        );
      }

      case 'chair-lounge': {
        return (
          <group>
            {/* Timber leg frame */}
            {[
              [-w * 0.38, -d * 0.35],
              [w * 0.38, -d * 0.35],
              [-w * 0.38, d * 0.35],
              [w * 0.38, d * 0.35],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, 0.24, lz]} material={ceramicMat} castShadow>
                <cylinderGeometry args={[0.022, 0.016, 0.48, 10]} />
              </mesh>
            ))}
            {/* Armrests */}
            <mesh position={[-w * 0.42, 0.52, 0]} material={ceramicMat} castShadow>
              <boxGeometry args={[0.06, 0.05, d * 0.76]} />
            </mesh>
            <mesh position={[w * 0.42, 0.52, 0]} material={ceramicMat} castShadow>
              <boxGeometry args={[0.06, 0.05, d * 0.76]} />
            </mesh>
            {/* Seat cushion */}
            <mesh position={[0, 0.34, 0.04]} rotation={[-0.08, 0, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w * 0.76, 0.14, d * 0.72]} />
            </mesh>
            {/* Angled backrest */}
            <mesh position={[0, 0.58, -d * 0.26]} rotation={[-0.25, 0, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w * 0.74, 0.46, 0.13]} />
            </mesh>
          </group>
        );
      }

      case 'chair-dining': {
        const seatY = 0.45;
        return (
          <group>
            {[
              [-w * 0.38, -d * 0.38],
              [w * 0.38, -d * 0.38],
              [-w * 0.38, d * 0.38],
              [w * 0.38, d * 0.38],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, seatY / 2, lz]} material={primaryMat} castShadow>
                <cylinderGeometry args={[0.018, 0.014, seatY, 10]} />
              </mesh>
            ))}
            {/* Seat pad */}
            <mesh position={[0, seatY, 0]} material={crispLinenMat} castShadow receiveShadow>
              <boxGeometry args={[w * 0.86, 0.045, d * 0.86]} />
            </mesh>
            {/* Back uprights + curved top rail */}
            <mesh position={[-w * 0.38, seatY + 0.18, -d * 0.38]} material={primaryMat} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.36, 10]} />
            </mesh>
            <mesh position={[w * 0.38, seatY + 0.18, -d * 0.38]} material={primaryMat} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.36, 10]} />
            </mesh>
            <mesh position={[0, h - 0.04, -d * 0.38]} material={primaryMat} castShadow>
              <boxGeometry args={[w * 0.84, 0.06, 0.04]} />
            </mesh>
            <mesh position={[0, seatY + 0.16, -d * 0.38]} material={primaryMat} castShadow>
              <boxGeometry args={[0.05, 0.28, 0.025]} />
            </mesh>
          </group>
        );
      }

      case 'chair-office': {
        return (
          <group>
            {/* 5-star base */}
            {[0, 1, 2, 3, 4].map((i) => {
              const ang = (i * Math.PI * 2) / 5;
              return (
                <mesh
                  key={i}
                  position={[Math.sin(ang) * 0.16, 0.04, Math.cos(ang) * 0.16]}
                  rotation={[0, ang, 0]}
                  material={ceramicMat}
                  castShadow
                >
                  <boxGeometry args={[0.04, 0.03, 0.32]} />
                </mesh>
              );
            })}
            {/* Pneumatic lift */}
            <mesh position={[0, 0.26, 0]} material={ceramicMat} castShadow>
              <cylinderGeometry args={[0.03, 0.035, 0.42, 12]} />
            </mesh>
            {/* Seat */}
            <mesh position={[0, 0.48, 0.02]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w * 0.78, 0.09, d * 0.75]} />
            </mesh>
            {/* High Back */}
            <mesh position={[0, 0.8, -d * 0.32]} rotation={[-0.1, 0, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[w * 0.72, 0.56, 0.08]} />
            </mesh>
            {/* Armrests */}
            {[-w * 0.42, w * 0.42].map((ax, i) => (
              <group key={i}>
                <mesh position={[ax, 0.58, 0]} material={ceramicMat} castShadow>
                  <boxGeometry args={[0.03, 0.18, 0.04]} />
                </mesh>
                <mesh position={[ax, 0.67, 0.02]} material={darkInnerMat} castShadow>
                  <boxGeometry args={[0.07, 0.03, 0.26]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      }

      case 'chair-barstool': {
        const seatY = h - 0.06;
        return (
          <group>
            {[
              [-w * 0.35, -d * 0.35],
              [w * 0.35, -d * 0.35],
              [-w * 0.35, d * 0.35],
              [w * 0.35, d * 0.35],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, seatY / 2, lz]} material={primaryMat} castShadow>
                <cylinderGeometry args={[0.018, 0.013, seatY, 10]} />
              </mesh>
            ))}
            {/* Footrest ring */}
            <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]} material={steelMat}>
              <torusGeometry args={[w * 0.34, 0.012, 8, 24]} />
            </mesh>
            {/* Cushion */}
            <mesh position={[0, seatY, 0]} material={crispLinenMat} castShadow receiveShadow>
              <cylinderGeometry args={[w * 0.44, w * 0.42, 0.06, 20]} />
            </mesh>
            {/* Low lumbar lip */}
            <mesh position={[0, seatY + 0.08, -d * 0.34]} material={primaryMat} castShadow>
              <boxGeometry args={[w * 0.72, 0.12, 0.05]} />
            </mesh>
          </group>
        );
      }

      case 'table-coffee-marble': {
        return (
          <group>
            <mesh position={[0, h - 0.03, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, 0.06, d]} />
            </mesh>
            <mesh position={[-w * 0.28, (h - 0.06) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.24, h - 0.06, d * 0.65]} />
            </mesh>
            <mesh position={[w * 0.28, (h - 0.06) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.24, h - 0.06, d * 0.65]} />
            </mesh>
            {/* Decorative tray & book */}
            <mesh position={[0.16, h + 0.018, 0.04]} material={ceramicMat} castShadow>
              <boxGeometry args={[0.32, 0.035, 0.24]} />
            </mesh>
            <mesh position={[-0.25, h + 0.05, -0.05]} material={brassMat} castShadow>
              <cylinderGeometry args={[0.07, 0.05, 0.1, 16]} />
            </mesh>
          </group>
        );
      }

      case 'table-dining-oak': {
        const legH = h - 0.05;
        return (
          <group>
            <mesh position={[0, h - 0.025, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, 0.05, d]} />
            </mesh>
            {[
              [-w / 2 + 0.18, -d / 2 + 0.12],
              [w / 2 - 0.18, -d / 2 + 0.12],
              [-w / 2 + 0.18, d / 2 - 0.12],
              [w / 2 - 0.18, d / 2 - 0.12],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} material={primaryMat} castShadow>
                <boxGeometry args={[0.08, legH, 0.08]} />
              </mesh>
            ))}
            {/* Centerpiece ceramic bowl */}
            <mesh position={[0, h + 0.04, 0]} material={ceramicMat} castShadow>
              <cylinderGeometry args={[0.18, 0.09, 0.08, 20]} />
            </mesh>
          </group>
        );
      }

      case 'table-round-bistro': {
        const r = Math.min(w, d) / 2;
        return (
          <group>
            <mesh position={[0, h - 0.022, 0]} material={primaryMat} castShadow receiveShadow>
              <cylinderGeometry args={[r, r * 0.96, 0.044, 32]} />
            </mesh>
            <mesh position={[0, h / 2, 0]} material={ceramicMat} castShadow>
              <cylinderGeometry args={[0.06, 0.1, h - 0.05, 20]} />
            </mesh>
            <mesh position={[0, 0.02, 0]} material={ceramicMat} castShadow receiveShadow>
              <cylinderGeometry args={[r * 0.48, r * 0.54, 0.04, 28]} />
            </mesh>
          </group>
        );
      }

      case 'table-nightstand': {
        const legH = 0.16;
        const bodyH = h - legH;
        return (
          <group>
            {[
              [-w / 2 + 0.06, -d / 2 + 0.06],
              [w / 2 - 0.06, -d / 2 + 0.06],
              [-w / 2 + 0.06, d / 2 - 0.06],
              [w / 2 - 0.06, d / 2 - 0.06],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} material={primaryMat} castShadow>
                <cylinderGeometry args={[0.018, 0.012, legH, 10]} />
              </mesh>
            ))}
            <mesh position={[0, legH + bodyH / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, bodyH, d]} />
            </mesh>
            {/* 2 Drawer fronts + brass pulls */}
            {[legH + bodyH * 0.28, legH + bodyH * 0.72].map((dy, i) => (
              <group key={i}>
                <mesh position={[0, dy, d / 2 + 0.008]} material={primaryMat} castShadow>
                  <boxGeometry args={[w - 0.04, bodyH * 0.4, 0.016]} />
                </mesh>
                <mesh position={[0, dy, d / 2 + 0.024]} material={brassMat}>
                  <boxGeometry args={[0.12, 0.014, 0.016]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      }

      case 'wardrobe-double': {
        return (
          <group>
            {/* Plinth */}
            <mesh position={[0, 0.05, 0]} material={darkInnerMat} castShadow>
              <boxGeometry args={[w - 0.04, 0.1, d - 0.04]} />
            </mesh>
            {/* Cabinet body */}
            <mesh position={[0, h / 2 + 0.04, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h - 0.08, d]} />
            </mesh>
            {/* Left & Right Doors */}
            {[-w / 4, w / 4].map((dx, i) => (
              <group key={i}>
                <mesh position={[dx, h / 2 + 0.04, d / 2 + 0.01]} material={primaryMat} castShadow>
                  <boxGeometry args={[w / 2 - 0.02, h - 0.14, 0.02]} />
                </mesh>
                <mesh position={[dx + (i === 0 ? w * 0.18 : -w * 0.18), h * 0.5, d / 2 + 0.032]} material={brassMat}>
                  <cylinderGeometry args={[0.008, 0.008, 0.42, 8]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      }

      case 'wardrobe-glass': {
        const glassPaneMat = ceramicMat;
        return (
          <group>
            <mesh position={[0, h / 2, -d / 2 + 0.02]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.04]} />
            </mesh>
            {/* Top/bottom/sides */}
            <mesh position={[0, h - 0.02, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[w, 0.04, d]} />
            </mesh>
            <mesh position={[0, 0.04, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[w, 0.08, d]} />
            </mesh>
            <mesh position={[-w / 2 + 0.02, h / 2, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[0.04, h, d]} />
            </mesh>
            <mesh position={[w / 2 - 0.02, h / 2, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[0.04, h, d]} />
            </mesh>
            {/* Interior shelves */}
            {[0.55, 1.05, 1.55].map((sy, i) => (
              <mesh key={i} position={[0, sy, 0]} material={woodDarkMat} castShadow>
                <boxGeometry args={[w - 0.08, 0.03, d - 0.08]} />
              </mesh>
            ))}
            {/* Smoked glass front doors */}
            <mesh position={[0, h / 2, d / 2 - 0.01]} material={glassPaneMat}>
              <boxGeometry args={[w - 0.06, h - 0.12, 0.015]} />
            </mesh>
            <mesh position={[0, h / 2, d / 2]} material={primaryMat}>
              <boxGeometry args={[0.025, h - 0.08, 0.03]} />
            </mesh>
          </group>
        );
      }

      case 'cabinet-media-console': {
        const legH = 0.16;
        const bodyH = h - legH;
        return (
          <group>
            {[
              [-w / 2 + 0.12, -d / 2 + 0.08],
              [w / 2 - 0.12, -d / 2 + 0.08],
              [-w / 2 + 0.12, d / 2 - 0.08],
              [w / 2 - 0.12, d / 2 - 0.08],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, legH / 2, lz]} material={steelMat} castShadow>
                <boxGeometry args={[0.03, legH, 0.03]} />
              </mesh>
            ))}
            <mesh position={[0, legH + bodyH / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, bodyH, d]} />
            </mesh>
            {/* 4 door panels */}
            {[-w * 0.36, -w * 0.12, w * 0.12, w * 0.36].map((dx, i) => (
              <mesh key={i} position={[dx, legH + bodyH / 2, d / 2 + 0.008]} material={primaryMat} castShadow>
                <boxGeometry args={[w * 0.22, bodyH - 0.04, 0.015]} />
              </mesh>
            ))}
            {/* Slim architectural screen on top */}
            <mesh position={[0, h + 0.38, -0.05]} material={darkInnerMat} castShadow>
              <boxGeometry args={[w * 0.68, 0.68, 0.035]} />
            </mesh>
            <mesh position={[0, h + 0.02, -0.05]} material={steelMat}>
              <boxGeometry args={[0.32, 0.04, 0.14]} />
            </mesh>
          </group>
        );
      }

      case 'cabinet-bookcase': {
        const shelves = 5;
        return (
          <group>
            <mesh position={[-w / 2 + 0.02, h / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.04, h, d]} />
            </mesh>
            <mesh position={[w / 2 - 0.02, h / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.04, h, d]} />
            </mesh>
            <mesh position={[0, h / 2, -d / 2 + 0.015]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.03]} />
            </mesh>
            {Array.from({ length: shelves + 1 }).map((_, i) => {
              const sy = 0.04 + (i * (h - 0.08)) / shelves;
              return (
                <group key={i}>
                  <mesh position={[0, sy, 0]} material={primaryMat} castShadow receiveShadow>
                    <boxGeometry args={[w - 0.04, 0.035, d]} />
                  </mesh>
                  {i < shelves && i % 2 === 0 && (
                    <mesh position={[-w * 0.22, sy + 0.14, 0.02]} material={ceramicMat} castShadow>
                      <boxGeometry args={[0.34, 0.24, d * 0.62]} />
                    </mesh>
                  )}
                  {i < shelves && i % 2 === 1 && (
                    <mesh position={[w * 0.2, sy + 0.13, 0.02]} material={brassMat} castShadow>
                      <boxGeometry args={[0.26, 0.22, d * 0.6]} />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        );
      }

      case 'cabinet-dresser': {
        return (
          <group>
            <mesh position={[0, h / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h - 0.08, d]} />
            </mesh>
            {/* Warm wood top */}
            <mesh position={[0, h - 0.02, 0]} material={ceramicMat} castShadow receiveShadow>
              <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
            </mesh>
            {/* 6 drawer fronts */}
            {[0.2, 0.45, 0.7].map((ry, r) =>
              [-w * 0.24, w * 0.24].map((rx, c) => (
                <group key={`${r}_${c}`}>
                  <mesh position={[rx, ry, d / 2 + 0.008]} material={primaryMat} castShadow>
                    <boxGeometry args={[w * 0.45, 0.2, 0.016]} />
                  </mesh>
                  <mesh position={[rx, ry, d / 2 + 0.025]} rotation={[Math.PI / 2, 0, 0]} material={brassMat}>
                    <cylinderGeometry args={[0.016, 0.016, 0.02, 12]} />
                  </mesh>
                </group>
              ))
            )}
          </group>
        );
      }

      case 'desk-architect': {
        return (
          <group>
            {/* Desktop */}
            <mesh position={[0, h - 0.025, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, 0.05, d]} />
            </mesh>
            {/* Left slab leg */}
            <mesh position={[-w / 2 + 0.04, (h - 0.05) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.08, h - 0.05, d - 0.04]} />
            </mesh>
            {/* Right drawer pedestal */}
            <mesh position={[w / 2 - 0.22, (h - 0.05) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[0.42, h - 0.05, d - 0.04]} />
            </mesh>
            {/* Monitor on desk */}
            <mesh position={[0, h + 0.25, -d * 0.24]} material={darkInnerMat} castShadow>
              <boxGeometry args={[0.64, 0.36, 0.025]} />
            </mesh>
            <mesh position={[0, h + 0.05, -d * 0.26]} material={ceramicMat}>
              <boxGeometry args={[0.14, 0.1, 0.1]} />
            </mesh>
          </group>
        );
      }

      case 'desk-minimal': {
        return (
          <group>
            <mesh position={[0, h - 0.02, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, 0.04, d]} />
            </mesh>
            {[
              [-w / 2 + 0.06, -d / 2 + 0.06],
              [w / 2 - 0.06, -d / 2 + 0.06],
              [-w / 2 + 0.06, d / 2 - 0.06],
              [w / 2 - 0.06, d / 2 - 0.06],
            ].map(([lx, lz], i) => (
              <mesh key={i} position={[lx, (h - 0.04) / 2, lz]} material={ceramicMat} castShadow>
                <cylinderGeometry args={[0.018, 0.015, h - 0.04, 10]} />
              </mesh>
            ))}
          </group>
        );
      }

      case 'lamp-arc-floor': {
        const shadeMat = new THREE.MeshStandardMaterial({
          color: accentHex,
          roughness: 0.55,
          metalness: 0.05,
          emissive: isLit ? new THREE.Color('#FFCF86') : new THREE.Color('#000000'),
          emissiveIntensity: isLit ? 0.95 : 0,
        });
        return (
          <group>
            {/* Marble base */}
            <mesh position={[0, 0.035, -d * 0.32]} material={steelMat} castShadow receiveShadow>
              <cylinderGeometry args={[0.18, 0.19, 0.07, 24]} />
            </mesh>
            {/* Vertical stem */}
            <mesh position={[0, h * 0.45, -d * 0.32]} material={primaryMat} castShadow>
              <cylinderGeometry args={[0.016, 0.02, h * 0.85, 12]} />
            </mesh>
            {/* Horizontal boom */}
            <mesh position={[0, h - 0.12, -d * 0.04]} rotation={[Math.PI / 2.3, 0, 0]} material={primaryMat} castShadow>
              <cylinderGeometry args={[0.014, 0.016, d * 0.65, 12]} />
            </mesh>
            {/* Drum shade */}
            <mesh position={[0, h - 0.25, d * 0.22]} material={shadeMat} castShadow>
              <cylinderGeometry args={[0.18, 0.24, 0.22, 24, 1, true]} />
            </mesh>
            {isLit && (
              <pointLight
                position={[0, h - 0.32, d * 0.22]}
                color="#FFD9A0"
                intensity={2.2}
                distance={5.5}
                decay={2}
              />
            )}
          </group>
        );
      }

      case 'lamp-table': {
        const shadeMat = new THREE.MeshStandardMaterial({
          color: '#EFE9DC',
          roughness: 0.85,
          emissive: isLit ? new THREE.Color('#FFD28E') : new THREE.Color('#000000'),
          emissiveIntensity: isLit ? 1.0 : 0,
        });
        return (
          <group>
            <mesh position={[0, 0.13, 0]} material={primaryMat} castShadow>
              <cylinderGeometry args={[0.06, 0.09, 0.26, 20]} />
            </mesh>
            <mesh position={[0, 0.27, 0]} material={ceramicMat}>
              <cylinderGeometry args={[0.015, 0.015, 0.05, 10]} />
            </mesh>
            <mesh position={[0, 0.39, 0]} material={shadeMat} castShadow>
              <cylinderGeometry args={[0.11, 0.16, 0.22, 24]} />
            </mesh>
            {isLit && (
              <pointLight
                position={[0, 0.36, 0]}
                color="#FFD494"
                intensity={1.3}
                distance={3.6}
                decay={2}
              />
            )}
          </group>
        );
      }

      case 'lamp-pendant': {
        const diffuserMat = new THREE.MeshStandardMaterial({
          color: '#FFF5E0',
          roughness: 0.25,
          emissive: isLit ? new THREE.Color('#FFE0AA') : new THREE.Color('#000000'),
          emissiveIntensity: isLit ? 1.3 : 0,
        });
        return (
          <group>
            {/* Suspension rods */}
            <mesh position={[-w * 0.35, h * 0.52, 0]} material={primaryMat}>
              <cylinderGeometry args={[0.008, 0.008, h * 0.9, 8]} />
            </mesh>
            <mesh position={[w * 0.35, h * 0.52, 0]} material={primaryMat}>
              <cylinderGeometry args={[0.008, 0.008, h * 0.9, 8]} />
            </mesh>
            {/* Linear brass housing + LED diffuser */}
            <mesh position={[0, 0.05, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[w, 0.05, 0.06]} />
            </mesh>
            <mesh position={[0, 0.02, 0]} material={diffuserMat}>
              <boxGeometry args={[w - 0.04, 0.03, 0.048]} />
            </mesh>
            {isLit && (
              <pointLight
                position={[0, -0.08, 0]}
                color="#FFE2B3"
                intensity={2.4}
                distance={6.0}
                decay={2}
              />
            )}
          </group>
        );
      }

      case 'plant-fiddle-fig':
      case 'plant-olive-pot': {
        const isTall = item.catalogId === 'plant-fiddle-fig';
        const potH = isTall ? 0.38 : 0.28;
        const potR = isTall ? 0.19 : 0.15;
        return (
          <group>
            {/* Ceramic pot */}
            <mesh position={[0, potH / 2, 0]} material={ceramicMat} castShadow receiveShadow>
              <cylinderGeometry args={[potR, potR * 0.78, potH, 20]} />
            </mesh>
            {/* Soil */}
            <mesh position={[0, potH - 0.02, 0]} material={woodDarkMat}>
              <cylinderGeometry args={[potR * 0.9, potR * 0.9, 0.03, 18]} />
            </mesh>
            {/* Trunk */}
            <mesh position={[0, potH + (h - potH) * 0.42, 0]} material={woodDarkMat} castShadow>
              <cylinderGeometry args={[0.015, 0.026, (h - potH) * 0.82, 8]} />
            </mesh>
            {/* Clustered leaf canopy */}
            {[
              [0, h * 0.85, 0, isTall ? 0.24 : 0.17],
              [-0.14, h * 0.74, 0.1, isTall ? 0.18 : 0.13],
              [0.14, h * 0.78, -0.08, isTall ? 0.19 : 0.13],
              [0.06, h * 0.64, 0.14, isTall ? 0.16 : 0.11],
              [-0.1, h * 0.68, -0.12, isTall ? 0.17 : 0.12],
            ].map(([lx, ly, lz, lr], i) => (
              <mesh key={i} position={[lx, ly, lz]} material={primaryMat} castShadow>
                <dodecahedronGeometry args={[lr, 1]} />
              </mesh>
            ))}
          </group>
        );
      }

      case 'decor-area-rug': {
        return (
          <group>
            <mesh position={[0, 0.012, 0]} material={primaryMat} receiveShadow>
              <boxGeometry args={[w, 0.024, d]} />
            </mesh>
            <mesh position={[0, 0.014, 0]} material={ceramicMat} receiveShadow>
              <boxGeometry args={[w - 0.18, 0.026, d - 0.18]} />
            </mesh>
            <mesh position={[0, 0.016, 0]} material={primaryMat} receiveShadow>
              <boxGeometry args={[w - 0.26, 0.028, d - 0.26]} />
            </mesh>
          </group>
        );
      }

      case 'decor-wall-mirror': {
        return (
          <group>
            <mesh position={[0, h / 2, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            <mesh position={[0, h / 2, d / 2 + 0.004]} material={mirrorMat}>
              <boxGeometry args={[w - 0.06, h - 0.06, 0.01]} />
            </mesh>
          </group>
        );
      }

      case 'decor-sculpture-pedestal': {
        return (
          <group>
            <mesh position={[0, (h * 0.72) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h * 0.72, d]} />
            </mesh>
            <mesh position={[0, h * 0.72 + 0.14, 0]} material={ceramicMat} castShadow>
              <cylinderGeometry args={[0.07, 0.12, 0.28, 20]} />
            </mesh>
            <mesh position={[0, h * 0.72 + 0.3, 0]} material={ceramicMat} castShadow>
              <cylinderGeometry args={[0.045, 0.06, 0.08, 16]} />
            </mesh>
          </group>
        );
      }

      case 'kitchen-island': {
        return (
          <group>
            {/* Walnut cabinet core */}
            <mesh position={[0, (h - 0.05) / 2, 0]} material={ceramicMat} castShadow receiveShadow>
              <boxGeometry args={[w - 0.08, h - 0.05, d - 0.12]} />
            </mesh>
            {/* Waterfall marble top & sides */}
            <mesh position={[0, h - 0.025, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, 0.05, d]} />
            </mesh>
            <mesh position={[-w / 2 + 0.025, h / 2, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[0.05, h, d]} />
            </mesh>
            <mesh position={[w / 2 - 0.025, h / 2, 0]} material={primaryMat} castShadow>
              <boxGeometry args={[0.05, h, d]} />
            </mesh>
            {/* Inset sink basin + brass faucet */}
            <mesh position={[-w * 0.18, h - 0.01, -0.04]} material={steelMat}>
              <boxGeometry args={[0.62, 0.03, 0.42]} />
            </mesh>
            <mesh position={[-w * 0.18, h + 0.14, -0.28]} material={brassMat} castShadow>
              <cylinderGeometry args={[0.015, 0.018, 0.28, 12]} />
            </mesh>
            <mesh position={[-w * 0.18, h + 0.27, -0.19]} rotation={[Math.PI / 2, 0, 0]} material={brassMat}>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 12]} />
            </mesh>
          </group>
        );
      }

      case 'kitchen-counter-run': {
        return (
          <group>
            {/* Lower cabinetry */}
            <mesh position={[0, (h - 0.05) / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h - 0.05, d]} />
            </mesh>
            {/* Marble countertop */}
            <mesh position={[0, h - 0.025, 0]} material={ceramicMat} castShadow receiveShadow>
              <boxGeometry args={[w + 0.02, 0.05, d + 0.02]} />
            </mesh>
            {/* Induction cooktop */}
            <mesh position={[0.25, h + 0.005, 0]} material={darkInnerMat}>
              <boxGeometry args={[0.74, 0.012, 0.5]} />
            </mesh>
            {/* Oven front */}
            <mesh position={[0.25, 0.45, d / 2 + 0.008]} material={darkInnerMat}>
              <boxGeometry args={[0.66, 0.56, 0.02]} />
            </mesh>
            <mesh position={[0.25, 0.68, d / 2 + 0.03]} material={steelMat}>
              <boxGeometry args={[0.56, 0.02, 0.03]} />
            </mesh>
          </group>
        );
      }

      case 'kitchen-fridge': {
        return (
          <group>
            <mesh position={[0, h / 2, 0]} material={primaryMat} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            {/* Door seams */}
            <mesh position={[0, h * 0.65, d / 2 + 0.006]} material={darkInnerMat}>
              <boxGeometry args={[0.012, h * 0.64, 0.012]} />
            </mesh>
            <mesh position={[0, h * 0.32, d / 2 + 0.006]} material={darkInnerMat}>
              <boxGeometry args={[w - 0.02, 0.014, 0.012]} />
            </mesh>
            {/* Handles */}
            <mesh position={[-0.06, h * 0.65, d / 2 + 0.028]} material={steelMat}>
              <cylinderGeometry args={[0.01, 0.01, 0.68, 10]} />
            </mesh>
            <mesh position={[0.06, h * 0.65, d / 2 + 0.028]} material={steelMat}>
              <cylinderGeometry args={[0.01, 0.01, 0.68, 10]} />
            </mesh>
          </group>
        );
      }

      default:
        return (
          <mesh position={[0, h / 2, 0]} material={primaryMat} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        );
    }
  };

  return (
    <group scale={item.scale}>
      {renderModel()}
      {/* Selection / Collision Bounding Box Indicator */}
      {(isSelected || hasConflict) && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.04, h + 0.04, d + 0.04]} />
          <meshBasicMaterial
            color={hasConflict ? '#EF4444' : '#D9A05B'}
            wireframe
            transparent
            opacity={hasConflict ? 0.85 : 0.72}
          />
        </mesh>
      )}
    </group>
  );
};
