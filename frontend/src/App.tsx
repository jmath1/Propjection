import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ProjectionFormPage from './pages/ProjectionFormPage';
import ProjectionResultsPage from './pages/ProjectionResultsPage';
import ProjectionEditPage from './pages/ProjectionEditPage';
import { useTheme } from './context/ThemeContext';

function AppContent() {
  const { theme, toggleTheme } = useTheme();

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
