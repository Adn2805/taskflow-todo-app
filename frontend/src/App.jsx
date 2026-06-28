import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TodoList from './pages/TodoList';
import TodoDetail from './pages/TodoDetail';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskflow-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-layout">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/todos/:id" element={<TodoDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
