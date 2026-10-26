import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import MapOverviewPage from './pages/MapOverviewPage';
import LocationDetailPage from './pages/LocationDetailPage';
import MapPage from './pages/MapPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/map-overview" element={<MapOverviewPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/location" element={<LocationDetailPage />} />
          <Route path="/data-sources" element={<Navigate to="/resources" replace />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:datasetId" element={<ResourceDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
