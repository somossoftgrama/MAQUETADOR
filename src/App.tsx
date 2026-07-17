import { useState, useEffect } from 'react';
import { Toolbar } from '@/components/Layout/Toolbar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { PreviewCanvas } from '@/components/PreviewCanvas';
import { useDocumentStore } from '@/store/documentStore';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageCount = useDocumentStore((s) => s.pageCount);

  useEffect(() => {
    if (useDocumentStore.getState().darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
        input?.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (pageCount === 0) {
      setSidebarOpen(true);
    }
  }, [pageCount]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden relative">
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden shrink-0`}
        >
          <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        </div>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-10 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Abrir panel de configuración"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
        <main className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
          <PreviewCanvas />
        </main>
      </div>
    </div>
  );
}

export default App;
