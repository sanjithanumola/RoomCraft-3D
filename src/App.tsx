import { useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudioEditor } from './components/editor/StudioEditor';
import { useStudioStore } from './store/useStudioStore';

export default function App() {
  const view = useStudioStore((s) => s.view);
  const initProjects = useStudioStore((s) => s.initProjects);

  useEffect(() => {
    void initProjects();
  }, [initProjects]);

  return view === 'editor' ? <StudioEditor /> : <Dashboard />;
}
