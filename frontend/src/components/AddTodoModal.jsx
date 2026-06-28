import { useState, useEffect, useRef } from 'react';

function AddTodoModal({ isOpen, onClose, onSubmit, editingTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTodo) {
        setTitle(editingTodo.title || '');
        setDescription(editingTodo.description || '');
        setPriority(editingTodo.priority || 'medium');
        setDueDate(editingTodo.due_date || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, editingTodo]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
    });

    onClose();
  };

  return (
    <div className="modal__overlay" onClick={handleOverlayClick}>
      <div className="modal__content">
        <div className="modal__header">
          <h2 className="modal__title">
            {editingTodo ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="modal__field">
              <label className="modal__label" htmlFor="todo-title">
                Title <span style={{ color: 'var(--priority-high)' }}>*</span>
              </label>
              <input
                ref={titleRef}
                id="todo-title"
                className="modal__input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="todo-description">
                Description
              </label>
              <textarea
                id="todo-description"
                className="modal__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
              />
            </div>

            <div className="modal__field">
              <label className="modal__label">Priority</label>
              <div className="modal__priority-selector">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`modal__priority-option modal__priority-option--${p} ${
                      priority === p ? 'modal__priority-option--selected' : ''
                    }`}
                    onClick={() => setPriority(p)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="todo-due-date">
                Due Date
              </label>
              <input
                id="todo-due-date"
                className="modal__input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal__btn modal__btn--submit" disabled={!title.trim()}>
              {editingTodo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTodoModal;
