import React from 'react';
import { Copy, Lock, Magnet, RotateCw, Trash2, Unlock } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export const ContextMenu: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const contextMenu = useStudioStore((s) => s.contextMenu);
  const setContextMenu = useStudioStore((s) => s.setContextMenu);
  const rotateFurniture90 = useStudioStore((s) => s.rotateFurniture90);
  const snapFurnitureToWall = useStudioStore((s) => s.snapFurnitureToWall);
  const duplicateFurniture = useStudioStore((s) => s.duplicateFurniture);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const removeFurniture = useStudioStore((s) => s.removeFurniture);

  if (!contextMenu.open || !contextMenu.furnitureId || !activeProject) return null;

  const room = activeProject.rooms.find((r) => r.id === activeProject.activeRoomId);
  const item = room?.furniture.find((f) => f.id === contextMenu.furnitureId);
  if (!item) return null;

  const close = () => setContextMenu({ open: false, x: 0, y: 0, furnitureId: null });

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={close}
      onContextMenu={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div
        style={{
          left: Math.min(contextMenu.x, window.innerWidth - 200),
          top: Math.min(contextMenu.y, window.innerHeight - 230),
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute w-48 rounded-lg bg-[#1A1E26] border border-white/12 shadow-2xl py-1.5 text-xs text-[#E5E7EB]"
      >
        <div className="px-3 py-1 text-[11px] font-medium text-[#8B949E] truncate border-b border-white/8 mb-1">
          {item.name}
        </div>
        <button
          disabled={item.locked}
          onClick={() => {
            rotateFurniture90(item.id);
            close();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/6 disabled:opacity-40 text-left"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#D9A05B]" />
          Rotate 90°
        </button>
        <button
          disabled={item.locked}
          onClick={() => {
            snapFurnitureToWall(item.id);
            close();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/6 disabled:opacity-40 text-left"
        >
          <Magnet className="w-3.5 h-3.5 text-[#D9A05B]" />
          Snap to Nearest Wall
        </button>
        <button
          onClick={() => {
            duplicateFurniture(item.id);
            close();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/6 text-left"
        >
          <Copy className="w-3.5 h-3.5 text-[#D9A05B]" />
          Duplicate
        </button>
        <button
          onClick={() => {
            updateFurniture(item.id, { locked: !item.locked }, { recordHistory: true });
            close();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/6 text-left"
        >
          {item.locked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-[#D9A05B]" /> Unlock
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-[#D9A05B]" /> Lock Position
            </>
          )}
        </button>
        <div className="my-1 border-t border-white/8" />
        <button
          onClick={() => {
            removeFurniture(item.id);
            close();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-500/15 text-red-300 text-left"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          Delete Object
        </button>
      </div>
    </div>
  );
};
