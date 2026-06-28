import { NavLink } from 'react-router-dom';

function Sidebar({ theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="sidebar__title">TaskFlow</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/todos"
          className={({ isActive }) =>
            `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
          }
        >
          <svg className="sidebar__nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          All Tasks
        </NavLink>
      </nav>

      <div className="sidebar__shortcuts">
        <div className="sidebar__shortcut-title">Shortcuts</div>
        <div className="sidebar__shortcut-item">
          <span>Search</span>
          <span className="kbd">/</span>
        </div>
        <div className="sidebar__shortcut-item">
          <span>New Task</span>
          <span className="kbd">N</span>
        </div>
        <div className="sidebar__shortcut-item">
          <span>Close</span>
          <span className="kbd">Esc</span>
        </div>
      </div>

      <div className="sidebar__footer">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
