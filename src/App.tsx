import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { FloatingObjects } from "./components/FloatingObjects";
import { CustomCursor } from "./components/CustomCursor";
import { CinematicBackground } from "./components/CinematicBackground";
import { LoadingScreen } from "./components/LoadingScreen";

// Pages
import { Landing } from "./pages/Landing";
import { Universe } from "./pages/Universe";
import { ThreeTestPage } from "./pages/ThreeTestPage";
import { CreativeDeveloper } from "./pages/CreativeDeveloper";
import { Relax } from "./pages/Relax/Relax";
import { IslandJourney5Page } from "./pages/IslandJourney5Page";

function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isCreative = location.pathname === "/creative";
  const isRelax = location.pathname === "/relax";
  const isPlayground = location.pathname.startsWith("/playground");
  const isIsland5 = location.pathname === "/island_5";

  if (isPlayground || isIsland5) {
    return (
      <Routes>
        <Route path="/playground/globe" element={<ThreeTestPage />} />
        {isIsland5 && <Route path="/island_5" element={<IslandJourney5Page />} />}
      </Routes>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-transparent selection:bg-accent selection:text-black">
      <LoadingScreen />
      {!isCreative && !isRelax && <CustomCursor />}
      <CinematicBackground />
      {!isLanding && !isRelax && <FloatingObjects />}

      {!isLanding && !isCreative && !isRelax && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/universe" element={<Universe />} />
        <Route path="/creative" element={<CreativeDeveloper />} />
        <Route path="/relax" element={<Relax />} />
      </Routes>
    </main>
  );
}

export default App;

