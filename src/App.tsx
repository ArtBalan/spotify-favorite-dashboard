import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import OverviewPage from "./pages/OverviewPage";
import ArtistsPage from "./pages/ArtistsPage";
import GenresPage from "./pages/GenresPage";
import PopularityPage from "./pages/PopularityPage";
import DurationPage from "./pages/DurationPage";
import YearsPage from "./pages/YearsPage";
import PerYearsPage from "./pages/PerYearsPage";
import { hasData } from "./lib/parseCsv";
import MissingData from "./components/MissingData";
import ActivityPage from "./pages/ActivityPage";
export default function App() {


  if (!hasData()) return <MissingData />;
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/popularity" element={<PopularityPage />} />
          <Route path="/duration" element={<DurationPage />} />
          <Route path="/years" element={<YearsPage />} />
          <Route path="/perYears" element={<PerYearsPage/>} />
          <Route path="/activity" element={<ActivityPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}