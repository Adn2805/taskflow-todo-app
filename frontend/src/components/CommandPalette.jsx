import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, LayoutDashboard, Inbox, Calendar } from 'lucide-react';
import AddTodoModal from './AddTodoModal';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const actions = [
    { id: 'create', group: 'Actions', icon: <PlusCircle size={16} />, title: 'Create new task...', action: () => { setIsOpen(false); setShowAddModal(true); } },
    { id: 'dash', group: 'Navigation', icon: <LayoutDashboard size={16} />, title: 'Go to Dashboard', action: () => { navigate('/'); setIsOpen(false); } },
    { id: 'inbox', group: 'Navigation', icon: <Inbox size={16} />, title: 'Go to Smart Inbox', action: () => { navigate('/todos'); setIsOpen(false); } },
    { id: 'today', group: 'Navigation', icon: <Calendar size={16} />, title: 'View Today', action: () => { navigate('/todos?filter=today'); setIsOpen(false); } },
  ];

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  // Group actions for rendering
  const groups = filteredActions.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    }
  };

  const handleAddSubmit = async (data) => {
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    navigate(0); 
  };

  if (!isOpen && !showAddModal) return null;

  return (
    <>
      {isOpen && (
        <div className="command-palette__overlay" onClick={() => setIsOpen(false)}>
          <div className="command-palette__modal" onClick={e => e.stopPropagation()}>
            <div className="command-palette__search-wrapper">
              <Search size={18} className="command-palette__search-icon" />
              <input
                ref={inputRef}
                className="command-palette__input"
                placeholder="Type a command or search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleListKeyDown}
              />
            </div>
            
            <div className="command-palette__list">
              {filteredActions.length > 0 ? (
                Object.entries(groups).map(([groupName, items]) => (
                  <div key={groupName} className="command-palette__group">
                    <div className="command-palette__group-title">{groupName}</div>
                    {items.map((action) => {
                      const globalIndex = filteredActions.indexOf(action);
                      const isSelected = globalIndex === selectedIndex;
                      
                      // Highlight query matches
                      const matchStart = action.title.toLowerCase().indexOf(query.toLowerCase());
                      let highlightedTitle = action.title;
                      if (query && matchStart !== -1) {
                        const before = action.title.slice(0, matchStart);
                        const match = action.title.slice(matchStart, matchStart + query.length);
                        const after = action.title.slice(matchStart + query.length);
                        highlightedTitle = (
                          <>
                            {before}<span className="command-palette__highlight">{match}</span>{after}
                          </>
                        );
                      }

                      return (
                        <div
                          key={action.id}
                          className={`command-palette__item ${isSelected ? 'selected' : ''}`}
                          onClick={action.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <span className="command-palette__item-icon">{action.icon}</span>
                          <span className="command-palette__item-title">{highlightedTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="command-palette__empty">No results found.</div>
              )}
            </div>
            <div className="command-palette__footer">
              <span className="command-palette__hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
              <span className="command-palette__hint"><kbd>Enter</kbd> to select</span>
              <span className="command-palette__hint"><kbd>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}
    </>
  );
}
