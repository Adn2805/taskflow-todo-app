import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CommandPalette from '../components/CommandPalette';

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`workspace ${sidebarOpen ? 'workspace__sidebar-open' : 'workspace__sidebar-closed'}`}>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`workspace__sidebar-overlay ${sidebarOpen ? 'workspace__sidebar-overlay--active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className="workspace__main">
        <header className="workspace__topbar">
          <button className="workspace__sidebar-toggle" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          <div className="workspace__breadcrumbs">
            <span className="workspace__breadcrumb-item">Workspace</span>
            <span className="workspace__breadcrumb-separator">/</span>
            <span className="workspace__breadcrumb-current">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname.startsWith('/todos') ? 'Inbox' : 'Task'}
            </span>
          </div>

          <div className="workspace__topbar-actions">
            <button className="workspace__search-btn" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search</span>
              <kbd>Ctrl K</kbd>
            </button>
          </div>
        </header>

        <div className="workspace__content">
          <Outlet />
        </div>
      </main>
      
      <CommandPalette />
    </div>
  );
}
