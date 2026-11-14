import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Html,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  TransformControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore } from '../../store/useStudioStore';
import type { CameraAnglePreset, FurnitureInstance, RoomData } from '../../types/studio';
import {
  getWallDistances,
  validateRoomFurniture,
} from '../../utils/geometryValidation';
import { ProceduralFurniture } from './ProceduralFurniture';
import { RoomArchitecture } from './RoomArchitecture';

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersect = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function getPresetPose(
  preset: CameraAnglePreset,
  room: RoomData
): { pos: [number, number, number]; target: [number, number, number] } {
  const cx = room.offsetX;
  const cz = room.offsetZ;
  const span = Math.max(room.width, room.length);

  switch (preset) {
    case 'top':
      return {
        pos: [cx, span * 1.9 + 2, cz + 0.01],
        target: [cx, 0, cz],
      };
    case 'front':
      return {
        pos: [cx, room.height * 0.68, cz + span * 1.25],
        target: [cx, room.height * 0.4, cz],
      };
    case 'corner':
      return {
        pos: [cx + room.width * 0.42, room.height * 0.72, cz + room.length * 0.42],
        target: [cx - room.width * 0.15, room.height * 0.32, cz - room.length * 0.15],
      };
    case 'eye-level':
      return {
        pos: [cx + room.width * 0.28, 1.62, cz + room.length * 0.34],
        target: [cx - 0.3, 1.15, cz - 0.4],
      };
    case 'isometric':
    default:
      return {
        pos: [cx + span * 1.05, span * 0.85 + 1.2, cz + span * 1.05],
        target: [cx, room.height * 0.3, cz],
      };
  }
}

const EnvironmentRig: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new RoomEnvironment();
    const rt = pmrem.fromScene(envScene, 0.04);
    scene.environment = rt.texture;
    envScene.dispose();
    pmrem.dispose();
    return () => {
      rt.dispose();
    };
  }, [gl, scene]);

  return null;
};

const CameraAndScreenshotRig: React.FC<{
  activeRoom: RoomData;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ activeRoom, orbitRef }) => {
  const { camera, gl, scene } = useThree();
  const cameraMode = useStudioStore((s) => s.cameraMode);
  const cameraPreset = useStudioStore((s) => s.cameraPreset);
  const cameraTrigger = useStudioStore((s) => s.cameraTrigger);
  const registerScreenshotCapture = useStudioStore((s) => s.registerScreenshotCapture);

  const animGoal = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(6, 5, 6),
    target: new THREE.Vector3(0, 0.8, 0),
  });

  // Trigger camera glide on preset or room switch
  useEffect(() => {
    if (cameraMode === 'walkthrough') {
      camera.position.set(
        activeRoom.offsetX,
        1.65,
        activeRoom.offsetZ + Math.max(0.5, activeRoom.length * 0.32)
      );
      camera.lookAt(activeRoom.offsetX, 1.5, activeRoom.offsetZ - 1);
      animGoal.current.active = false;
      return;
    }

    const pose = getPresetPose(cameraPreset, activeRoom);
    animGoal.current.pos.set(...pose.pos);
    animGoal.current.target.set(...pose.target);
    animGoal.current.active = true;
  }, [cameraTrigger, cameraMode, cameraPreset, activeRoom, camera]);

  // Cancel scripted glide if user interacts with OrbitControls
  useEffect(() => {
    const controls = orbitRef.current;
    if (!controls) return;
    const cancel = () => {
      animGoal.current.active = false;
    };
    controls.addEventListener('start', cancel);
    return () => {
      controls.removeEventListener('start', cancel);
    };
  }, [orbitRef]);

  // Walkthrough keyboard + mouse look
  const keysPressed = useRef<Record<string, boolean>>({});
  const lookState = useRef({ dragging: false, yaw: 0, pitch: 0 });

  useEffect(() => {
    if (cameraMode !== 'walkthrough') return;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ').setFromQuaternion(camera.quaternion);
    lookState.current.yaw = euler.y;
    lookState.current.pitch = euler.x;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      keysPressed.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const dom = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) lookState.current.dragging = true;
    };
    const onMove = (e: PointerEvent) => {
      if (!lookState.current.dragging) return;
      lookState.current.yaw -= e.movementX * 0.004;
      lookState.current.pitch = Math.max(
        -1.2,
        Math.min(1.2, lookState.current.pitch - e.movementY * 0.004)
      );
    };
    const onUp = () => {
      lookState.current.dragging = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      keysPressed.current = {};
    };
  }, [cameraMode, camera, gl]);

  // Register screenshot capture function
  useEffect(() => {
    registerScreenshotCapture((angle?: CameraAnglePreset) => {
      try {
        const prevPos = camera.position.clone();
        const prevTarget = orbitRef.current?.target.clone();
        if (angle) {
          const pose = getPresetPose(angle, activeRoom);
          camera.position.set(...pose.pos);
          if (orbitRef.current) {
            orbitRef.current.target.set(...pose.target);
            orbitRef.current.update();
          } else {
            camera.lookAt(...pose.target);
          }
        }
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL('image/png');
        if (angle) {
          camera.position.copy(prevPos);
          if (orbitRef.current && prevTarget) {
            orbitRef.current.target.copy(prevTarget);
            orbitRef.current.update();
          }
          gl.render(scene, camera);
        }
        return dataUrl;
      } catch {
        return null;
      }
    });
    return () => registerScreenshotCapture(null);
  }, [registerScreenshotCapture, gl, scene, camera, activeRoom, orbitRef]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (cameraMode === 'walkthrough') {
      camera.rotation.set(lookState.current.pitch, lookState.current.yaw, 0, 'YXZ');
      camera.getWorldDirection(_forward);
      _forward.y = 0;
      _forward.normalize();
      _right.crossVectors(_forward, _up).normalize();

      const speed = 3.2 * dt;
      const k = keysPressed.current;
      if (k['KeyW'] || k['ArrowUp']) camera.position.addScaledVector(_forward, speed);
      if (k['KeyS'] || k['ArrowDown']) camera.position.addScaledVector(_forward, -speed);
      if (k['KeyA'] || k['ArrowLeft']) camera.position.addScaledVector(_right, -speed);
      if (k['KeyD'] || k['ArrowRight']) camera.position.addScaledVector(_right, speed);

      // Keep inside active room bounds with comfortable wall margin
      const halfW = activeRoom.width / 2 - 0.35;
      const halfL = activeRoom.length / 2 - 0.35;
      camera.position.x = Math.max(
        activeRoom.offsetX - halfW,
        Math.min(activeRoom.offsetX + halfW, camera.position.x)
      );
      camera.position.z = Math.max(
        activeRoom.offsetZ - halfL,
        Math.min(activeRoom.offsetZ + halfL, camera.position.z)
      );
      camera.position.y = 1.65;
      return;
    }

    if (animGoal.current.active) {
      const k = 1 - Math.exp(-8 * dt);
      camera.position.lerp(animGoal.current.pos, k);
      if (orbitRef.current) {
        orbitRef.current.target.lerp(animGoal.current.target, k);
        orbitRef.current.update();
      } else {
        camera.lookAt(animGoal.current.target);
      }
      if (camera.position.distanceTo(animGoal.current.pos) < 0.03) {
        animGoal.current.active = false;
      }
    }
  });

  return null;
};

interface DraggableFurnitureProps {
  item: FurnitureInstance;
  room: RoomData;
  isActiveRoom: boolean;
  isSelected: boolean;
  hasConflict: boolean;
  lampGlowEnabled: boolean;
  showMeasurements: boolean;
  transformMode: string;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}

const FurnitureNode: React.FC<DraggableFurnitureProps> = ({
  item,
  room,
  isActiveRoom,
  isSelected,
  hasConflict,
  lampGlowEnabled,
  showMeasurements,
  transformMode,
  orbitRef,
}) => {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const selectFurniture = useStudioStore((s) => s.selectFurniture);
  const switchRoom = useStudioStore((s) => s.switchRoom);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const setIsDraggingFurniture = useStudioStore((s) => s.setIsDraggingFurniture);
  const setContextMenu = useStudioStore((s) => s.setContextMenu);
  const setHoveredFurniture = useStudioStore((s) => s.setHoveredFurniture);

  const dragOffset = useRef(new THREE.Vector3());
  const draggingRef = useRef(false);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!isActiveRoom) {
      switchRoom(room.id);
    }
    selectFurniture(item.id);

    if (e.nativeEvent.button === 2) {
      setContextMenu({
        open: true,
        x: e.nativeEvent.clientX,
        y: e.nativeEvent.clientY,
        furnitureId: item.id,
      });
      return;
    }

    if (transformMode !== 'drag' || item.locked || e.nativeEvent.button !== 0) return;

    // Start direct horizontal plane drag
    pushHistory();
    draggingRef.current = true;
    setIsDraggingFurniture(true);
    if (orbitRef.current) orbitRef.current.enabled = false;

    _plane.constant = -item.position[1];
    const rect = gl.domElement.getBoundingClientRect();
    _ndc.x = ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
    _ndc.y = -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_ndc, camera);
    if (_raycaster.ray.intersectPlane(_plane, _intersect)) {
      dragOffset.current.set(
        room.offsetX + item.position[0] - _intersect.x,
        0,
        room.offsetZ + item.position[2] - _intersect.z
      );
    }

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      const r = gl.domElement.getBoundingClientRect();
      _ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      _ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      if (_raycaster.ray.intersectPlane(_plane, _intersect)) {
        const localX = _intersect.x + dragOffset.current.x - room.offsetX;
        const localZ = _intersect.z + dragOffset.current.z - room.offsetZ;
        updateFurniture(
          item.id,
          { position: [localX, item.position[1], localZ] },
          { recordHistory: false, applySnapAndClamp: true }
        );
      }
    };

    const onUp = () => {
      draggingRef.current = false;
      setIsDraggingFurniture(false);
      if (orbitRef.current) orbitRef.current.enabled = true;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const wallDistances = useMemo(
    () => (isSelected && showMeasurements ? getWallDistances(item, room) : null),
    [isSelected, showMeasurements, item, room]
  );

  const effW = (item.baseSize[0] * item.scale[0]).toFixed(2);
  const effD = (item.baseSize[2] * item.scale[2]).toFixed(2);
  const effH = (item.baseSize[1] * item.scale[1]).toFixed(2);

  if (!item.visible) return null;

  const showGizmo =
    isSelected &&
    isActiveRoom &&
    !item.locked &&
    (transformMode === 'translate' || transformMode === 'rotate' || transformMode === 'scale');

  return (
    <>
      <group
        ref={groupRef}
        position={item.position}
        rotation={[0, item.rotationY, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredFurniture(item.id);
          document.body.style.cursor = item.locked ? 'not-allowed' : 'grab';
        }}
        onPointerOut={() => {
          setHoveredFurniture(null);
          document.body.style.cursor = 'default';
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.nativeEvent.preventDefault();
          selectFurniture(item.id);
          setContextMenu({
            open: true,
            x: e.nativeEvent.clientX,
            y: e.nativeEvent.clientY,
            furnitureId: item.id,
          });
        }}
      >
        <ProceduralFurniture
          item={item}
          lampGlowEnabled={lampGlowEnabled}
          isSelected={isSelected}
          hasConflict={hasConflict}
        />

        {isSelected && showMeasurements && wallDistances && (
          <Html
            position={[0, item.baseSize[1] * item.scale[1] + 0.25, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: 'none' }}
          >
            <div className="rounded-md bg-[#0C0E12]/90 border border-white/15 px-2.5 py-1 text-[11px] font-mono-num text-[#F1F3F5] whitespace-nowrap shadow-lg">
              <div className="font-medium text-[#D9A05B]">
                {effW}m × {effD}m × {effH}m
              </div>
              <div className="text-[10px] text-[#9CA3AF]">
                N {wallDistances.north.toFixed(2)}m · W {wallDistances.west.toFixed(2)}m
              </div>
            </div>
          </Html>
        )}
      </group>

      {showGizmo && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode as 'translate' | 'rotate' | 'scale'}
          showY={transformMode !== 'translate'}
          onMouseDown={() => {
            pushHistory();
            if (orbitRef.current) orbitRef.current.enabled = false;
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
            if (!groupRef.current) return;
            const p = groupRef.current.position;
            const r = groupRef.current.rotation;
            // For scale mode, TransformControls scales the group directly; extract and reset group scale
            const gs = groupRef.current.scale;
            const nextScale: [number, number, number] = [
              Math.max(0.4, Math.min(2.5, item.scale[0] * gs.x)),
              Math.max(0.4, Math.min(2.5, item.scale[1] * gs.y)),
              Math.max(0.4, Math.min(2.5, item.scale[2] * gs.z)),
            ];
            gs.set(1, 1, 1);

            updateFurniture(
              item.id,
              {
                position: [p.x, Math.max(0, p.y), p.z],
                rotationY: r.y,
                scale: nextScale,
              },
              { recordHistory: false, applySnapAndClamp: transformMode === 'translate' }
            );
          }}
        />
      )}
    </>
  );
};

export const StudioViewport: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const selectedFurnitureId = useStudioStore((s) => s.selectedFurnitureId);
  const selectedOpeningId = useStudioStore((s) => s.selectedOpeningId);
  const cameraMode = useStudioStore((s) => s.cameraMode);
  const transformMode = useStudioStore((s) => s.transformMode);
  const cutawayWalls = useStudioStore((s) => s.cutawayWalls);
  const showCeiling = useStudioStore((s) => s.showCeiling);
  const showMeasurements = useStudioStore((s) => s.showMeasurements);
  const showGrid = useStudioStore((s) => s.showGrid);
  const selectFurniture = useStudioStore((s) => s.selectFurniture);
  const selectOpening = useStudioStore((s) => s.selectOpening);
  const addFurniture = useStudioStore((s) => s.addFurniture);
  const setContextMenu = useStudioStore((s) => s.setContextMenu);

  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

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

  // Drag and Drop from Sidebar onto 3D viewport
  const cameraRef = useRef<THREE.Camera | null>(null);
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const catalogId = e.dataTransfer.getData('application/roomcraft-furniture');
      if (!catalogId || !activeRoom) return;

      if (cameraRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        _raycaster.setFromCamera(_ndc, cameraRef.current);
        _plane.constant = 0;
        if (_raycaster.ray.intersectPlane(_plane, _intersect)) {
          addFurniture(catalogId, [
            _intersect.x - activeRoom.offsetX,
            0,
            _intersect.z - activeRoom.offsetZ,
          ]);
          return;
        }
      }
      addFurniture(catalogId, [0, 0, 0]);
    },
    [activeRoom, addFurniture]
  );

  if (!activeProject || !activeRoom) return null;

  const { lighting } = activeProject;
  const isDay = lighting.mode === 'day';
  const bgHex = isDay ? '#161A21' : '#090B0F';

  // Sun cartesian coordinates from azimuth & elevation
  const azRad = THREE.MathUtils.degToRad(lighting.sunAzimuth);
  const elRad = THREE.MathUtils.degToRad(lighting.sunElevation);
  const sunDist = 14;
  const sunX = activeRoom.offsetX + Math.cos(elRad) * Math.sin(azRad) * sunDist;
  const sunY = Math.sin(elRad) * sunDist;
  const sunZ = activeRoom.offsetZ + Math.cos(elRad) * Math.cos(azRad) * sunDist;

  if (contextLost) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0C0E12] text-center p-8">
        <p className="text-base font-medium text-[#F1F3F5]">WebGL Rendering Context Interrupted</p>
        <p className="text-sm text-[#8B949E] mt-1 max-w-md">
          Your browser paused the 3D hardware surface. Click below to re-initialize the studio viewport.
        </p>
        <button
          onClick={() => setContextLost(false)}
          className="mt-4 px-4 py-2 text-sm font-medium bg-[#D9A05B] text-[#0C0E12] rounded-lg hover:bg-[#E5B272] transition-colors"
        >
          Restore 3D Viewport
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ backgroundColor: bgHex }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        shadows={!isSoftwareGl && lighting.shadowsEnabled}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        gl={{
          antialias: !isSoftwareGl,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl, camera }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isDay ? 1.08 : 0.95;
          cameraRef.current = camera;
          gl.domElement.addEventListener('webglcontextlost', (ev) => {
            ev.preventDefault();
            setContextLost(true);
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            setContextLost(false);
          });
        }}
        onPointerMissed={() => {
          selectFurniture(null);
          selectOpening(null);
          setContextMenu({ open: false, x: 0, y: 0, furnitureId: null });
        }}
      >
        <color attach="background" args={[bgHex]} />
        <fog attach="fog" args={[bgHex, 24, 52]} />

        <EnvironmentRig />

        {/* Cameras */}
        {cameraMode === 'orthographic' ? (
          <OrthographicCamera makeDefault zoom={58} position={[activeRoom.offsetX, 14, activeRoom.offsetZ + 0.01]} near={0.1} far={100} />
        ) : (
          <PerspectiveCamera makeDefault fov={48} position={[7, 5.5, 7]} near={0.1} far={120} />
        )}

        {cameraMode !== 'walkthrough' && (
          <OrbitControls
            ref={orbitRef}
            makeDefault
            enableDamping={!isSoftwareGl}
            dampingFactor={0.07}
            minDistance={1.8}
            maxDistance={28}
            maxPolarAngle={Math.PI / 2 - 0.04}
          />
        )}

        <CameraAndScreenshotRig activeRoom={activeRoom} orbitRef={orbitRef} />

        {/* Balanced Studio + Sunlight + Room Ceiling Lighting */}
        <hemisphereLight
          args={[
            isDay ? '#D5E5FA' : '#354463',
            isDay ? '#5A4A3E' : '#1A1C22',
            lighting.ambientIntensity * (isDay ? 1.0 : 0.55),
          ]}
        />

        <directionalLight
          position={[sunX, sunY, sunZ]}
          intensity={isDay ? lighting.sunIntensity : lighting.sunIntensity * 0.25}
          color={isDay ? '#FFF3DF' : '#8BA8D6'}
          castShadow={!isSoftwareGl && lighting.shadowsEnabled}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={35}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        />

        {/* Subtle exterior studio floor plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color={isDay ? '#12151B' : '#080A0D'} roughness={0.95} metalness={0} />
        </mesh>

        {/* Render all rooms (multi-room support!) */}
        {activeProject.rooms.map((room) => {
          const isActive = room.id === activeRoom.id;
          return (
            <group key={room.id}>
              <RoomArchitecture
                room={room}
                isActiveRoom={isActive}
                cutawayWalls={cutawayWalls}
                showCeiling={showCeiling}
                showGrid={showGrid}
                selectedOpeningId={selectedOpeningId}
                onSelectOpening={(id) => selectOpening(id)}
                onFloorPointerDown={(e) => {
                  e.stopPropagation();
                  selectFurniture(null);
                  selectOpening(null);
                  setContextMenu({ open: false, x: 0, y: 0, furnitureId: null });
                }}
              />

              {/* Room Ceiling Light */}
              <pointLight
                position={[room.offsetX, room.height - 0.2, room.offsetZ]}
                color={lighting.ceilingLightColor}
                intensity={lighting.ceilingLightIntensity * (isDay ? 1.1 : 2.1)}
                distance={Math.max(room.width, room.length) * 2.2}
                decay={1.8}
              />

              {/* Room Furniture */}
              <group position={[room.offsetX, 0, room.offsetZ]}>
                {room.furniture.map((item) => (
                  <FurnitureNode
                    key={item.id}
                    item={item}
                    room={room}
                    isActiveRoom={isActive}
                    isSelected={selectedFurnitureId === item.id}
                    hasConflict={isActive && conflicts.has(item.id)}
                    lampGlowEnabled={lighting.lampGlowEnabled}
                    showMeasurements={showMeasurements}
                    transformMode={transformMode}
                    orbitRef={orbitRef}
                  />
                ))}
              </group>
            </group>
          );
        })}
      </Canvas>

      {/* Walkthrough helper banner */}
      {cameraMode === 'walkthrough' && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 rounded-lg bg-[#0C0E12]/90 border border-white/10 px-3.5 py-1.5 text-xs text-[#E5E7EB]">
          Walkthrough Mode · Use <span className="font-mono-num text-[#D9A05B]">WASD / Arrows</span> to walk · Drag mouse to look around
        </div>
      )}
    </div>
  );
};
