import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';

const API_BASE = '/api/todos';

function TodoList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter') || 'all';

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const searchRef = useRef(null);

  const fetchTodos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (urlFilter === 'active' || urlFilter === 'today' || urlFilter === 'upcoming') params.set('status', 'pending');
      if (urlFilter === 'completed') params.set('status', 'completed');

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setTodos(json.data);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [searchQuery, priorityFilter, urlFilter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if (e.key === 'n' && !isInputFocused && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setEditingTodo(null);
        setShowModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTodo = async (todoData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTodos();
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleEditTodo = async (todoData) => {
    if (!editingTodo) return;
    try {
      const res = await fetch(`${API_BASE}/${editingTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTodos();
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleToggle = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTodos();
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setShowModal(true);
  };

  const handleModalSubmit = (data) => {
    if (editingTodo) {
      handleEditTodo(data);
    } else {
      handleAddTodo(data);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTodo(null);
  };

  // Compute stats from all todos (not filtered)
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.status === 'completed').length;
  const pendingCount = todos.filter((t) => t.status === 'pending').length;

  const todayStr = new Date().toISOString().split('T')[0];

  const displayTodos = todos.filter(t => {
    if (urlFilter === 'today') {
      return t.due_date && t.due_date.startsWith(todayStr);
    }
    if (urlFilter === 'upcoming') {
      return t.due_date && t.due_date > todayStr;
    }
    return true; // Other filters are handled by the backend
  });

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  const priorityFilters = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header__title">Tasks</h1>
        <p className="page-header__subtitle">
          Manage and organize your workflow
        </p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-bar__card">
          <div className="stats-bar__number">{totalCount}</div>
          <div className="stats-bar__label">Total Tasks</div>
        </div>
        <div className="stats-bar__card stats-bar__card--completed">
          <div className="stats-bar__number">{completedCount}</div>
          <div className="stats-bar__label">Completed</div>
        </div>
        <div className="stats-bar__card stats-bar__card--pending">
          <div className="stats-bar__number">{pendingCount}</div>
          <div className="stats-bar__label">Pending</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar__section">
          <span className="toolbar__section-label">Status</span>
          {statusFilters.map((f) => (
            <button
              key={f.key}
              className={`toolbar__filter-btn ${
                urlFilter === f.key ? 'toolbar__filter-btn--active' : ''
              }`}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                if (f.key === 'all') newParams.delete('filter');
                else newParams.set('filter', f.key);
                setSearchParams(newParams);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="toolbar__section">
          <span className="toolbar__section-label">Priority</span>
          {priorityFilters.map((f) => (
            <button
              key={f.key}
              className={`toolbar__filter-btn ${
                priorityFilter === f.key ? 'toolbar__filter-btn--active' : ''
              }`}
              onClick={() => setPriorityFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="toolbar__search-wrapper">
          <svg className="toolbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            className="toolbar__search"
            type="text"
            placeholder='Search tasks... (press "/")'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="toolbar__add-btn"
          onClick={() => {
            setEditingTodo(null);
            setShowModal(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      {/* Todo List */}
      {loading ? (
        <div className="loading">
          <div className="loading__skeleton" />
          <div className="loading__skeleton" />
          <div className="loading__skeleton" />
          <div className="loading__skeleton--sm loading__skeleton" />
        </div>
      ) : todos.length === 0 ? (
        <div className="todo-list__empty">
          {/* Empty State SVG Illustration */}
          <svg className="todo-list__empty-icon" viewBox="0 0 120 120" fill="none">
            {/* Clipboard body */}
            <rect x="25" y="20" width="70" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Clipboard clip */}
            <rect x="42" y="12" width="36" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="60" cy="20" r="3" fill="currentColor" opacity="0.3" />
            {/* Check lines */}
            <line x1="40" y1="50" x2="52" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <line x1="58" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
            <line x1="40" y1="65" x2="52" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <line x1="58" y1="65" x2="75" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
            <line x1="40" y1="80" x2="52" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <line x1="58" y1="80" x2="70" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
            {/* Checkmark overlay */}
            <circle cx="80" cy="85" r="18" fill="var(--accent-primary)" opacity="0.15" />
            <polyline points="72,85 78,91 90,79" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
          </svg>
          <h3 className="todo-list__empty-title">No tasks found</h3>
          <p className="todo-list__empty-text">
            {urlFilter !== 'all' || priorityFilter !== 'all' || searchQuery
              ? 'Try adjusting your filters or search query'
              : 'Create your first task to get started'}
          </p>
          <button
            className="todo-list__empty-btn"
            onClick={() => {
              setEditingTodo(null);
              setShowModal(true);
            }}
          >
            Create a Task
          </button>
        </div>
      ) : (
        <div className="todo-list">
          {displayTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddTodoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingTodo={editingTodo}
      />
    </div>
  );
}

export default TodoList;
