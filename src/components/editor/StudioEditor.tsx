import React, { useEffect } from 'react';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { StudioViewport } from '../three/StudioViewport';
import { BottomStatusBar } from './BottomStatusBar';
import { ContextMenu } from './ContextMenu';
import { ExportModal } from './ExportModal';
import { FloorPlan2D } from './FloorPlan2D';
import { LeftSidebar } from './LeftSidebar';
import { RightInspector } from './RightInspector';
import { TopToolbar } from './TopToolbar';

export const StudioEditor: React.FC = () => {
  const activeProject = useStudioStore((s) => s.activeProject);
  const viewportMode = useStudioStore((s) => s.viewportMode);
  const leftSidebarOpen = useStudioStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useStudioStore((s) => s.rightSidebarOpen);
  const setLeftSidebarOpen = useStudioStore((s) => s.setLeftSidebarOpen);
  const setRightSidebarOpen = useStudioStore((s) => s.setRightSidebarOpen);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      const state = useStudioStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        state.undo();
        return;
      }
      if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        state.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void state.saveNow();
        return;
      }

      const sel = state.selectedFurnitureId;
      if (!sel) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        state.removeFurniture(sel);
      } else if (e.key.toLowerCase() === 'r' && !mod) {
        state.rotateFurniture90(sel);
      } else if (e.key.toLowerCase() === 'd' && mod) {
        e.preventDefault();
        state.duplicateFurniture(sel);
      } else if (e.key === 'Escape') {
        state.selectFurniture(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!activeProject) return null;

  const themeClass =
    activeProject.theme === 'graphite'
      ? 'theme-graphite'
      : activeProject.theme === 'studio-light'
      ? 'theme-studio-light'
      : '';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-[#0C0E12] text-[#F1F3F5] ${themeClass}`}>
      <TopToolbar />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {leftSidebarOpen ? (
          <div className="no-print h-full">
            <LeftSidebar />
          </div>
        ) : (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            title="Open Furniture & Room Library"
            className="no-print absolute top-3 left-3 z-20 p-2 rounded-lg bg-[#13161C] border border-white/10 text-[#E5E7EB] hover:text-[#D9A05B] shadow-lg"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Center Viewport */}
        <main className="flex-1 min-w-0 h-full relative flex">
          {(viewportMode === '3d' || viewportMode === 'split') && (
            <div className={viewportMode === 'split' ? 'w-1/2 h-full border-r border-white/10' : 'w-full h-full'}>
              <StudioViewport />
            </div>
          )}
          {(viewportMode === '2d' || viewportMode === 'split') && (
            <div className={viewportMode === 'split' ? 'w-1/2 h-full' : 'w-full h-full'}>
              <FloorPlan2D />
            </div>
          )}
        </main>

        {rightSidebarOpen ? (
          <div className="no-print h-full">
            <RightInspector />
          </div>
        ) : (
          <button
            onClick={() => setRightSidebarOpen(true)}
            title="Open Properties Inspector"
            className="no-print absolute top-3 right-3 z-20 p-2 rounded-lg bg-[#13161C] border border-white/10 text-[#E5E7EB] hover:text-[#D9A05B] shadow-lg"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      <BottomStatusBar />
      <ContextMenu />
      <ExportModal />
    </div>
  );
};
