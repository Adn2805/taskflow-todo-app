import { useState, useEffect } from 'react';
import { Target, Activity as ActivityIcon, CheckCircle, TrendingUp, TrendingDown, Clock, Bell, Sparkles } from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(json => {
        if (json.success) setTodos(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (id, newStatus) => {
    setTodos(todos.map(t => t.id === id ? { ...t, status: newStatus } : t));
    fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  const handleModalSubmit = async (todoData) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      const json = await res.json();
      if (json.success) {
        setTodos([json.data, ...todos]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTodos = todos.filter(t => t.status === 'pending');
  const todayFocus = pendingTodos.filter(t => t.due_date && t.due_date.startsWith(todayStr));
  const upcomingDeadlines = pendingTodos.filter(t => t.due_date && t.due_date > todayStr).sort((a,b) => a.due_date.localeCompare(b.due_date)).slice(0, 3);
  
  const highPriority = pendingTodos.filter(t => t.priority === 'high').length;
  const totalCompleted = todos.filter(t => t.status === 'completed').length;
  
  const completionTrend = totalCompleted > 5 ? 12 : -3;

  if (loading) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="skeleton skeleton-title" style={{ width: '200px', height: '32px', marginBottom: '32px' }} />
        <div className="dashboard__grid">
          <div className="dashboard__col-main">
            <div className="skeleton skeleton-card" style={{ height: '300px' }} />
            <div className="skeleton skeleton-card" style={{ height: '200px' }} />
          </div>
          <div className="dashboard__col-side">
            <div className="skeleton skeleton-card" style={{ height: '150px' }} />
            <div className="skeleton skeleton-card" style={{ height: '250px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Overview</h1>
        <div className="dashboard__actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Sparkles size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__col-main">
          
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              <Target size={18} color="#f59e0b" />
              Today's Focus
            </h2>
            {todayFocus.length > 0 ? (
              <div className="todo-list">
                {todayFocus.map((todo, i) => (
                  <TodoItem key={todo.id} todo={todo} index={i} onToggle={handleToggle} onDelete={() => {}} onEdit={() => {}} />
                ))}
              </div>
            ) : (
              <div className="dashboard__empty-state">
                <div className="empty-icon-circle">
                  <CheckCircle size={24} color="#10b981" />
                </div>
                <h3>Clear Skies</h3>
                <p>You have no tasks due today. Enjoy the moment or get ahead on upcoming work.</p>
              </div>
            )}
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              <ActivityIcon size={18} color="#6366f1" />
              Productivity Streak
            </h2>
            <div className="dashboard__card dashboard__card--heatmap">
              <ActivityHeatmap />
            </div>
          </section>
          
        </div>

        <div className="dashboard__col-side">
          
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Insights</h2>
            <div className="dashboard__card dashboard__analytics-card">
              
              <div className="insight-metric">
                <div className="insight-metric__header">
                  <span className="insight-metric__label">Completed Tasks</span>
                  <div className={`insight-metric__trend ${completionTrend >= 0 ? 'positive' : 'negative'}`}>
                    {completionTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(completionTrend)}%
                  </div>
                </div>
                <div className="insight-metric__value">{totalCompleted}</div>
              </div>

              <div className="insight-metric">
                <div className="insight-metric__header">
                  <span className="insight-metric__label">High Priority Pending</span>
                </div>
                <div className="insight-metric__value" style={{ color: highPriority > 0 ? '#ef4444' : 'inherit' }}>
                  {highPriority}
                </div>
              </div>

            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              <Bell size={18} color="#8b5cf6" />
              Upcoming Deadlines
            </h2>
            <div className="dashboard__card upcoming-list">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(t => (
                  <div key={t.id} className="upcoming-item">
                    <span className="upcoming-item-title">{t.title}</span>
                    <span className="upcoming-item-date">
                      <Clock size={12} />
                      {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="dashboard__empty-state dashboard__empty-state--small">
                  No upcoming deadlines.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      <AddTodoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        editingTodo={null}
      />
    </div>
  );
}
