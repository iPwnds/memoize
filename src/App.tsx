import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ReviewPage } from "./pages/ReviewPage";
import { BrowsePage } from "./pages/BrowsePage";
import { CramPage } from "./pages/CramPage";
import { LearnIndexPage } from "./pages/LearnIndexPage";
import { LearnModulePage } from "./pages/LearnModulePage";
import { CoursesIndexPage } from "./pages/CoursesIndexPage";
import { CoursePage } from "./pages/CoursePage";
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
          <Route path="learn" element={<LearnIndexPage />} />
          <Route path="learn/:moduleSlug" element={<LearnModulePage />} />
          <Route path="courses" element={<CoursesIndexPage />} />
          <Route path="courses/:courseId" element={<CoursePage />} />
          <Route path="cheatsheet" element={<CheatSheetPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
