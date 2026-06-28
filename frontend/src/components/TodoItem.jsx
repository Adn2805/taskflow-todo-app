import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const isOverdue = todo.due_date
    && todo.status === 'pending'
    && new Date(todo.due_date) < new Date(new Date().toDateString());

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDelete(todo.id);
    }, 300);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggle(todo.id, todo.status === 'completed' ? 'pending' : 'completed');
  };

  const handleTitleClick = () => {
    navigate(`/todos/${todo.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(todo);
  };

  return (
    <div
      className={`todo-item ${
        todo.status === 'completed' ? 'todo-item--completed' : ''
      } ${isExiting ? 'todo-item--exiting' : ''}`}
    >
      {/* Custom Animated Checkbox */}
      <svg
        className="todo-item__checkbox"
        viewBox="0 0 24 24"
        onClick={handleCheckboxClick}
        aria-label={todo.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
      >
        <circle
          className="todo-item__checkbox-circle"
          cx="12"
          cy="12"
          r="10"
        />
        <polyline
          className="todo-item__checkbox-check"
          points="8 12 11 15 16 9"
        />
      </svg>

      {/* Content */}
      <div className="todo-item__content">
        <div
          className="todo-item__title"
          onClick={handleTitleClick}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleClick()}
        >
          {todo.title}
        </div>

        {todo.description && (
          <p className="todo-item__description">{todo.description}</p>
        )}

        <div className="todo-item__meta">
          <span className={`todo-item__priority todo-item__priority--${todo.priority}`}>
            <span className="todo-item__priority-dot" />
            {todo.priority}
          </span>

          {todo.due_date && (
            <span
              className={`todo-item__due-date ${
                isOverdue ? 'todo-item__due-date--overdue' : ''
              }`}
            >
              <svg className="todo-item__due-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="todo-item__actions">
        <button
          className="todo-item__action-btn"
          onClick={handleEditClick}
          aria-label="Edit todo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="todo-item__action-btn todo-item__action-btn--delete"
          onClick={handleDelete}
          aria-label="Delete todo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
