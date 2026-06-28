import { useState } from 'react';
import { Calendar, Check, Trash2, Edit3 } from 'lucide-react';

function TodoItem({ todo, onToggle, onDelete, onEdit, index = 0 }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 250);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(todo);
  };

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(todo.id, todo.status === 'completed' ? 'pending' : 'completed');
  };

  return (
    <div 
      className={`todo-item priority-${todo.priority} ${todo.status === 'completed' ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleToggle}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <button
          className={`todo-checkbox ${todo.status === 'completed' ? 'checked' : ''}`}
          onClick={handleToggle}
          type="button"
          aria-label={todo.status === 'completed' ? "Mark as pending" : "Mark as completed"}
        >
          {todo.status === 'completed' && <Check size={14} color="white" strokeWidth={3} />}
        </button>

        <div style={{ flex: 1 }}>
          <div className={`todo-title ${todo.status === 'completed' ? 'completed' : ''}`} style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
            {todo.title}
          </div>
          {todo.description && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
              {todo.description}
            </div>
          )}
          
          <div className="todo-meta">
            <span className={`filter-pill filter-pill--priority-${todo.priority}`}>
              {todo.priority}
            </span>
            {todo.due_date && (
              <span className="todo-due">
                <Calendar size={12} />
                {new Date(todo.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }} className="todo-actions">
          <button className="icon-btn" onClick={handleEdit} aria-label="Edit task">
            <Edit3 size={16} />
          </button>
          <button className="icon-btn" onClick={handleDelete} aria-label="Delete task">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
