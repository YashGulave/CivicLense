import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import ScorePage from './pages/ScorePage';
import RightsPage from './pages/RightsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/score" element={<ScorePage />} />
          <Route path="/rights" element={<RightsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
