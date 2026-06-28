import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import TodoDetail from './pages/TodoDetail';
import AppLoader from './components/AppLoader';

function App() {
  const location = useLocation();

  // Enforce dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <AppLoader>
      <div key={location.pathname} className="page-transition-wrapper">
        <Routes location={location}>
          <Route element={<WorkspaceLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/todos/:id" element={<TodoDetail />} />
          </Route>
        </Routes>
      </div>
    </AppLoader>
  );
}

export default App;
