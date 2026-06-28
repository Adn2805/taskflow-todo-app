import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import AddTodoModal from '../components/AddTodoModal';
import { downloadICS } from '../utils/calendar';

const API_BASE = '/api/todos';

function TodoDetail() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const todoId = paramId || searchParams.get('id');

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchTodo = async () => {
    if (!todoId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${todoId}`);
      const json = await res.json();

      if (json.success) {
        setTodo(json.data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, [todoId]);

  const handleToggleStatus = async () => {
    if (!todo) return;
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTodo();
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleDelete = async () => {
    if (!todo) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        window.dispatchEvent(new Event('activity-updated'));
        navigate('/todos');
      }
    } catch {
      // Handle error silently
    }
  };

  const handleEdit = async (data) => {
    if (!todo) return;

    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTodo();
        window.dispatchEvent(new Event('activity-updated'));
      }
    } catch {
      // Handle error silently
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActivityDotClass = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes('created')) return 'todo-detail__activity-dot--created';
    if (lower.includes('completed')) return 'todo-detail__activity-dot--completed';
    if (lower.includes('reopened')) return 'todo-detail__activity-dot--reopened';
    if (lower.includes('updated')) return 'todo-detail__activity-dot--updated';
    return 'todo-detail__activity-dot--updated';
  };

  if (loading) {
    return (
      <div className="todo-detail">
        <div className="loading">
          <div className="loading__skeleton loading__skeleton--sm" />
          <div className="loading__skeleton loading__skeleton--lg" />
          <div className="loading__skeleton" />
          <div className="loading__skeleton" />
        </div>
      </div>
    );
  }

  if (notFound || !todo) {
    return (
      <div className="not-found">
        <h2 className="not-found__title">Task Not Found</h2>
        <p className="not-found__text">
          The task you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link to="/todos" className="not-found__link">
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="todo-detail">
      {/* Back Button */}
      <Link to="/todos" className="todo-detail__back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Tasks
      </Link>

      {/* Main Card */}
      <div className="todo-detail__card">
        {/* Header */}
        <div className="todo-detail__header">
          <h1 className="todo-detail__title">{todo.title}</h1>
          <div className="todo-detail__badges">
            <span
              className={`todo-detail__badge todo-detail__badge--${todo.status}`}
            >
              {todo.status === 'completed' ? '✓ Completed' : '◐ Pending'}
            </span>
            <span
              className={`todo-detail__badge todo-detail__badge--${todo.priority}`}
            >
              {todo.priority} priority
            </span>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <div className="todo-detail__description">{todo.description}</div>
        )}

        {/* Meta Information */}
        <div className="todo-detail__meta">
          <div className="todo-detail__meta-item">
            <span className="todo-detail__meta-label">Created</span>
            <span className="todo-detail__meta-value">
              {formatDateTime(todo.created_at)}
            </span>
          </div>
          <div className="todo-detail__meta-item">
            <span className="todo-detail__meta-label">Updated</span>
            <span className="todo-detail__meta-value">
              {formatDateTime(todo.updated_at)}
            </span>
          </div>
          {todo.due_date && (
            <div className="todo-detail__meta-item">
              <span className="todo-detail__meta-label">Due Date</span>
              <span className="todo-detail__meta-value">
                {formatDate(todo.due_date)}
              </span>
            </div>
          )}
          <div className="todo-detail__meta-item">
            <span className="todo-detail__meta-label">Status</span>
            <span className="todo-detail__meta-value">
              {todo.status === 'completed' ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="todo-detail__actions">
          <button
            className={`todo-detail__action-btn ${
              todo.status === 'completed'
                ? ''
                : 'todo-detail__action-btn--complete'
            }`}
            onClick={handleToggleStatus}
          >
            {todo.status === 'completed' ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Reopen
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark Complete
              </>
            )}
          </button>

          {todo.due_date && (
            <button
              className="todo-detail__action-btn"
              onClick={() => downloadICS(todo)}
            >
              <CalendarPlus size={16} />
              Add to Calendar
            </button>
          )}

          <button
            className="todo-detail__action-btn"
            onClick={() => setShowEditModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>

          <button
            className="todo-detail__action-btn todo-detail__action-btn--delete"
            onClick={handleDelete}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>

        {/* Activity Log */}
        {todo.activity_log && todo.activity_log.length > 0 && (
          <div className="todo-detail__activity">
            <h2 className="todo-detail__activity-title">Activity Log</h2>
            <div className="todo-detail__timeline">
              {todo.activity_log.map((entry) => (
                <div key={entry.id} className="todo-detail__activity-item">
                  <div
                    className={`todo-detail__activity-dot ${getActivityDotClass(
                      entry.action
                    )}`}
                  />
                  <span className="todo-detail__activity-action">
                    {entry.action}
                  </span>
                  <span className="todo-detail__activity-time">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AddTodoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEdit}
        editingTodo={todo}
      />
    </div>
  );
}

export default TodoDetail;
