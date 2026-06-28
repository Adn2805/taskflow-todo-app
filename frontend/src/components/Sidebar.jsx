import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Search, Settings, PanelLeftClose, ChevronRight, Activity, CalendarDays, CheckCircle2 } from 'lucide-react';
import ActivityHeatmap from './ActivityHeatmap';

function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const search = location.search;

  if (!isOpen) {
    return (
      <aside className="sidebar sidebar--collapsed">
        <button className="sidebar__toggle-expand" onClick={onToggle}>
          <PanelLeftClose size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Activity size={18} strokeWidth={2.5} />
        </div>
        <span className="sidebar__title">TaskFlow</span>
      </div>

      <div className="sidebar__scroll-area">
        <div className="sidebar__section">
          <div className="sidebar__section-title">Views</div>
          <nav className="sidebar__nav">
            <NavLink to="/" className={({ isActive }) => `sidebar__nav-link nav-item ${isActive ? 'sidebar__nav-link--active active' : ''}`} end>
              <LayoutDashboard size={16} className="sidebar__nav-icon" />
              Dashboard
            </NavLink>
            <NavLink to="/todos" className={({ isActive }) => `sidebar__nav-link nav-item ${isActive && !search.includes('filter=') ? 'sidebar__nav-link--active active' : ''}`} end>
              <Inbox size={16} className="sidebar__nav-icon" />
              Smart Inbox
            </NavLink>
          </nav>
        </div>

        <div className="sidebar__section">
          <div className="sidebar__section-title">Lists</div>
          <nav className="sidebar__nav">
            <NavLink to="/todos?filter=today" className={() => `sidebar__nav-link nav-item ${search.includes('filter=today') ? 'sidebar__nav-link--active active' : ''}`}>
              <CalendarDays size={16} className="sidebar__nav-icon" style={{color: '#ef4444'}} />
              Today
            </NavLink>
            <NavLink to="/todos?filter=upcoming" className={() => `sidebar__nav-link nav-item ${search.includes('filter=upcoming') ? 'sidebar__nav-link--active active' : ''}`}>
              <CalendarDays size={16} className="sidebar__nav-icon" style={{color: '#f59e0b'}} />
              Upcoming
            </NavLink>
            <NavLink to="/todos?filter=completed" className={() => `sidebar__nav-link nav-item ${search.includes('filter=completed') ? 'sidebar__nav-link--active active' : ''}`}>
              <CheckCircle2 size={16} className="sidebar__nav-icon" style={{color: '#10b981'}} />
              Completed
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="sidebar__footer">
        <ActivityHeatmap />
      </div>
    </aside>
  );
}

export default Sidebar;
