import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function AddTodoModal({ isOpen, onClose, onSubmit, editingTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTodo) {
        setTitle(editingTodo.title);
        setDescription(editingTodo.description || '');
        setPriority(editingTodo.priority);
        setDueDate(editingTodo.due_date ? editingTodo.due_date.split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
      setIsClosing(false);
      setIsSubmitting(false);
    }
  }, [isOpen, editingTodo]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
    });
    
    handleClose();
  };

  return (
    <div className={`modal__overlay modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        className={`modal__content modal-content ${isClosing ? 'closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">
            {editingTodo ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="modal__close" onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            
            <div className="floating-field">
              <input
                autoFocus
                id="title"
                className="floating-input"
                type="text"
                placeholder=" "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label className="floating-label" htmlFor="title">Task Title</label>
            </div>

            <div className="floating-field">
              <textarea
                id="description"
                className="floating-textarea"
                placeholder=" "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label className="floating-label" htmlFor="description">Description (optional)</label>
            </div>

            <div className="modal__field modal-form__group">
              <label className="modal__label" style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>Priority</label>
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

            <div className="floating-field" style={{ marginTop: '16px' }}>
              <input
                id="todo-due-date"
                className="floating-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <label className="floating-label" htmlFor="todo-due-date">Due Date</label>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingTodo ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTodoModal;
