import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ReviewPage } from "./pages/ReviewPage";
import { BrowsePage } from "./pages/BrowsePage";
import { CramPage } from "./pages/CramPage";
import { CheatSheetPage } from "./pages/CheatSheetPage";
import { StatsPage } from "./pages/StatsPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ReviewPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="cram" element={<CramPage />} />
          <Route path="cheatsheet" element={<CheatSheetPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
