import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ProjectionFormPage from './pages/ProjectionFormPage';
import ProjectionResultsPage from './pages/ProjectionResultsPage';
import ProjectionEditPage from './pages/ProjectionEditPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <a href="/" className="text-2xl font-bold text-blue-600">
              Propjection
            </a>
            <p className="text-gray-600 text-sm">Real Estate Projection Tool</p>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PropertiesPage />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
            <Route path="/properties/:propertyId/projections/new" element={<ProjectionFormPage />} />
            <Route path="/properties/:propertyId/projections/:projectionId" element={<ProjectionResultsPage />} />
            <Route path="/properties/:propertyId/projections/:projectionId/edit" element={<ProjectionEditPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
