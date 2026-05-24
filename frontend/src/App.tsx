import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ProjectionFormPage from './pages/ProjectionFormPage';
import ProjectionResultsPage from './pages/ProjectionResultsPage';
import ProjectionEditPage from './pages/ProjectionEditPage';
import LoginPage from './pages/LoginPage';
import { useTheme } from './context/ThemeContext';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <a href="/" className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-800 transition-all">
              Propjection
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Real Estate Projection Tool</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, <span className="font-semibold text-gray-900 dark:text-white">{user.username}</span>
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary p-2.5"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Routes>
          <Route path="/" element={<PropertiesPage />} />
          <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
          <Route path="/properties/:propertyId/projections/new" element={<ProjectionFormPage />} />
          <Route path="/properties/:propertyId/projections/:projectionId" element={<ProjectionResultsPage />} />
          <Route path="/properties/:propertyId/projections/:projectionId/edit" element={<ProjectionEditPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
