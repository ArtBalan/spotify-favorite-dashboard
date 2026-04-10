import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";

import ArtistsPage from "./pages/ArtistsPage";
import GenresPage from "./pages/GenresPage";
import PopularityPage from "./pages/PopularityPage";
import DurationPage from "./pages/DurationPage";
import YearsPage from "./pages/YearsPage";
import PerYearsPage from "./pages/PerYearsPage";
import { hasData } from "./lib/parseCsv";
import MissingData from "./components/MissingData";
import ActivityPage from "./pages/ActivityPage";
import AlbumsPage from "./pages/AlbumPage";
import ExplicitPage from "./pages/ExplicitPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import FavoritesPage from "./pages/FavoritesPage";
import DecadesPage from "./pages/DecadesPage";

export default function App() {
  if (!hasData()) return <MissingData />;
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/artists"    element={<ArtistsPage />} />
          <Route path="/genres"     element={<GenresPage />} />
          <Route path="/popularity" element={<PopularityPage />} />
          <Route path="/duration"   element={<DurationPage />} />
          <Route path="/years"      element={<YearsPage />} />
          <Route path="/perYears"   element={<PerYearsPage />} />
          <Route path="/activity"   element={<ActivityPage />} />
          <Route path="/albums"     element={<AlbumsPage />} />
          <Route path="/explicit"   element={<ExplicitPage />} />
          <Route path="/discovery"  element={<DiscoveryPage />} />
          <Route path="/favorites"  element={<FavoritesPage />} />
          <Route path="/decades"    element={<DecadesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}