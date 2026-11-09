import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { FloatingObjects } from "./components/FloatingObjects";
import { CustomCursor } from "./components/CustomCursor";
import { CinematicBackground } from "./components/CinematicBackground";
import { LoadingScreen } from "./components/LoadingScreen";

// Pages
import { Landing } from "./pages/Landing";
import { loadProjects, loadRelax, loadUniverse } from "./utils/routePrefetch";

// Heavy routes are split into their own chunks so the landing page doesn't
// download three.js / R3F / postprocessing up front.
const Universe = lazy(() => loadUniverse().then((m) => ({ default: m.Universe })));
const ThreeTestPage = lazy(() => import("./pages/ThreeTestPage").then((m) => ({ default: m.ThreeTestPage })));
const CreativeDeveloper = lazy(() => import("./pages/CreativeDeveloper").then((m) => ({ default: m.CreativeDeveloper })));
const Projects = lazy(() => loadProjects().then((m) => ({ default: m.Projects })));
const Relax = lazy(() => loadRelax().then((m) => ({ default: m.Relax })));
const IslandJourney5Page = lazy(() => import("./pages/IslandJourney5Page").then((m) => ({ default: m.IslandJourney5Page })));
const Island6Page = lazy(() => import("./pages/Island6Page").then((m) => ({ default: m.Island6Page })));

function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isCreative = location.pathname === "/creative";
  const isRelax = location.pathname === "/relax";
  const isProjects = location.pathname === "/projects";
  const isPlayground = location.pathname.startsWith("/playground");
  const isIsland5 = location.pathname === "/island_5";
  const isIsland6 = location.pathname === "/island_6";

  if (isPlayground || isIsland5 || isIsland6) {
    return (
      <Suspense fallback={null}>
      <Routes>
        <Route path="/playground/globe" element={<ThreeTestPage />} />
        {isIsland5 && <Route path="/island_5" element={<IslandJourney5Page />} />}
        {isIsland6 && <Route path="/island_6" element={<Island6Page />} />}
      </Routes>
      </Suspense>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-transparent selection:bg-accent selection:text-black">
      <LoadingScreen />
      {!isCreative && !isRelax && !isProjects && <CustomCursor />}
      <CinematicBackground />
      {!isLanding && !isRelax && !isProjects && <FloatingObjects />}

      {!isLanding && !isCreative && !isRelax && !isProjects && <Navbar />}

      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/universe" element={<Universe />} />
        <Route path="/creative" element={<CreativeDeveloper />} />
        <Route path="/relax" element={<Relax />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      </Suspense>
    </main>
  );
}

export default App;

